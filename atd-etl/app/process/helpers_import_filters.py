#!/usr/bin/env python
"""
Hasura - Import - Helpers - Filters
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to provide text filters that
help correct graphql syntax. The way these filters work is by receiving
a multi-line 'input' string like this:

```
database_field_1: value,
database_field_2: "value",
database_field_n: ...,
```

Then the filters are programmed to make a specific change, like turning
a 'null' string into a 0 (if it is a numeric value)

The filters should be created after this format:

filter_function_name(input, fields):
    # Process the fields string

The input is a multi-line string like the one described above,
where fields is an array of strings that contains the columns
to apply the filter to.

For example, the filter should behave something like this:

my_user = '''
age: null,
name: "value",
years_of_experience: null
'''

filter_numeric_null_to_zero(input=my_user,
                    fields=["age", "years_of_experience"])


The above function will apply the filter `filter_numeric_null_to_zero`
using my_user as the input, and only to the fields 'age' and 'years_of_experience'.
and change the string 'null' into the string '0':

my_user = '''
age: 0,
name: "value",
years_of_experience: 0
'''

The same pattern should be followed for any new filters.
"""

import re


def filter_numeric_field(input, fields):
    # Remove quotes for numeric values
    output = input
    for field in fields:
        output = re.sub(r"(\n|^)%s: \"([0-9\.]+)\"(,)?" % field, r"\1%s: \2\3" % field, output)

    return output


def filter_remove_field(input, fields):
    """
    Removes fields from field list in a graphql query
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s:(.+)(, )?\n?" % field, "", output)

    return output


def filter_quote_numeric(input, fields):
    """
    Quotes a numeric value for graphql insertion
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s: ([0-9\.]+)(,?)" % field, r'%s: "\1"\2' % field, output)

    return output


def filter_numeric_null_to_zero(input, fields):
    """
    Converts null strings to zero
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s: null(,?)" % field, r'%s: 0\1' % field, output)

    return output


def filter_numeric_empty_to_zero(input, fields):
    """
    Converts empty strings to zero
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s: \"\"(,?)" % field, r'%s: 0\1' % field, output)
    return output


def filter_numeric_empty_to_null(input, fields):
    """
    Converts empty strings to null
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s: \"\"(,?)" % field, r'%s: null\1' % field, output)
    return output


def filter_text_null_to_empty(input, fields):
    """
    Converts null strings to empty graphql string
    :param input:
    :param fields:
    :return:
    """
    output = input
    for field in fields:
        output = re.sub(r"%s: null(,?)" % field, r'%s: ""\1' % field, output)

    return output
