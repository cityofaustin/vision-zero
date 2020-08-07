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
