#!/usr/bin/env python
import requests
import os
import logging

from shapely.geometry import shape
import geopandas as gpd

from queries import query_vz, query_moped, truncate_query, publishing_query
from utils import get_logger

# Buffer distance (feet) for the spatial join
BUFFER_DISTANCE = 40

HASURA_ADMIN_SECRET = {
    "moped": os.getenv("MOPED_HASURA_ADMIN_SECRET"),
    "vz": os.getenv("VZ_HASURA_ADMIN_SECRET"),
}
HASURA_ENDPOINT = {
    "moped": os.getenv("MOPED_HASURA_ENDPOINT"),
    "vz": os.getenv("VZ_HASURA_ENDPOINT"),
}


def make_hasura_request(query, secret, endpoint, variables=None):
    """Fetch data from hasura

    Args:
        query (str): the hasura query

    Raises:
        ValueError: If no data is returned

    Returns:
        dict: Hasura JSON response data
    """
    headers = {
        "X-Hasura-Admin-Secret": secret,
        "content-type": "application/json",
    }
    payload = {"query": query, "variables": variables}
    res = requests.post(endpoint, json=payload, headers=headers)
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except KeyError:
        raise ValueError(data)


def load_json_to_df(data, geom_col):
    geom = [shape(i[geom_col]) for i in data]
    gdf = gpd.GeoDataFrame(data, geometry=geom, crs="EPSG:4326")
    return gdf


def chunk_list(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def main():
    # Retrieve all crashes and moped project components
    components = make_hasura_request(
        secret=HASURA_ADMIN_SECRET["moped"],
        endpoint=HASURA_ENDPOINT["moped"],
        query=query_moped,
    )["component_arcgis_online_view"]
    logger.info(f"{len(components)} Moped project components retrieved")

    crashes = make_hasura_request(
        secret=HASURA_ADMIN_SECRET["vz"], endpoint=HASURA_ENDPOINT["vz"], query=query_vz
    )["crashes"]
    logger.info(f"{len(crashes)} crash records retrieved")

    components = load_json_to_df(components, geom_col="geometry")
    crashes = load_json_to_df(crashes, geom_col="position")

    # Transforming to projected coordinates
    # NAD83 / Texas Central (ftUS)
    components = components.to_crs(epsg=2277)
    crashes = crashes.to_crs(epsg=2277)

    # Spatial join
    logger.info(f"Buffering project geometries to a distance of {BUFFER_DISTANCE} feet")
    components["geometry"] = components.geometry.buffer(BUFFER_DISTANCE)
    components.set_index("project_component_id", inplace=True)
    crashes.set_index("id", inplace=True)
    logger.info(f"Joining crashes spatially to project geometry")
    crashes_near_projects = gpd.sjoin(crashes, components, how="inner")

    # Exporting results
    crashes_near_projects.reset_index(inplace=True)
    crashes_near_projects.rename(
        columns={"id": "crash_pk", "index_right": "mopd_proj_component_id"},
        inplace=True,
    )
    crashes_near_projects = crashes_near_projects[
        ["mopd_proj_component_id", "crash_pk"]
    ]
    data = crashes_near_projects.to_dict(orient="records")
    chunks = chunk_list(data, n=5000)

    logger.info(f"Truncating existing lookup table")
    # First, truncate the existing lookup table
    response = make_hasura_request(
        secret=HASURA_ADMIN_SECRET["vz"],
        endpoint=HASURA_ENDPOINT["vz"],
        query=truncate_query,
    )

    # Then, publish the new data
    logger.info(f"Uploading new lookup table")
    rec_published = 0
    for payload in chunks:
        response = make_hasura_request(
            secret=HASURA_ADMIN_SECRET["vz"],
            endpoint=HASURA_ENDPOINT["vz"],
            query=publishing_query,
            variables={"objects": payload},
        )
        rec_published += len(payload)
        logger.info(f"{rec_published} rows uploaded...")


logger = get_logger(
    __name__,
    level=logging.INFO,
)

if __name__ == "__main__":
    main()
