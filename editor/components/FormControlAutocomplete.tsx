"use client";

import { useMemo, useState, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { LookupTableOption } from "@/types/relationships";

interface FormControlAutocomplete<TFieldValues extends FieldValues> {
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
export default function FormControlAutocomplete<
  TFieldValues extends FieldValues,
>({
  options,
  formPlaceholder,
  disabled = false,
  name,
  control,
}: FormControlAutocomplete<TFieldValues>) {
  const [searchInput, setSearchInput] = useState<null | string>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const { field } = useController({ name, control });

  const selectedOptionLabel =
    options.find((option) => option.id === field.value)?.label ?? "";

  // refine options to only contain search input
  const results = useMemo(() => {
    if (searchInput && searchInput.length > 0) {
      return options.filter((item: LookupTableOption) =>
        item.label.toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    return options;
  }, [searchInput, options]);

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
          setSearchInput(choice.label);
        }
      }
    },
    [highlightedIndex, results, showDropdown, field]
  );

  return (
    <Form.Group className="mb-3 position-relative">
      <Form.Control
        {...field}
        type="search"
        placeholder={formPlaceholder ?? "Select..."}
        disabled={disabled}
        value={searchInput ?? selectedOptionLabel}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setHighlightedIndex(0);
          setShowDropdown(true);
          if (e.target.value === "") {
            field.onChange(null);
          }
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => {
          setShowDropdown(false);
          field.onBlur();
          setSearchInput(null);
        }}
        autoComplete="off"
      />
      {showDropdown && (
        <ListGroup
          className="list-group w-100 mt-1 shadow-sm position-absolute"
          style={{ zIndex: 100, maxHeight: "240px", overflowY: "auto" }}
        >
          {results.length === 0 && (
            <ListGroup.Item className="list-group-item text-muted">
              No options
            </ListGroup.Item>
          )}
          {results.map((result: LookupTableOption, index: number) => (
            <ListGroup.Item
              key={result.id}
              className={`list-group-item list-group-item-action${
                index === highlightedIndex ? " active" : ""
              }`}
              role="button"
              onMouseDown={(e) => {
                e.preventDefault();
                field.onChange(result.id);
                setShowDropdown(false);
                setSearchInput(result.label);
              }}
            >
              {result.label}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Form.Group>
  );
}
