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

    