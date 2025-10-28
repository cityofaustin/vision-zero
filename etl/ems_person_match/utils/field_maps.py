# ems__incidents.mvc_form_position_in_vehicle mapped to lookups.occpnt_pos.label
# values with no match are excluded from this list
EMS_POS_IN_VEHICLE_TO_CRIS_OCC_POS_MAP = {
    "front seat - left side (or motorcycle driver)": "front left or motorcycle driver",
    "front seat - middle": "front center or motorcycle sidecar passenger",
    "front seat - right side": "front right",
    "second seat - left side (or motorcycle passenger)": "second seat left or motorcycle back passenger",
    "second seat - middle": "second seat center",
    "second seat - right side": "second seat right",
    "third row - left side (or motorcycle passenger)": "third seat left",
    "third row - middle": "third seat center",
    "third row - right side": "third seat right",
}


# lookups.mode_category.label to ems__incident.travel_mode mapped
CRIS_MODE_CAT_TO_EMS_TRAVEL_MODE_MAP = {
    "bicycle": "bicycle",
    "pedestrian": "pedestrian",
    "e-scooter": "e-scooter",
    "micromobility device": "e-scooter",
    "passenger car": "motor vehicle",
    "large passenger vehicle": "motor vehicle",
    "motor vehicle – other": "motor vehicle",
    "motorcycle": "motorcycle",
    "other/unknown": None,
    "train": None,
}
