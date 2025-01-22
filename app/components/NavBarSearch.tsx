import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { CRASH_NAV_SEARCH } from "@/queries/crash";
import { useQuery } from "@/utils/graphql";
import { useState } from "react";
import { Crash } from "@/types/crashes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NavBarSearch() {
  const [searchField, setSearchField] = useState("record_locator");
  const [searchValue, setSearchValue] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);

  const router = useRouter();

  const { data, error, refetch, isValidating } = useQuery<Crash>({
    query: searchClicked ? CRASH_NAV_SEARCH : null,
    variables: { searchTerm: searchValue },
    typename: searchField,
  });

  useEffect(() => {
    if (!!data && searchClicked) {
      const recordLocator = data[0].record_locator;
      router.push(`/crashes/${recordLocator}`);
      setSearchClicked(false);
    }
  }, [data, searchClicked, router]);

  const onSearch = () => {
    setSearchClicked(true);
  };

  const onSwitchSearchField = () => {
    setSearchField(
      searchField === "record_locator" ? "case_id" : "record_locator"
    );
  };

  return (
    <InputGroup className="me-4">
      <Button onClick={onSwitchSearchField}>
        {searchField === "record_locator" ? "Crash ID" : "Case ID"}
      </Button>
      <Form.Control
        placeholder="Search..."
        onChange={(e) => {
          setSearchValue(e.target.value.trim());
        }}
      />
      <Button onClick={onSearch}>
        <FaMagnifyingGlass />
      </Button>
    </InputGroup>
  );
}
