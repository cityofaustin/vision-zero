/**
 * Provides type safety for dot-notated paths to nested Record properties.
 *
 * For example, given a `<Person>` object like `{ info : { name: { first: "john" } } }`,
 * `"info.name.first"` is a valid `Path<Person>`.
 *
 * todo: use a 3rd party solution?
 * e.g. https://github.com/ts-essentials/ts-essentials/tree/master/lib/paths
 */
export type Path<T> =
  T extends Record<string, unknown>
    ? {
        // Map each key to its potential path
        // Filter out non-string keys to ensure template literal compatibility
        [K in keyof T as K extends string ? K : never]: NonNullable<
          T[K]
        > extends Record<string, unknown>
          ? // If the property is another object, create recursive nested paths
            `${K & string}` | `${K & string}.${Path<NonNullable<T[K]>>}`
          : // Max depth reached
            `${K & string}`;
      }[keyof T & string] // Index only string keys from the mapped type
    : never; // Return never for non-object types to prevent invalid usage
