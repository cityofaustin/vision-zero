#!/usr/bin/env python
import pytest
import json
import pdb

from .json_helper import load_file
from crash_update_location.app import *

data_cr3_insertion_valid = load_file("tests/data/data_cr3_insertion_valid.json")
data_cr3_insertion_invalid = load_file("tests/data/data_cr3_insertion_invalid.json")


class TestCrashUpdateLocation:
    @classmethod
    def setup_class(cls):
        print("Beginning tests for: TestCrashUpdateLocation")

    @classmethod
    def teardown_class(cls):
        print("\n\nAll tests finished for: TestCrashUpdateLocation")

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
        assert is_insert(data_cr3_insertion_valid)

    def test_is_insert_invalid(self):
        """
        This test should check whether the function can tell if this is NOT
        an insertion, and should assert False.
        """
        assert is_insert(data_cr3_insertion_invalid) is False

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
        assert is_crash_mainlane(11425861)

    def test_is_crash_mainlane_str_true(self):
        """
        Tests if a crash is mainlane, it should assert True
        """
        assert is_crash_mainlane("11425861")

    def test_is_crash_mainlane_false(self):
        """
        Tests if a crash is mainlane, it should assert False
        """
        assert is_crash_mainlane("11425868") is False

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

    def test_get_crash_id_true(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_crash_id(data_cr3_insertion_valid) == 17697596

    def test_get_crash_id_false(self):
        """
        Tests whether it can get the crash id from a record successfully.
        """
        assert get_crash_id({"event": {"data": {"new": {"crash_id": None}}}}) != 1

    def test_get_location_id_true(self):
        """
        Tests if the location id is returned
        """
        assert get_location_id(data_cr3_insertion_valid) == "SCRAMBLED1234"

    def test_get_location_id_false(self):
        """
        Tests if the location id is returned, tests false
        """
        assert get_location_id({"event": {"data": {"new": {"location_id": None}}}}) != "SCRAMBLED1234"

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
