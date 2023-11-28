import requests


# 🙏🏻 https://github.com/cityofaustin/atd-moped/blob/main/moped-toolbox/amd_milestones_backfill/utils.py#L18


def make_hasura_request(*, query, variables={}, endpoint, admin_secret):
    print("Endpoint: ", endpoint)
    headers = {"X-Hasura-Admin-Secret": admin_secret}
    payload = {"query": query, "variables": variables}
    res = requests.post(endpoint, json=payload, headers=headers)
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except KeyError:
        raise ValueError(data)
