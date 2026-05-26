"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { LookupTableOption } from "@/types/relationships";

interface InputLookupTypeaheadProps<TFieldValues extends FieldValues> {
  options: LookupTableOption[];
  /** Field name */
  name: Path<TFieldValues>;
  /** React Hook Form control */
  control: Control<TFieldValues>;
  /** optional placeholder for input, if not included defaults to "Select..." */
  formPlaceholder?: string;
  /** If input should be disabled */
  disabled?: boolean;
}

/**
 * Typeahead search input to use with Lookup table options
 */
export default function InputLookupTypeahead<TFieldValues extends FieldValues>({
  options,
  formPlaceholder,
  disabled = false,
  name,
  control,
}: InputLookupTypeaheadProps<TFieldValues>) {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const { field } = useController({ name, control });

  useEffect(() => {
    if (field.value) {
      const selectedOption = options.find(
        (option) => option.id === field.value
      );
      setSearchInput(selectedOption?.label ?? "");
    }
  }, [field.value, options]);

  // refine options to only contain search input
  const results = useMemo(
    () =>
      options.filter((item: LookupTableOption) =>
        item.label.toLowerCase().includes(searchInput.toLowerCase())
      ),
    [searchInput, options]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || !results.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev + 1 < results.length ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev - 1 >= 0 ? prev - 1 : results.length - 1
        );
      } else if (e.key === "Enter") {
        const choice = results[highlightedIndex];
        if (choice) {
          e.preventDefault();
          field.onChange(choice.id);
          setShowDropdown(false);
        }
      }
    },
    [highlightedIndex, results, showDropdown, field]
  );


  return (
    <Form.Group className="mb-3">
      <span className="position-relative">
        <Form.Control
          {...field}
          type="search"
          placeholder={formPlaceholder ?? "Select..."}
          disabled={disabled}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setHighlightedIndex(0);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          autoComplete="off"
        />
        {showDropdown && (
          <ul
            className="list-group w-100 mt-1 shadow-sm"
            style={{ maxHeight: "240px", overflowY: "auto" }}
          >
            {results.length === 0 && (
              <li className="list-group-item text-muted">No options</li>
            )}
            {results.map((result: LookupTableOption, index: number) => (
              <li
                key={result.id}
                className={`list-group-item list-group-item-action${
                  index === highlightedIndex ? " active" : ""
                }`}
                role="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  field.onChange(result.id);
                  setShowDropdown(false);
                }}
              >
                {result.label}
              </li>
            ))}
          </ul>
        )}
      </span>
    </Form.Group>
  );
}
