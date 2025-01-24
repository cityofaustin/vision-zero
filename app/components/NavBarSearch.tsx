import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { CRASH_NAV_SEARCH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { useQuery } from "@/utils/graphql";

/**
 * Allows users to search for and route to a crash by
 * typing in its crash id or case id
 */
export default function NavBarSearch() {
  const [searchField, setSearchField] = useState("record_locator");
  const [searchValue, setSearchValue] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);

  const router = useRouter();

  const { data, isLoading } = useQuery<Crash>({
    // only will fetch data once search button has been clicked
    query: searchClicked ? CRASH_NAV_SEARCH : null,
    variables: { searchValue: searchValue },
    typename: searchField,
    // override default config so second search wont navigate to previous crash
    options: {
      keepPreviousData: false,
    },
  });

  // if data has been fetched or search button clicked check if data is valid
  // and route to page, otherwise set invalid state to display user feedback
  useEffect(() => {
    if (searchClicked) {
      if (data?.length === 1) {
        const recordLocator = data?.[0].record_locator;
        router.push(`/crashes/${recordLocator}`);
        setSearchValue("");
        setSearchClicked(false);
      }
    }
  }, [searchClicked, data, router]);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchClicked(true);
  };

  const onSwitchSearchField = () => {
    setSearchField(
      searchField === "record_locator" ? "case_id" : "record_locator"
    );
  };

  // if length is zero that means data was fetched and returned nothing
  const isSearchInvalid = data?.length === 0;

  return (
    <Form onSubmit={onSearch}>
      <Form.Group className="me-4">
        <InputGroup hasValidation>
          <Button onClick={onSwitchSearchField}>
            {searchField === "record_locator" ? "Crash ID" : "Case ID"}
          </Button>
          <Form.Control
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
            Crash not found
          </Form.Control.Feedback>
          <Button type="submit">
            {!isLoading ? <FaMagnifyingGlass /> : <Spinner size="sm" />}
          </Button>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}
