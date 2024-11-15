/**
 * Example of incorporating zod for schema validation
 *
 * not convinced we get a huge benefit from this, considering that
 * that vast majority of db columns are nullable
 */
import { z } from "zod";

// Define column type statically
interface ColumnDefinition<T> {
  name: keyof T;
  type: "number" | "string";
  nullable: boolean;
}

// Manually create Zod schema with helper functions
const authorSchema = z.object({
  id: z.number(),
  name: z.string(),
});

type Author = z.infer<typeof authorSchema>;

// define columns with their reference Type
const columns: ColumnDefinition<Author>[] = [
  { name: "id", type: "number", nullable: false },
  { name: "name", type: "string", nullable: false },
];
