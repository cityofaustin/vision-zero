"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { KeyboardEvent } from "react";
import Form from "react-bootstrap/Form";
import { LookupTableOption } from "@/types/relationships";

type TypeaheadSearchableTypes = LookupTableOption;

export type CrashSearchResult = {
  // this might become a var passed into here?
  id: number;
  record_locator: string;
  address_display: string | null;
};

interface InputSearchTypeaheadProps {
  options: LookupTableOption[];
  label: string;
  formPlaceholder?: string;
  selectedValueFormatter: (selected: TypeaheadSearchableTypes) => string;
  selected: TypeaheadSearchableTypes | null;
  onSelect: (hit: TypeaheadSearchableTypes | null) => void;
  optionFormatter: (result: TypeaheadSearchableTypes) => React.ReactNode;
  disabled?: boolean;
}

/**
 * Typeahead search input
 */
export default function InputSearchTypeahead({
  label,
  options,
  formPlaceholder,
  selectedValueFormatter,
  selected,
  onSelect,
  optionFormatter,
  disabled = false,
}: InputSearchTypeaheadProps) {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    if (!selected) setSearchInput("");
  }, [selected]);

  // Search pattern for SQL LIKE query after user has typed at least 2 characters
  const searchPattern = useMemo(
    () => (searchInput.trim().length >= 2 ? `%${searchInput.trim()}%` : null),
    [searchInput]
  );

  //const results = useMemo(() => searchResults ?? [], [searchResults]);
  const results = useMemo(() => {
    return options.filter((item) =>
      item.label.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput, options]);

  console.log(options, results);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || selected || !results.length) return;

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
          onSelect(choice);
          setSearchInput("");
          setShowDropdown(false);
        }
      }
    },
    [highlightedIndex, onSelect, results, selected, showDropdown]
  );

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <div className="position-relative">
        <Form.Control
          type="text"
          placeholder={formPlaceholder ?? "Search"}
          disabled={disabled}
          value={selected ? selectedValueFormatter(selected) : searchInput}
          onChange={(e) => {
            if (selected) {
              onSelect(null);
            } else {
              setSearchInput(e.target.value);
              setHighlightedIndex(0);
            }
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          autoComplete="off"
        />
        {showDropdown && !selected && (
          <ul
            className="list-group position-absolute w-100 mt-1 shadow-sm"
            style={{ zIndex: 1050, maxHeight: "240px", overflowY: "auto" }}
          >
            {results.length === 0 && (
              <li className="list-group-item text-muted">No options</li>
            )}
            {results.map((result, index) => (
              <li
                key={result.id}
                className={`list-group-item list-group-item-action${
                  index === highlightedIndex ? " active" : ""
                }`}
                role="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(result);
                  setSearchInput("");
                  setShowDropdown(false);
                }}
              >
                {optionFormatter(result)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Form.Group>
  );
}
