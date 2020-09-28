#!/usr/bin/env python
import json
from unittest.mock import patch
from .json_helper import load_file
from crash_update_jurisdiction.app import *


data_cr3_insertion_valid = load_file("tests/data/data_cr3_insertion_valid.json")
data_cr3_insertion_invalid = load_file("tests/data/data_cr3_insertion_invalid.json")


class TestCrashUpdateJurisdiction:
    @classmethod
    def setup_class(cls):
        print("Beginning tests for: TestCrashUpdateJurisdiction")

    @classmethod
    def teardown_class(cls):
        print("\n\nAll tests finished for: TestCrashUpdateJurisdiction")

    def test_critical_error_success(self):
        """
        Tests if raises a critical error successfully.
        """
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
        """
        Tests if critical error function fails
        """
        try:
            raise_critical_error(
                message="",
                data={},
                exception_type=None
            )
            assert False
        except TypeError:
            assert True

    def test_get_crash_id_true(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_crash_id(data_cr3_insertion_valid) == 1000

    def test_get_crash_id_false(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_crash_id({"event": {"data": {"new": {"crash_id": None}}}}) != 1

    def test_get_jurisdiction_flag_outside(self):
        """
        Tests if the get_jurisdiction_flag retrieves negative
        """
        data = load_file("tests/data/data_cr3_insertion_valid.json")
        data["event"]["data"]["new"]["austin_full_purpose"] = "N"
        assert get_jurisdiction_flag(data) == "N"

    def test_get_jurisdiction_flag_injuris(self):
        """
        Tests if the get_jurisdiction_flag retrieves positive
        """
        data = load_file("tests/data/data_cr3_insertion_valid.json")
        data["event"]["data"]["new"]["austin_full_purpose"] = "Y"
        assert get_jurisdiction_flag(data) == "Y"

    def test_get_jurisdiction_flag_non_specific(self):
        """
        Tests if the jurisdiction returns N if not provided
        """
        data = load_file("tests/data/data_cr3_insertion_valid.json")
        data["event"]["data"]["new"]["austin_full_purpose"] = ""
        assert get_jurisdiction_flag(data) == "N"

    def test_get_jurisdiction_flag_none(self):
        """
        Tests if the jurisdiction returns N when None is provided
        """
        data = load_file("tests/data/data_cr3_insertion_valid.json")
        data["event"]["data"]["new"]["austin_full_purpose"] = None
        assert get_jurisdiction_flag(data) == "N"

    def test_get_jurisdiction_flag_empty(self):
        """
        Test if get jurisdiction returns N when nothing is provided
        """
        assert get_jurisdiction_flag(data_cr3_insertion_valid) == "N"

    def test_get_jurisdiction_flag_none(self):
        """
        Tests if get jurisdiction returns N when None no object is provided
        """
        assert get_jurisdiction_flag(None) == "N"

    def test_get_city_id_success(self):
        """
        Tests if the city id is being returned as expected
        """
        assert get_city_id(data_cr3_insertion_valid) == 22

    def test_get_city_id_invalid(self):
        """
        Tests if the city id is being returned as expected
        """
        assert get_city_id(data_cr3_insertion_invalid) is None

    def test_get_original_city_id_success(self):
        """
        Tests if the city id is being returned as expected
        """
        assert get_original_city_id(data_cr3_insertion_valid) == 123

    def test_get_original_city_id_invalid(self):
        """
        Tests if the city id is being returned as expected
        """
        assert get_original_city_id(data_cr3_insertion_invalid) is None

    def test_get_jurisdiction_common_members_success(self):
        array_a = [0, 1, 2]
        array_b = [1, 2, 3]
        assert get_jurisdiction_common_members(array_a, array_b) == {1, 2}

    def test_get_jurisdiction_common_members_success_b(self):
        array_a = [0, 1, 2]
        array_b = [3, 4]
        assert get_jurisdiction_common_members(array_a, array_b) == set()

    def test_get_jurisdiction_common_members_success_c(self):
        array_a = [1000, 1008, 1010]
        array_b = [1000, 1008, 1010]
        assert get_jurisdiction_common_members(array_a, array_b) == {1000, 1008, 1010}

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

    def test_is_crash_in_jurisdiction_true(self):
        """
        Tests if the crash in jurisdiction returns Y
        """
        assert is_crash_in_jurisdiction(17254522) == "Y"

    def test_is_crash_in_jurisdiction_string_true(self):
        """
        Tests if it returns the jurisdiction with a string
        """
        assert is_crash_in_jurisdiction("17254522") == "Y"

    def test_is_crash_in_jurisdiction_false(self):
        """
        Tests if it cannot find the jurisdiction successfully
        """
        assert is_crash_in_jurisdiction(190360890) == "N"

    def test_is_crash_in_jurisdiction_string_false(self):
        """
        Tests if the failure works with string
        """
        assert is_crash_in_jurisdiction("190360890") == "N"

    def test_is_crash_in_jurisdiction_nonnumeric(self):
        """
        Tests if it fails if a non numeric is passed.
        """
        assert is_crash_in_jurisdiction("ABC123") == "N"

    def test_is_crash_in_jurisdiction_decimal(self):
        """
        Tests if it fails with a decimal
        """
        assert is_crash_in_jurisdiction(123.54) == "N"

    def test_is_crash_in_jurisdiction_negativeint(self):
        """
        Tests if it fails with a negative
        """
        assert is_crash_in_jurisdiction(-1234) == "N"

    def test_is_crash_in_jurisdiction_empty(self):
        """
        Tests if it fails with an empty string
        """
        assert is_crash_in_jurisdiction("") == "N"

    def test_is_crash_in_jurisdiction_none(self):
        """
        Tests if it fails with a None object
        """
        assert is_crash_in_jurisdiction(None) == "N"

    def test_get_full_purpose_flag_true(self):
        """
        Tests if it can retrieve the flag successfully
        """
        assert get_full_purpose_flag(17408376) == "Y"

    def test_get_full_purpose_flag_string_true(self):
        """
        Tests if it can retrieve the flag with a string
        """
        assert get_full_purpose_flag("17408376") == "Y"

    def test_get_full_purpose_flag_false(self):
        """
        Tests if it fails to retrieve the flag
        """
        assert get_full_purpose_flag(190360890) == "N"

    def test_get_full_purpose_flag_string_false(self):
        """
        Tests if it fails to retrieve the flag with a string
        """
        assert get_full_purpose_flag("190360890") == "N"

    def test_get_full_purpose_flag_empty(self):
        """
        Tests if it fails to retrieve the flag with an empty string
        """
        assert get_full_purpose_flag("") == "N"

    def test_get_full_purpose_flag_nonnumeric(self):
        """
        Tests if it fails to retrieve the flag with a non numeric string
        """
        assert get_full_purpose_flag("ABC1234") == "N"

    def test_get_full_purpose_flag_decimal(self):
        """
        Tests if it fails to retrieve the flag with a decimal
        """
        assert get_full_purpose_flag(123.45) == "N"

    def test_get_full_purpose_flag_negativeint(self):
        """
        Tests if it fails to retrieve the flag with a negative integer
        """
        assert get_full_purpose_flag(-2123323) == "N"

    def test_update_jurisdiction_flag(self):
        """
        Tests if it can update the jurisdiction flag successfully
        """
        response = update_jurisdiction_flag(1000, "N")
        assert isinstance(response, dict)
        assert "status" in response and "response" in response
        assert response["status"] == "Mutation Successful"
        assert get_full_purpose_flag(1000) == "N"

    @patch("crash_update_jurisdiction.app.hasura_request")
    def test_handler_noevents(self, model_mock):
        """
        Tests if the handler fails if events is an empty object
        """
        handler(
            event=None,
            context=None
        )

        model_mock.assert_not_called()

    @patch("crash_update_jurisdiction.app.hasura_request")
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

    @patch("crash_update_jurisdiction.app.hasura_request")
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

    @patch("crash_update_jurisdiction.app.raise_critical_error")
    def test_handler_critical_body_empty(self, model_mock):
        """
        Tests if hasura_request will raise a critical error.
        """
        handler(
            event={"Records": [{"body": ""}]},
            context=None
        )

        model_mock.assert_called()

    @patch("crash_update_jurisdiction.app.raise_critical_error")
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

    @patch("crash_update_jurisdiction.app.raise_critical_error")
    def test_handler_critical_nonparsable(self, model_mock):
        """
        Tests if the handler fails when passing an non-parsable json string.
        """
        handler(
            event={"Records": [{"body": "{'not':'json'}"}]},
            context=None
        )

        model_mock.assert_called()

    @patch("crash_update_jurisdiction.app.raise_critical_error")
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

    @patch("crash_update_jurisdiction.app.hasura_request")
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
                                "crash_id": 1000
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
                record=json.dumps(data_cr3_insertion_invalid)
            )
            assert False
        except Exception:
            assert True

    def test_hasura_request_valid_body_invalid_crash_id(self):
        """
        Tests whether hasura_request fails to parse an invalid json
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
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

    @patch("crash_update_jurisdiction.app.get_crash_id")
    def test_hasura_request_get_crash_id_called(self,
                                                get_crash_id
    ):
        """
        Tests if it runs get_crash_id with valid data
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "crash_id": 1000
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        get_crash_id.assert_called_once()

    @patch("crash_update_jurisdiction.app.update_jurisdiction_flag")
    def test_hasura_request_is_crash_in_jurisdiction(self, update_jurisdiction_flag):
        """
        Tests if it can run update_jurisdiction with the right combination
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "crash_id": 1000,
                "austin_full_purpose": "N"
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        update_jurisdiction_flag.assert_not_called()

    @patch("crash_update_jurisdiction.app.update_jurisdiction_flag")
    def test_hasura_request_is_crash_in_jurisdiction_false(self, update_jurisdiction_flag):
        """
        Makes sure the update function does not get called if the conditions are not met
        """
        data = load_file("tests/data/data_cr3_insertion_invalid.json")
        data["event"]["data"] = {
            "old": None,
            "new": {
                "crash_id": -9000,
                "austin_full_purpose": "Y"
            },
        }
        hasura_request(
            record=json.dumps(data)
        )
        update_jurisdiction_flag.assert_not_called()

    def test_is_crash_in_jurisdictions_success(self):
        """
        Checks whether a crash falls is part of any jurisdictions
        """
        assert is_crash_in_jurisdictions(1020)

    def test_is_crash_in_jurisdictions_success_b(self):
        """
        Checks whether a crash falls is part of any jurisdictions with a string
        """
        assert is_crash_in_jurisdictions("1020")

    def test_is_crash_in_jurisdictions_fail_a(self):
        """
        Makes sure only numeric values work
        """
        assert is_crash_in_jurisdictions(False) is False

    def test_is_crash_in_jurisdictions_fail_b(self):
        """
        Makes sure only numeric integer values work
        """
        assert is_crash_in_jurisdictions("-1230") is False

    def test_is_crash_in_jurisdictions_fail_c(self):
        """
        Makes sure only positive integer values work
        """
        assert is_crash_in_jurisdictions("1230.0") is False

    def test_get_city_id_from_db_success_a(self):
        """
        Makes sure it can find the city id for a crash
        """
        get_city_id_from_db(17211142) == 9999

    def test_get_city_id_from_db_success_b(self):
        """
        Makes sure it can find the city id for a crash
        """
        get_city_id_from_db("15830818") == 99999

    def test_get_city_id_from_db_fail_a(self):
        """
        Makes sure it can find the city id for a crash
        """
        get_city_id_from_db(False) is None

    def test_get_city_id_from_db_fail_b(self):
        """
        Makes sure it can find the city id for a crash
        """
        get_city_id_from_db("123.2") is None

    def test_get_city_id_from_db_fail_c(self):
        """
        Makes sure it can find the city id for a crash
        """
        get_city_id_from_db(2072423140) is None

    def test_update_city_id_success_a(self):
        """
        Makes sure it can update the city id of a record
        """
        crash_id = 17211142
        city_id = 9999
        assert get_city_id_from_db(crash_id) == city_id
        assert isinstance(update_city_id(crash_id=crash_id, city_id=None), dict)
        assert get_city_id_from_db(crash_id) is None
        assert isinstance(update_city_id(crash_id=crash_id, city_id=city_id), dict)
        assert get_city_id_from_db(crash_id) == city_id

    def test_update_city_id_success_b(self):
        """
        Makes sure it can update the city id of a record
        """
        crash_id = 17211142
        city_id = 9999
        assert get_city_id_from_db(crash_id) == city_id
        assert isinstance(update_city_id(crash_id=crash_id, city_id=1), dict)
        assert get_city_id_from_db(crash_id) == 1
        assert isinstance(update_city_id(crash_id=crash_id, city_id=city_id), dict)
        assert get_city_id_from_db(crash_id) == city_id
