"use client";

import { useEffect, useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { CRASH_TRANSFER_SEARCH } from "@/queries/crash";
import { useQuery } from "@/utils/graphql";

export type CrashSearchResult = {
  id: number;
  record_locator: string;
  address_display: string | null;
};

interface CrashSearchTypeaheadProps {
  excludeCrashId: number;
  selected: CrashSearchResult | null;
  onSelect: (hit: CrashSearchResult | null) => void;
  disabled?: boolean;
}

/**
 * Typeahead search input for finding crash records by ID or address.
 */
export default function CrashSearchTypeahead({
  excludeCrashId,
  selected,
  onSelect,
  disabled = false,
}: CrashSearchTypeaheadProps) {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!selected) setSearchInput("");
  }, [selected]);

  const searchPattern = useMemo(
    () => (searchInput.trim().length >= 2 ? `%${searchInput.trim()}%` : null),
    [searchInput]
  );

  const { data: searchResults, isLoading: isSearching } =
    useQuery<CrashSearchResult>({
      query: !disabled && searchPattern ? CRASH_TRANSFER_SEARCH : null,
      variables: { searchPattern, currentCrashId: excludeCrashId },
      typename: "crashes",
    });

  const hits = searchResults ?? [];

  return (
    <Form.Group className="mb-3">
      <Form.Label>Transfer data to crash</Form.Label>
      <div className="position-relative">
        <Form.Control
          type="text"
          placeholder="Search by Crash ID or primary address..."
          disabled={disabled}
          value={
            selected
              ? `${selected.record_locator} – ${selected.address_display ?? ""}`
              : searchInput
          }
          onChange={(e) => {
            if (selected) {
              onSelect(null);
            } else {
              setSearchInput(e.target.value);
            }
            setShowDropdown(true);
          }}
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
            {hits.length === 0 && !isSearching && (
              <li className="list-group-item text-muted">No crashes found</li>
            )}
            {hits.map((hit) => (
              <li
                key={hit.id}
                className="list-group-item list-group-item-action"
                role="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(hit);
                  setSearchInput("");
                  setShowDropdown(false);
                }}
              >
                <strong>{hit.record_locator}</strong>
                {hit.address_display && (
                  <span className="text-muted ms-2">
                    {hit.address_display}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Form.Group>
  );
}
