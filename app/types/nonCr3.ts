import { z } from "zod";

/**
 * Validation schema for a non-CR3 record uploaded through the UI
 */
export const nonCr3UploadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is missing or invalid"),
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
  longitude: z.coerce
    .number()
    .min(-99.7404, {
      message: `Longitude is less than the minimum bounds (${-99.7404})`,
    })
    .max(-95.7404, {
      message: `Longitude is greater than the maximum bounds (${-95.7404})`,
    }),
  latitude: z.coerce
    .number()
    .min(28.2747, {
      message: `Latitude is less than the maximum bounds (${28.2747})`,
    })
    .max(32.2747, {
      message: `Latitude is greater than the maximum bounds (${32.2747})`,
    }),
  hour: z.coerce.number().int().min(0).max(23, "Hour must be between 0 and 23"),
});

/**
 * Type for a non-CR3 record uploaded through the UI -
 * this type is inferred from the Zod schema
 */
export type NonCr3Upload = z.infer<typeof nonCr3UploadSchema>;

/**
 * Non-CR3 validation error object
 */
export type NonCr3ValidationError = {
  rowNumber: number;
  fieldName: string;
  message: string;
};
