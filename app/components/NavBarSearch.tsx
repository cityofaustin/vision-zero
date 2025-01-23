import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { CRASH_NAV_SEARCH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { useQuery } from "@/utils/graphql";

export default function NavBarSearch() {
  const [searchField, setSearchField] = useState("record_locator");
  const [searchValue, setSearchValue] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const router = useRouter();

  const { data, isLoading } = useQuery<Crash>({
    query: searchClicked ? CRASH_NAV_SEARCH : null,
    variables: { searchTerm: searchValue },
    typename: searchField,
  });

  useEffect(() => {
    if (searchClicked) {
      if (data?.length === 1) {
        const recordLocator = data?.[0].record_locator;
        router.push(`/crashes/${recordLocator}`);
        setSearchValue("");
        setSearchClicked(false);
      } else if (data?.length === 0) {
        setIsInvalid(true);
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

  return (
    <Form onSubmit={onSearch}>
      <Form.Group>
        <InputGroup className="me-4" hasValidation>
          <Button onClick={onSwitchSearchField}>
            {searchField === "record_locator" ? "Crash ID" : "Case ID"}
          </Button>
          <Form.Control
            placeholder="Search..."
            onChange={(e) => {
              setIsInvalid(false);
              setSearchClicked(false);
              setSearchValue(e.target.value.trim());
            }}
            type="search"
            value={searchValue}
            isInvalid={isInvalid}
          />
          <Form.Control.Feedback type="invalid" tooltip>
            Crash not found
          </Form.Control.Feedback>
          <Button type="submit">
            {!isLoading ? <FaMagnifyingGlass /> : <Spinner />}
          </Button>
        </InputGroup>
      </Form.Group>
    </Form>
  );
}
