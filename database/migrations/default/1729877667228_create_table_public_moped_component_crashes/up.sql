CREATE TABLE "public"."moped_component_crashes" (
    "crash_pk" INTEGER NOT NULL,
    "mopd_proj_component_id" INTEGER NOT NULL,
    PRIMARY KEY ("crash_pk", "mopd_proj_component_id"),
    FOREIGN KEY ("crash_pk") REFERENCES "public"."crashes"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE "public"."moped_component_crashes" IS E'This table enables crashes to be linked with their associated moped project components.';