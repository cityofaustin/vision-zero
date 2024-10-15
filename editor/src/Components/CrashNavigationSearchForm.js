import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  InputGroupButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { appCodeName } from "../helpers/environment";

// captures any non-number except the `t` and `T` (for temp crashes)
const CRASH_ID_EXCLUDE_CHARACTERS_REGEX = /[^\dtT]*/g;

const DEFAULT_GLOBAL_SEARCH_FIELD = "cris_crash_id";
const localStorageKey = `${appCodeName}_global_search_field`;

const CrashNavigationSearchForm = () => {
  const [crashSearchId, setCrashSearchId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [globalSearchField, setGlobalSearchField] = useState(
    localStorage.getItem(localStorageKey) || DEFAULT_GLOBAL_SEARCH_FIELD
  );
  let history = useHistory();

  const toggleDropdown = useCallback(
    () => setIsDropdownOpen(prevState => !prevState),
    []
  );

  return (
    <Form className="mr-2" onSubmit={e => e.preventDefault()}>
      <InputGroup>
        <InputGroupButtonDropdown
          size="sm"
          addonType="prepend"
          isOpen={isDropdownOpen}
          toggle={toggleDropdown}
        >
          <DropdownToggle caret color="secondary">
            {globalSearchField === "cris_crash_id" ? "Crash ID" : "Case ID"}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem
              onClick={() => {
                const newGlobalSearchField =
                  globalSearchField === "cris_crash_id"
                    ? "case_id"
                    : "cris_crash_id";
                setGlobalSearchField(newGlobalSearchField);
                localStorage.setItem(localStorageKey, newGlobalSearchField);
              }}
            >
              {globalSearchField === "cris_crash_id" ? "Case ID" : "Crash Id"}
            </DropdownItem>
          </DropdownMenu>
        </InputGroupButtonDropdown>
        <Input
          size="sm"
          type="text"
          name="crash-navigation-search"
          placeholder="Go to..."
          value={crashSearchId}
          onChange={e =>
            globalSearchField === "cris_crash_id"
              ? setCrashSearchId(
                  e.target.value.replace(CRASH_ID_EXCLUDE_CHARACTERS_REGEX, "")
                )
              : setCrashSearchId(e.target.value.trim())
          }
        />
        <InputGroupAddon addonType="append">
          <Button
            type="submit"
            color="secondary"
            disabled={!crashSearchId}
            size="sm"
            onClick={() => {
              history.push(`/crashes/${crashSearchId}`);
              setCrashSearchId("");
            }}
          >
            <i className="fa fa-arrow-right" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Form>
  );
};

export default CrashNavigationSearchForm;
