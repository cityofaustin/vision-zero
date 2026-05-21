"use client";

import { useMemo, useState, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { useController, Control, FieldValues } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { LookupTableOption } from "@/types/relationships";
import { ContribFormValues } from "./ContributingFactorsModal";

interface InputLookupTypeaheadProps<TFieldValues extends FieldValues> {
  options: LookupTableOption[];
  formPlaceholder?: string;
  disabled?: boolean;
  name: string;
  control: Control<TFieldValues>;
}

/**
 * Typeahead search input
 */
export default function InputLookupTypeahead({
  options,
  formPlaceholder,
  disabled = false,
  name,
  control,
}: InputLookupTypeaheadProps<ContribFormValues>) {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const { field } = useController({ name, control });

  console.log(name, field.value);

  //   const findOptionById = (options, field.value) => {
  //   return options?.find((option) => option?.id === id);
  // };

  // console.log(options.find((option) => option.id === field.value));

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
          setSearchInput(choice.label);
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
          type="text"
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
            className="list-group position-absolute w-100 mt-1 shadow-sm"
            style={{ zIndex: 1050, maxHeight: "240px", overflowY: "auto" }}
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
                  setSearchInput(result.label);
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
