"use client";

import { useMemo, useState, useCallback } from "react";
import type { KeyboardEvent } from "react";
import Form from "react-bootstrap/Form";
import { LookupTableOption } from "@/types/relationships";

type TypeaheadSearchableTypes = LookupTableOption;

interface InputSearchTypeaheadProps {
  options: LookupTableOption[];
  formPlaceholder?: string;
  onSelect: (hit: TypeaheadSearchableTypes | null) => void;
  disabled?: boolean;
}

/**
 * Typeahead search input
 */
export default function InputSearchTypeahead({
  options,
  formPlaceholder,
  onSelect,
  disabled = false,
}: InputSearchTypeaheadProps) {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  //const results = useMemo(() => searchResults ?? [], [searchResults]);
  const results = useMemo(() => {
    return options.filter((item) =>
      item.label.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput, options]);

  console.log(options, results);

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
          onSelect(choice);
          setSearchInput("");
          setShowDropdown(false);
        }
      }
    },
    [highlightedIndex, onSelect, results, showDropdown]
  );

  return (
    <Form.Group className="mb-3">
      <div className="position-relative">
        <Form.Control
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
                {result.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Form.Group>
  );
}
