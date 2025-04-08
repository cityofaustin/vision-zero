import { z } from "zod";
import { TZDate } from "@date-fns/tz";

/**
 * This is a 4x4 decimal degree bounding box centered on the tx state
 * capitol building
 * */
const ATX_BBOX = {
  latitude: {
    min: 28.2747,
    max: 32.2747,
  },
  longitude: {
    min: -99.7404,
    max: -95.7404,
  },
};

/**
 * Validation schema for a non-CR3 record uploaded through the UI
 */
export const NonCr3UploadSchema = z.object({
  case_timestamp: z
    .string()
    .refine(
      (val) => {
        // expected format: YYYY-MM-DD H:MM:SS or YYYY-MM-DD HH:MM:SS
        const regex = /^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}:\d{2}$/;
        return regex.test(val);
      },
      {
        message:
          "Case timestamp must be in format YYYY-MM-DD HH:MM:SS or YYYY-MM-DD H:MM:SS",
      }
    )
    .transform((datestring) => {
      const [datePart, timePart] = datestring.split(" ");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);

      /**
       * We cannot construct the date as TZDate(datestring, "America/Chicago") because this will
       * interpret the input datestring as being in local/system time
       */
      const chicagoDate = new TZDate(
        year,
        month - 1,
        day,
        hours,
        minutes,
        seconds,
        0,
        "America/Chicago"
      );
      return chicagoDate.toISOString();
    }),
  case_id: z.string().regex(/^\d+$/, "Case ID is missing or invalid"),
  address: z
    .string()
    /**
     * Remove all characters except letters, digits, whitespace, and these: `\/-.,&`.
     */
    .transform((val) => val.replace(/[^A-Za-z0-9\\/\-\s.,&]/g, ""))
    .refine((value) => value.trim() !== "", {
      message: "Address is missing or invalid",
    }),
  longitude: z.preprocess(
    (val) => (val ? Number(val) : null),
    z.number({
        invalid_type_error: "Longitude is required and must be a number",
      })
      .min(ATX_BBOX.longitude.min, {
        message: `Longitude is less than the minimum bounds (${ATX_BBOX.longitude.min})`,
      })
      .max(ATX_BBOX.longitude.max, {
        message: `Longitude is greater than the maximum bounds (${ATX_BBOX.longitude.max})`,
      })
  ),
  latitude: z.preprocess(
    (val) => (val ? Number(val) : null),
    z.number({
        invalid_type_error: "Latitude is required and must be a number",
      })
      .min(ATX_BBOX.latitude.min, {
        message: `Latitude is less than the minimum bounds (${ATX_BBOX.latitude.min})`,
      })
      .max(ATX_BBOX.latitude.max, {
        message: `Latitude is greater than the maximum bounds (${ATX_BBOX.latitude.max})`,
      })
  ),
});

/**
 * Type for a non-CR3 record uploaded through the UI -
 * this type is inferred from the Zod schema
 */
export type NonCr3Upload = z.infer<typeof NonCr3UploadSchema>;

/**
 * Validation function which checks for duplicate `case_ids`
 */
const noDuplicateCaseIds = (array: NonCr3Upload[]) => {
  const caseIds = new Set();
  return !array.some((item) => {
    if (caseIds.has(item.case_id)) {
      return true;
    }
    caseIds.add(item.case_id);
    return false;
  });
};

/**
 * Adds a dupe case ID test to the NonCr3Upload schema
 */
export const NonCr3UploadDedupedSchema = z
  .array(NonCr3UploadSchema)
  .refine(noDuplicateCaseIds, "Duplicate case IDs (case_id) detected");

/**
 * Non-CR3 validation error object
 */
export type NonCr3ValidationError = {
  rowNumber: number;
  fieldName: string;
  message: string;
};
