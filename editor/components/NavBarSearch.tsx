import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth0 } from "@auth0/auth0-react";
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
import { ADMIN_EDIT_ROLES, hasRole, HasuraUserRoleName } from "@/utils/auth";

const navSearchLocalStorageKey = "navBarSearchField";

const userEventName = "navbar_search";

/**
 * Types that can be used in the search field config
 */
type SearchableTypes = Crash | Location | EMSPatientCareRecord;

/**
 * The search field config
 */
type SearchField<T extends SearchableTypes = SearchableTypes> = {
  key: string;
  label: string;
  query: string;
  getUrl: (record: T) => string;
  allowedRoles?: HasuraUserRoleName[];
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
    allowedRoles: ADMIN_EDIT_ROLES,
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
 * arbitrary key string from local storage
 * @param key
 * @param fields - the permission-filtered fields to search/fall back within
 * @returns
 */
const getValidSearchField = (
  key: string | null,
  fields: AnySearchField[]
): AnySearchField => {
  if (!key) {
    return fields[0];
  }
  const foundSearchField = fields.find(
    (searchField) => searchField.key === key
  );
  return foundSearchField || fields[0];
};

const subscribeToNavSearchStorage = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
};

const getNavSearchStorageSnapshot = () =>
  localStorage.getItem(navSearchLocalStorageKey);

/**
 * Allows users to search for and route to various record types
 * by typing in an ID
 */
export default function NavBarSearch() {
  const storedSearchKey = useSyncExternalStore(
    subscribeToNavSearchStorage,
    getNavSearchStorageSnapshot,
    () => null
  );
  const { user } = useAuth0();
  const visibleSearchFields = SEARCH_FIELDS.filter(
    (field) => !field.allowedRoles || hasRole(field.allowedRoles, user)
  );
  const [searchFieldOverride, setSearchFieldOverride] =
    useState<AnySearchField | null>(null);
  const searchField =
    searchFieldOverride ??
    getValidSearchField(storedSearchKey, visibleSearchFields);
  const [searchValue, setSearchValue] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const logUserEvent = useLogUserEvent();

  const router = useRouter();

  const { data, isLoading } = useQuery<SearchableTypes>({
    query: searchClicked ? searchField.query : null,
    variables: { searchValue },
    typename: searchField.key,
    options: { keepPreviousData: false },
  });

  // When a unique match arrives, prepare navigation during render (React-recommended)
  if (searchClicked && data?.length === 1 && !pendingRoute) {
    const matchedRecord = data[0] as Crash & Location & EMSPatientCareRecord;
    setPendingRoute(searchField.getUrl(matchedRecord));
    setSearchValue("");
    setSearchClicked(false);
  }

  // Navigate as an effect — router is an external system
  useEffect(() => {
    if (!pendingRoute) return;
    router.push(pendingRoute);
  }, [pendingRoute, router]);

  /**
   * Keep the selected search field key in sync w/ local storage
   */
  useEffect(() => {
    localStorage.setItem(navSearchLocalStorageKey, searchField.key);
  }, [searchField]);

  const onSearch = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPendingRoute(null);
    setSearchClicked(true);
    logUserEvent(`${userEventName}_${searchField.key}`);
  };

  const onSelectSearchField = (field: AnySearchField) => {
    setSearchFieldOverride(field);
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
              {visibleSearchFields.map((searchFieldOption) => (
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
              setPendingRoute(null);
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
