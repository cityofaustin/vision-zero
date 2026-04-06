import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaCarBurst, FaMagnifyingGlass } from "react-icons/fa6";
import { CRASH_NAV_SEARCH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { Location } from "@/types/locations";
import { useQuery } from "@/utils/graphql";
import DropdownButtonToggle from "@/components/DropdownButtonToggle";
import AlignedLabel from "@/components/AlignedLabel";
import { LuAmbulance, LuChevronDown, LuMapPin } from "react-icons/lu";
import { EMSPatientCareRecord } from "@/types/ems";
import { gql } from "graphql-request";

const CRASH_SEARCH = gql`
  query CrashNavigationSearch($searchValue: String!) {
    record_locator: crashes(
      where: {
        record_locator: { _eq: $searchValue }
        is_deleted: { _eq: false }
      }
    ) {
      id
      record_locator
    }
  }
`;

const CASE_SEARCH = gql`
  query CrashNavigationSearch($searchValue: String!) {
    case_id: crashes(
      where: { case_id: { _eq: $searchValue }, is_deleted: { _eq: false } }
    ) {
      id
      record_locator
    }
  }
`;

const LOCATION_SEARCH = gql`
  query LocationNavigationSearch($searchValue: String!) {
    location_id: locations(
      where: { location_id: { _eq: $searchValue }, is_deleted: { _eq: false } }
    ) {
      location_id
    }
  }
`;

const EMS_INCIDENT_SEARCH = gql`
  query EMSNavigationSearch($searchValue: String!) {
    incident_number: ems__incidents(
      where: {
        incident_number: { _eq: $searchValue }
        is_deleted: { _eq: false }
      }
      limit: 1
    ) {
      incident_number
    }
  }
`;

const navSearchLocalStorageKey = "navBarSearchField";

/**
 * Types that can be used in the search field config
 */
type SearchableTypes = Crash | Location | EMSPatientCareRecord;

/**
 * The serach field config
 */
type SearchField<T extends SearchableTypes = SearchableTypes> = {
  key: string;
  label: string | React.ReactNode;
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
    label: (
      <AlignedLabel>
        <FaCarBurst className="me-2" />
        <span>Case ID</span>
      </AlignedLabel>
    ),
    query: CASE_SEARCH,
    getUrl: (record: Crash) => `/crashes/${record.case_id}`,
  },
  {
    key: "record_locator",
    label: (
      <AlignedLabel>
        <FaCarBurst className="me-2" />
        <span>Crash ID</span>
      </AlignedLabel>
    ),
    query: CRASH_SEARCH,
    getUrl: (record: Crash) => `/crashes/${record.record_locator}`,
  },
  {
    key: "incident_number",
    label: (
      <AlignedLabel>
        <LuAmbulance className="me-2" />
        <span>EMS Incident #</span>
      </AlignedLabel>
    ),
    query: EMS_INCIDENT_SEARCH,
    getUrl: (record: EMSPatientCareRecord) => `/ems/${record.incident_number}`,
  },
  {
    key: "location_id",
    label: (
      <AlignedLabel>
        <LuMapPin className="me-2" />
        <span>Location ID</span>
      </AlignedLabel>
    ),
    query: LOCATION_SEARCH,
    getUrl: (record: Location) => `/locations/${record.location_id}`,
  },
] satisfies AnySearchField[];

const getValidSearchField = (val: string | null): AnySearchField => {
  if (!val) {
    return SEARCH_FIELDS[0];
  }
  const foundSearchField = SEARCH_FIELDS.find(
    (searchField) => searchField.key === val
  );
  return foundSearchField || SEARCH_FIELDS[0];
};

/**e
 * Allows users to search for and route to a crash by
 * typing in its crash id or case id
 */
export default function NavBarSearch() {
  const stored = localStorage.getItem(navSearchLocalStorageKey);
  const [searchField, setSearchField] = useState<AnySearchField>(
    getValidSearchField(stored)
  );
  const [searchValue, setSearchValue] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);

  const router = useRouter();

  const { data, isLoading } = useQuery<SearchableTypes>({
    query: searchClicked ? searchField.query : null,
    variables: { searchValue },
    typename: searchField.key,
    options: { keepPreviousData: false },
  });

  useEffect(() => {
    if (searchClicked && data?.length === 1) {
      // we pass our to get URL as an any, because we know that getUrl
      // the query are from the same type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(searchField.getUrl(data[0] as any));
      setSearchValue("");
      setSearchClicked(false);
    }
  }, [searchClicked, data, router, searchField]);

  useEffect(() => {
    localStorage.setItem(navSearchLocalStorageKey, searchField.key);
  }, [searchField]);

  const onSearch = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchClicked(true);
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
            {!isLoading ? <FaMagnifyingGlass /> : <Spinner size="sm" />}
          </Button>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}
