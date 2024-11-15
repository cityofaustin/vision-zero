/**
 * Example of incorporating zod for type generation.
 *
 * This is a pattern we might follow if we want to wrap our
 * Hasura api calls in schema validation.
 *
 * Basically, we define our core types (crashes, units, etc)
 * in zod terms, and let zod generate (infer) the
 * the types for us.
 * 
 * At runtime, we would use the zod schema to validate api calls,
 * and during development we have typechecking in sync with
 * what zod is validating.
 */
import { z } from "zod";

// Manually create Zod schema with helper functions
const authorSchema = z.object({
  id: z.number(),
  name: z.string(),
});

type Author = z.infer<typeof authorSchema>;

// Define column type statically
interface ColumnDefinition<T> {
  name: keyof T;
  type: "number" | "string";
  nullable: boolean;
}

// define columns with their reference Type
const columns: ColumnDefinition<Author>[] = [
  { name: "id", type: "number", nullable: false },
  { name: "name", type: "string", nullable: false },
];
