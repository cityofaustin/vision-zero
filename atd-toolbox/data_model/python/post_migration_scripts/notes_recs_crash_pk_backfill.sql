-- Backfill crash notes with the crash_pk
UPDATE
  crash_notes
SET
  crash_pk=crashes.id
FROM
  crashes
WHERE
  crash_notes.atd_txdot_crashes_crash_id=crashes.cris_crash_id;

-- Backfill crash recommendations with the crash_pk
UPDATE
  recommendations
SET
  crash_pk=crashes.id
FROM
  crashes
WHERE
  recommendations.atd_txdot_crashes_crash_id=crashes.cris_crash_id;
