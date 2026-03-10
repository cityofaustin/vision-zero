from xgboost import XGBClassifier
import pandas as pd


df = pd.read_csv("unmatched_minor_injuries.csv")

features = [
    "geo_distance",
    "age_distance",
    "transport_similarity",
    "address_similarity",
    "timestamp_distance_minutes",
    "is_sex_match",
    "is_case_id_match",
    "is_ethnicity_match",
    "is_inj_sev_match",
    "is_position_match",
    "is_mode_match",
    "is_transport_dest_match",
    "people_count_diff",
    "injury_count_diff",
]

# I used these filters for training but I will leave them out for now.
# df = df[df["geo_distance"] <= 2500]
# df = df[df["timestamp_distance_minutes"] <= 60 * 3]

# Converting bool -> int
bool_cols = df.select_dtypes(include='bool').columns.tolist()
for col in bool_cols:
    df[col] = df[col].astype(int)



X = df[features]

model = XGBClassifier()
model.load_model("model.json")


y_pred = model.predict(X)
y_proba= model.predict_proba(X)[:, 1]


results = X.copy()
results["id"] = df["id"]
results["cris_crash_id"] = df["cris_crash_id"]
results["ems_incident_number"] = df["ems_incident_number"]
results["is_high_quality_match"] = df["is_high_quality_match"]
results["is_match_reviewed_by_vz_staff"] = df["is_match_reviewed_by_vz_staff"]
results["matched_to_person_id"] = df["matched_to_person_id"]
results["cris_person_id"] = df["cris_person_id"]
results['predicted_probability'] = y_proba
results['predicted_label'] = y_pred

results["confidence_score"] = results.apply(
    lambda row: row["predicted_probability"] if row["predicted_label"] == 1 else 1 - row["predicted_probability"],
    axis=1
)


best_predictions = (
    results.loc[results.groupby("id")["predicted_label"].idxmax()]
    .reset_index(drop=True)
)

best_predictions = best_predictions[best_predictions["predicted_label"] == 1]

best_predictions.to_csv("best_predicted_matches_ems_id.csv", index=False)
results.to_csv("all_possible_matches.csv", index=False)