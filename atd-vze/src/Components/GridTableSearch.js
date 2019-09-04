import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import {
    Col,
    Button,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupButtonDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
    Alert,
} from "reactstrap";

// TODO add query operators to each field to better fit data types (_eq, etc.)?
const GridTableSearch = ({ query, clearFilters, setSearchParameters }) => {
    const [searchFieldValue, setSearchFieldValue] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [fieldToSearch, setFieldToSearch] = useState("");
    const [isFieldSelected, setIsFieldSelected] = useState(false);

    const fieldsToSearch = query.searchableFields;

    const handleSearchSubmission = e => {
        e.preventDefault();

        setSearchParameters({
            column: fieldToSearch,
            value: searchFieldValue
        });
    };

    const handleClearSearchResults = () => {
        clearFilters();
        setSearchFieldValue("");
        setFieldToSearch("");
        setIsFieldSelected(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleFieldSelect = e => {
        setIsFieldSelected(true);
        setFieldToSearch(e.target.value);
    };

    const getFieldName = (fieldKey) =>{
        return query.getLabel(fieldKey, 'search');
    };


    return (
        <Form className="form-horizontal" onSubmit={handleSearchSubmission}>
            {!isFieldSelected && searchFieldValue && (
                <Alert color="warning">Please provide a field to search.</Alert>
            )}
            <FormGroup row>
                <Col md="6">
                    <InputGroup>
                        <Input
                            type="text"
                            id="input1-group2"
                            name="input1-group2"
                            placeholder={"Enter Search Here..."}
                            value={searchFieldValue}
                            onChange={e => setSearchFieldValue(e.target.value)}
                        />
                        <InputGroupButtonDropdown
                            addonType="prepend"
                            isOpen={isDropdownOpen}
                            toggle={toggleDropdown}
                        >
                            <DropdownToggle caret color="secondary">
                                {fieldToSearch === "" ? "Field" : getFieldName(fieldToSearch)}
                            </DropdownToggle>
                            <DropdownMenu>
                                {fieldsToSearch.map((field, i) => (
                                    <DropdownItem
                                        key={i}
                                        value={field}
                                        onClick={handleFieldSelect}
                                    >
                                        {getFieldName(field)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </InputGroupButtonDropdown>
                        <InputGroupAddon addonType="append">
                            <Button type="submit" color="primary">
                                <i className="fa fa-search" /> Search
                            </Button>
                            <Button
                                type="button"
                                color="danger"
                                onClick={handleClearSearchResults}
                            >
                                <i className="fa fa-ban" /> Clear
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                </Col>
            </FormGroup>
        </Form>
    );
};

export default withApollo(GridTableSearch);
