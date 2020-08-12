#!/usr/bin/env python
import json
from unittest.mock import patch
from .json_helper import load_file
from crash_update_noncr3_location.app import *


data_noncr3_insertion_valid = load_file("tests/data/data_noncr3_insertion_valid.json")
data_noncr3_insertion_invalid = load_file("tests/data/data_noncr3_insertion_invalid.json")


class TestUpdateNonCR3Location:
    @classmethod
    def setup_class(cls):
        print("Beginning tests for: TestUpdateNonCR3Location")

    @classmethod
    def teardown_class(cls):
        print("\n\nAll tests finished for: TestUpdateNonCR3Location")

    def test_critical_error_success(self):
        try:
            raise_critical_error(
                message="This is a test",
                data={"Test": "One"},
                exception_type=TypeError
            )
            assert False
        except TypeError:
            assert True

    def test_critical_error_fail(self):
        try:
            raise_critical_error(
                message="",
                data={},
                exception_type=None
            )
            assert False
        except TypeError:
            assert True

    def test_is_insert_valid(self):
        """
        This test should check whether the payload is an insertion
        """
        assert is_insert(data_noncr3_insertion_valid)

    def test_is_insert_invalid(self):
        """
        This test should check whether the function can tell if this is NOT
        an insertion, and should assert False.
        """
        assert is_insert(data_noncr3_insertion_invalid) is False

    def test_is_insert_exception_1(self):
        """
        Test is_insert with an empty dictionary
        """
        try:
            assert is_insert({})
        except KeyError:
            assert True

    def test_is_insert_exception_2(self):
        """
        This is_insert with None value
        """
        try:
            assert is_insert(None)
        except KeyError:
            assert True

    def test_is_crash_mainlane_int_true(self):
        """
        Tests if a crash is mainlane, it should assert True
        """
        assert is_crash_mainlane(170070743)

    def test_is_crash_mainlane_str_true(self):
        """
        Tests if a crash is mainlane, it should assert True
        """
        assert is_crash_mainlane("170070743")

    def test_is_crash_mainlane_false(self):
        """
        Tests if a crash is mainlane, it should assert False
        """
        assert is_crash_mainlane("170070744") is False

    def test_is_crash_mainlane_none(self):
        """
        Tests if a crash is mainlane, it should assert False
        """
        assert is_crash_mainlane(None) is False

    def test_is_crash_mainlane_letters(self):
        """
        Tests if a crash is mainlane, it should assert False
        """
        assert is_crash_mainlane("A123") is False

    def test_get_case_id_true(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_case_id(data_noncr3_insertion_valid) == 1000

    def test_get_case_id_false(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_case_id({"event": {"data": {"new": {"case_id": None}}}}) == None

    def test_get_location_id_true(self):
        """
        Tests if the location id is returned
        """
        assert get_location_id(data_noncr3_insertion_valid) == "SCRAMBLED1234"

    def test_get_location_id_false(self):
        """
        Tests if the location id is returned, tests false
        """
        assert get_location_id({"event": {"data": {"new": {"location_id": None}}}}) == None

    def test_get_location_id_empty(self):
        """
        Tests if the crash id returns None if the record is invalid
        """
        assert get_location_id({}) is None

    def test_get_location_id_none(self):
        """
        Tests if the crash id returns None if the record is invalid
        """
        assert get_location_id(None) is None

    def test_load_data_success(self):
        """
        Tests whether load_data can parse a string into a dictionary
        """
        assert isinstance(load_data("{}"), dict)

    def test_load_data_failure_none(self):
        """
        Tests whether load_data can parse a string into a dictionary
        """
        try:
            assert isinstance(load_data(None), dict)
        except TypeError:
            assert True

    def test_load_data_failure_invalid(self):
        """
        Tests whether load_data can parse a string into a dictionary
        """
        try:
            isinstance(load_data("{'invalid': 'json'}"), dict)
            assert False
        except TypeError:
            assert True

    def test_find_crash_location_true(self):
        """
        Tests whether it can find a location for a crash accurately.
        """
        assert find_crash_location(170070743) == '60BA785CF5'

    def test_find_crash_location_false(self):
        """
        Tests whether it can find a location for a crash accurately.
        """
        assert find_crash_location(170070744) == None

    def test_find_crash_location_none(self):
        """
        Tests if it returns None if the value for crash_id is None
        """
        assert find_crash_location(None) is None

    def test_find_crash_location_nonnumeric(self):
        """
        Tests if the crash_id is not numeric, if not returns None
        """
        assert find_crash_location("ABC123") is None

    def test_find_crash_location_decimal(self):
        """
        Tests if the crash_id is not numeric, if not returns None
        """
        assert find_crash_location("1234.154") is None

    def test_get_noncr3_location_id_not_null(self):
        """
        Tests if the get_noncr3_location_id returns a not null id
        """
        assert get_noncr3_location_id(190360891) == '644AF55CFC'

    def test_get_noncr3_location_id_null(self):
        """
        Tests if the get_noncr3_location_id returns a null id
        """
        assert get_noncr3_location_id(17198925) == None

    def test_get_noncr3_location_id_nonnumeric(self):
        """
        Tests if the get_noncr3_location_id returns a null id
        """
        assert get_noncr3_location_id("ABC1234") == None

    def test_get_noncr3_location_id_decimal(self):
        """
        Tests if the get_noncr3_location_id returns a null id
        """
        assert get_noncr3_location_id(1234.56) == None

    def test_update_location_valid(self):
        """
        Tests if a record can be updated to a new location
        """
        response = update_location(3210, "ABC123456")

        assert isinstance(response, dict)
        assert "status" in response and "response" in response
        assert response["status"] == "Mutation Successful"
        assert get_noncr3_location_id(3210) == "ABC123456"

    def test_update_location_none(self):
        """
        Tests if a record can be updated to a new location
        """
        response = update_location(3210, None)
        assert isinstance(response, dict)
        assert "status" in response and "response" in response
        assert response["status"] == "Mutation Successful"
        assert get_noncr3_location_id(3210) == None

    @patch("crash_update_noncr3_location.app.hasura_request")
    def test_handler_noevents(self, model_mock):
        """
        Tests if the handler fails if events is an empty object
        """
        handler(
            event=None,
            context=None
        )

        model_mock.assert_not_called()

    @patch("crash_update_noncr3_location.app.hasura_request")
    def test_handler_norecords(self, model_mock):
        """
        Tests whether the handler executes hasura_request
        if there are no records in the array.
        """
        handler(
            event={"Records": []},
            context=None
        )

        model_mock.assert_not_called()

    @patch("crash_update_noncr3_location.app.hasura_request")
    def test_handler_empty_body(self, model_mock):
        """
        Tests if the handler runs hasura_request even if
        there is an empty body.
        """
        handler(
            event={"Records": [{"body": ""}]},
            context=None
        )

        model_mock.assert_called_once()

    @patch("crash_update_noncr3_location.app.raise_critical_error")
    def test_handler_critical_body_empty(self, model_mock):
        """
        Tests if hasura_request will raise a critical error.
        """
        handler(
            event={"Records": [{"body": ""}]},
            context=None
        )

        model_mock.assert_called()

    @patch("crash_update_noncr3_location.app.raise_critical_error")
    def test_handler_critical_body_none(self, model_mock):
        """
        Tests whether the handler fails when provided an
        empty record, hasura_request would raise it.
        """
        handler(
            event={"Records": [{"body": None}]},
            context=None
        )

        model_mock.assert_called()

    @patch("crash_update_noncr3_location.app.raise_critical_error")
    def test_handler_critical_nonparsable(self, model_mock):
        """
        Tests if the handler fails when passing an non-parsable json string.
        """
        handler(
            event={"Records": [{"body": "{'not':'json'}"}]},
            context=None
        )

        model_mock.assert_called()

    @patch("crash_update_noncr3_location.app.raise_critical_error")
    def test_handler_critical_missing_crash_id(self, model_mock):
        """
        Tests if the handler fails if no crash_id is provided.
        """
        handler(
            event={"Records": [{"body": json.dumps(
                {

                    "event": {
                        "session_variables": {
                            "x-hasura-role": "admin"
                        },
                        "op": "INSERT",
                        "data": {
                            "old": None,
                            "new": {
                                "no_crash_id": 1234
                            }
                        }
                    }

                }
            )}]},
            context=None
        )

        model_mock.assert_called()

    @patch("crash_update_noncr3_location.app.hasura_request")
    def test_handler_valid_crash_id(self, model_mock):
        """
        Tests if the handler works if a valid crash_id is provided.
        """
        handler(
            event={"Records": [{"body": json.dumps(
                {

                    "event": {
                        "session_variables": {
                            "x-hasura-role": "admin"
                        },
                        "op": "INSERT",
                        "data": {
                            "old": None,
                            "new": {
                                "crash_id": 1234
                            }
                        }
                    }

                }
            )}]},
            context=None
        )

        model_mock.assert_called_once()

    def test_hasura_request_invalid_json(self):
        """
        Tests whether hasura_request fails to parse an invalid json
        """
        try:
            hasura_request(
                record="{'invalid': 'json'}"
            )
            assert False
        except TypeError:
            assert True

    def test_hasura_request_no_record(self):
        """
        Tests whether hasura_request fails to parse an invalid json
        """
        try:
            hasura_request(
                record=None
            )
            assert False
        except TypeError:
            assert True

    def test_hasura_request_valid_record_invalid_body(self):
        """
        Tests whether hasura_request fails to parse an invalid json
        """
        try:
            hasura_request(
                record=json.dumps(data_noncr3_insertion_invalid)
            )
            assert False
        except Exception:
            assert True

    def test_hasura_request_valid_body_invalid_crash_id(self):
        """
        Tests whether hasura_request fails to parse an invalid json
        """
        data = load_file("tests/data/data_noncr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": None,
        }
        try:
            hasura_request(
                record=json.dumps(data)
            )
            assert False
        except Exception:
            assert True

    @patch("crash_update_noncr3_location.app.get_location_id")
    def test_hasura_request_get_location_id_called(self, get_location_id):
        """
        Tests whether hasura_request calls get_location_id
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "case_id": -10234,
                "location_id": None,
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        get_location_id.assert_called_once()

    @patch("crash_update_noncr3_location.app.find_crash_location")
    def test_hasura_request_find_crash_location_not_called(self, find_crash_location):
        """
        Makes sure hasura_request does not call find_crash_location
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "case_id": 170070743,
                "location_id": None,
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        find_crash_location.assert_not_called()

    @patch("crash_update_noncr3_location.app.update_location")
    def test_hasura_request_update_location_not_called(self, update_location):
        """
        Makes sure hasura_request does not call update_location
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "case_id": 190360891,  # Not a main-lane
                "location_id": "644AF55CFC",  # It has a location
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        update_location.assert_not_called()

    @patch("crash_update_noncr3_location.app.update_location")
    def test_hasura_request_update_location_double_null(self, update_location):
        """
        Makes sure hasura_request does not call update_location
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "case_id": 190360890,  # Neither main-lane
                "location_id": None,  # or location available
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        update_location.assert_not_called()

    @patch("crash_update_noncr3_location.app.update_location")
    def test_hasura_request_update_location_called(self, update_location):
        """
        Makes sure hasura_request calls update_location
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "case_id": 190360891,
                "location_id": None,
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        update_location.assert_called()
