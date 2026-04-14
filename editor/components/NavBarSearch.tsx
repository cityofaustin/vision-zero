import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import DropdownButtonToggle from "@/components/DropdownButtonToggle";
import AlignedLabel from "@/components/AlignedLabel";
import { CRASH_NAV_SEARCH, CASE_NAV_SEARCH } from "@/queries/crash";
import { LOCATION_NAV_SEARCH } from "@/queries/location";
import { EMS_INCIDENT_NAV_SEARCH } from "@/queries/ems";
import { Crash } from "@/types/crashes";
import { EMSPatientCareRecord } from "@/types/ems";
import { Location } from "@/types/locations";
import { useQuery } from "@/utils/graphql";
import { useLogUserEvent } from "@/utils/userEvents";

const navSearchLocalStorageKey = "navBarSearchField";

const userEventName = "navbar_search";

/**
 * Types that can be used in the search field config
 */
type SearchableTypes = Crash | Location | EMSPatientCareRecord;

/**
 * The serach field config
 */
type SearchField<T extends SearchableTypes = SearchableTypes> = {
  key: string;
  label: string;
  query: string;
  getUrl: (record: T) => string;
};

/**
 * This union lets us pass Search<some-type> around in state and handlers
 */
type AnySearchField =
  | SearchField<Crash>
  | SearchField<Location>
  | SearchField<EMSPatientCareRecord>;

const SEARCH_FIELDS = [
  {
    key: "case_id",
    label: "Case ID",
    query: CASE_NAV_SEARCH,
    getUrl: (record: Crash) => `/crashes/${record.record_locator}`,
  },
  {
    key: "record_locator",
    label: "Crash ID",
    query: CRASH_NAV_SEARCH,
    getUrl: (record: Crash) => `/crashes/${record.record_locator}`,
  },
  {
    key: "incident_number",
    label: "EMS Incident #",
    query: EMS_INCIDENT_NAV_SEARCH,
    getUrl: (record: EMSPatientCareRecord) => `/ems/${record.incident_number}`,
  },
  {
    key: "location_id",
    label: "Location ID",
    query: LOCATION_NAV_SEARCH,
    getUrl: (record: Location) => `/locations/${record.location_id}`,
  },
] satisfies AnySearchField[];

/**
 * Find a search field config from an input key - it's a safe way to handle an
 * abritrary key string from local storage
 * @param val
 * @returns
 */
const getValidSearchField = (key: string | null): AnySearchField => {
  if (!key) {
    return SEARCH_FIELDS[0];
  }
  const foundSearchField = SEARCH_FIELDS.find(
    (searchField) => searchField.key === key
  );
  return foundSearchField || SEARCH_FIELDS[0];
};

/**e
 * Allows users to search for and route to a crash by
 * typing in its crash id or case id
 */
export default function NavBarSearch() {
  const [searchField, setSearchField] = useState<AnySearchField>(
    getValidSearchField(null)
  );
  const [searchValue, setSearchValue] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const logUserEvent = useLogUserEvent();

  const router = useRouter();

  const { data, isLoading } = useQuery<SearchableTypes>({
    query: searchClicked ? searchField.query : null,
    variables: { searchValue },
    typename: searchField.key,
    options: { keepPreviousData: false },
  });

  useEffect(() => {
    if (searchClicked && data?.length === 1) {
      // we are casting our matchedRecord to bypass TS headaches. we have to
      // trust that are queries are returning the objects we think they are
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchedRecord = data[0] as Crash & Location & EMSPatientCareRecord;
      const route = searchField.getUrl(matchedRecord);
      router.push(route);
      setSearchValue("");
      setSearchClicked(false);
    }
  }, [searchClicked, data, router, searchField]);

  /**
   * On init, check local storage for search key and use it
   */
  useEffect(() => {
    const searchKeyFromLocalStorage = localStorage.getItem(
      navSearchLocalStorageKey
    );
    if (searchKeyFromLocalStorage) {
      setSearchField(getValidSearchField(searchKeyFromLocalStorage));
    }
  }, []);

  /**
   * Keep the selected search field key in sync w/ local storage
   */
  useEffect(() => {
    localStorage.setItem(navSearchLocalStorageKey, searchField.key);
  }, [searchField]);

  const onSearch = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchClicked(true);
    logUserEvent(`${userEventName}_${searchField.key}`);
  };

  const onSelectSearchField = (field: AnySearchField) => {
    setSearchField(field);
    setSearchClicked(false);
  };

  const isSearchInvalid = data?.length === 0;
  const searchError = `${searchField.label} not found`;

  return (
    <Form onSubmit={onSearch}>
      <Form.Group className="me-4">
        <InputGroup hasValidation>
          <Dropdown as={InputGroup.Text} className="p-0">
            <Dropdown.Toggle
              as={DropdownButtonToggle}
              id="nav-search-field-toggle"
              className="input-group-text"
            >
              <AlignedLabel>
                <span className="me-2">{searchField.label}</span>
                <LuChevronDown />
              </AlignedLabel>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {SEARCH_FIELDS.map((searchFieldOption) => (
                <Dropdown.Item
                  key={searchFieldOption.key}
                  active={searchFieldOption.key === searchField.key}
                  className={
                    searchFieldOption.key === searchField.key
                      ? "text-white"
                      : "text-primary"
                  }
                  onClick={() => onSelectSearchField(searchFieldOption)}
                >
                  {searchFieldOption.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Control
            size="sm"
            placeholder="Search..."
            onChange={(e) => {
              setSearchClicked(false);
              setSearchValue(e.target.value.trim());
            }}
            type="search"
            value={searchValue}
            isInvalid={isSearchInvalid}
          />
          <Form.Control.Feedback type="invalid" tooltip>
            {searchError}
          </Form.Control.Feedback>
          <Button type="submit" size="sm" disabled={!searchValue}>
            {!isLoading ? <LuSearch className="fs-5" /> : <Spinner size="sm" />}
          </Button>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}
