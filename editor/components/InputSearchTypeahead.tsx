"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { KeyboardEvent } from "react";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { CRASH_TRANSFER_SEARCH } from "@/queries/crash"; // also a prop
import { useQuery } from "@/utils/graphql";

type TypeaheadSearchableTypes = CrashSearchResult;

export type CrashSearchResult = {
  // this might become a var passed into here?
  id: number;
  record_locator: string;
  address_display: string | null;
};

interface InputSearchTypeaheadProps {
  excludeCrashId: number;
  label: string;
  formPlaceholder?: string;
  selectedValueFormatter: (selected: TypeaheadSearchableTypes) => string;
  selected: TypeaheadSearchableTypes | null;
  onSelect: (hit: TypeaheadSearchableTypes | null) => void;
  searchResultFormatter: (
    result: TypeaheadSearchableTypes,
    index: number,
    highlightedIndex: number
  ) => React.ReactNode;
  disabled?: boolean;
}

/**
 * Typeahead search input
 */
export default function InputSearchTypeahead({
  excludeCrashId,
  label,
  formPlaceholder,
  selectedValueFormatter,
  selected,
  onSelect,
  searchResultFormatter,
  disabled = false,
}: InputSearchTypeaheadProps) {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    if (!selected) setSearchInput("");
  }, [selected]);

  // Constrain address search by time to reduce result count
  const minCrashTimestamp = useMemo(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return oneYearAgo.toISOString();
  }, []);

  // Search pattern for SQL LIKE query after user has typed at least 2 characters
  const searchPattern = useMemo(
    () => (searchInput.trim().length >= 2 ? `%${searchInput.trim()}%` : null),
    [searchInput]
  );

  const { data: searchResults, isLoading: isSearching } =
    useQuery<CrashSearchResult>({
      query: !disabled && searchPattern ? CRASH_TRANSFER_SEARCH : null,
      variables: {
        searchPattern,
        currentCrashId: excludeCrashId,
        minCrashTimestamp,
      },
      typename: "crashes",
    });

  const results = useMemo(() => searchResults ?? [], [searchResults]);

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
          placeholder={formPlaceholder ?? "search"}
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
          onFocus={() => searchInput.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          autoComplete="off"
        />
        {isSearching && (
          <Spinner
            size="sm"
            className="position-absolute top-50 end-0 translate-middle-y me-2"
          />
        )}
        {showDropdown && searchPattern && !selected && (
          <ul
            className="list-group position-absolute w-100 mt-1 shadow-sm"
            style={{ zIndex: 1050, maxHeight: "240px", overflowY: "auto" }}
          >
            {results.length === 0 && !isSearching && (
              // do we want this to also be a customizable message
              <li className="list-group-item text-muted">No results found</li>
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
                {searchResultFormatter(result, index, highlightedIndex)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Form.Group>
  );
}
