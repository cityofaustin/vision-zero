# Gets the ID and location of crashes
query_vz = """
    {
      crashes(
        where: {
          position: { _is_null: false },
          is_deleted: { _eq: false },
          is_temp_record: { _eq: false }
        }
      ) {
        id,
        position
      }
    }
"""

# Gets the ID and geometry for every record in the component_arcgis_online_view table
query_moped = """
    {
        component_arcgis_online_view(where: { geometry: { _is_null: false } }) {
            project_component_id,
            geometry,
        }
    }
"""

# Deletes every record in the moped_component_crashes table
truncate_query = """
    mutation DeleteMopedComponentCrashes {
        delete_moped_component_crashes(where: {}) {
          affected_rows
        }
     }
"""

# Publishes and batch of records to the moped_component_crashes table
publishing_query = """
    mutation InsertMopedComponentCrashes($objects: [moped_component_crashes_insert_input!]!) {
      insert_moped_component_crashes(objects: $objects) {
        affected_rows
      }
    }
"""
