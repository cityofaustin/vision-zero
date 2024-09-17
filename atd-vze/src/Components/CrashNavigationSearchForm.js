import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Form, Input, InputGroup, InputGroupAddon, Button } from "reactstrap";

// captures any non-number except the `t` and `T` (for temp crashes)
const CRASH_ID_EXCLUDE_CHARACTERS_REGEX = /[^\dtT]*/g;

const CrashNavigationSearchForm = () => {
  const [crashSearchId, setCrashSearchId] = useState("");
  let history = useHistory();

  return (
    <Form className="mr-2" onSubmit={e => e.preventDefault()}>
      <InputGroup>
        <Input
          size="sm"
          type="text"
          name="crash-navigation-search"
          placeholder={"Go to crash..."}
          value={crashSearchId}
          onChange={e =>
            setCrashSearchId(
              e.target.value.replace(CRASH_ID_EXCLUDE_CHARACTERS_REGEX, "")
            )
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
