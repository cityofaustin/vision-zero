import { gql } from "apollo-boost";

class gqlAbstract {
  /**
   * Primes the internal configuration for rendering.
   *
   * @constructor
   * @param {Object} The initial configuration of the abstract
   */
  constructor(initConfig) {
    this.config = initConfig;
    this.configInit = JSON.parse(JSON.stringify(initConfig));
    this.config["filterStack"] = {
      where: [],
      order_by: [],
    };
  }

  /**
   * Returns a safe string copy with the basic GraphQL abstract.
   * @returns {string}
   */
  get abstractStructure() {
    return `{
gqlAbstractTableName (
    gqlAbstractFilters
) {
    gqlAbastractColumns
},
gqlAbstractTableAggregateName (
    gqlAbstractAggregateFilters
) {
    aggregate {
      count
    }
  }
}`;
  }

  /**
   * Returns true if the input string is a valid alphanumeric object key
   * @param {string} input - The string to be tested
   * @returns {boolean}
   */
  isNestedKey(input) {
    return input.match(/^[0-9a-zA-Z\-_]+$/) === null;
  }

  /**
   * Returns the key for a nested expression
   * @param {string} exp - The GraphQL expression
   * @returns {string}
   */
  getExpKey = exp => exp.split(/[{} ]+/, 1)[0].trim();

  /**
   * Returns the value of a nested expression, usually another expression.
   * @param {string} exp - The GraphQL expressoin
   * @returns {string}
   */
  getExpValue = exp =>
    exp.substring(exp.indexOf("{") + 1, exp.lastIndexOf("}")).trim();

  /**
   * Refactors a nested key into `sort` format
   * @param {string} exp - The nested key (usually a graphql expression)
   * @returns {string}
   */
  sortifyNestedKey = (exp, val) =>
    this.isNestedKey(exp)
      ? `${this.getExpKey(exp)}: { ${this.sortifyNestedKey(
          this.getExpValue(exp),
          val
        )} }`
      : `${exp}: ${val}`;

  /**
   * Returns the name of the table
   * @returns {string}
   */
  get table() {
    return this.config["table"];
  }

  /**
   * Sets the name of the table for the abstract
   * @returns {string}
   */
  set table(val) {
    this.config["table"] = val;
  }

  /**
   * Sets the limit of the current query
   * @param {integer} limit - the numer you want to use for a limit
   */
  set limit(limit) {
    this.config["limit"] = limit;
  }

  /**
   * Returns the current limit of the current configuration
   * @returns {integer}
   */
  get limit() {
    return this.config["limit"];
  }

  /**
   * Sets the offset of the current configuration
   * @param {integer} offset - the number you want to use as offset
   */
  set offset(offset) {
    this.config["offset"] = offset;
  }

  /**
   * Returns the offset of the current configuration
   * @returns {integer}
   */
  get offset() {
    return this.config["offset"];
  }

  /**
   * Returns an array of searchable columns
   * @returns {Array}
   */
  get searchableFields() {
    let columns = [];
    for (let [key, value] of this.getEntries("columns")) {
      if (value["searchable"]) columns.push(key);
    }
    return columns;
  }

  /**
   * Resets the value of where and or to empty
   */
  cleanWhere() {
    this.config["where"] = null;
    this.config["or"] = null;
  }

  /**
   * Removes all conditions that will be used for ordering.
   */
  clearOrderBy() {
    this.config["order_by"] = [];
  }

  /**
   * Resets original conditions used for ordering
   */
  resetOrderBy() {
    this.config["order_by"] = this.configInit["order_by"];
  }

  /**
   * Full reset of all conditions
   */
  resetFull() {
    this.config = JSON.parse(JSON.stringify(this.configInit));
  }

  /**
   * Replaces or creates a 'where' condition in graphql syntax.
   * @param {string} key - The name of the column
   * @param {string} syntax - the graphql syntax for the where condition
   */
  setWhere(key, syntax) {
    if (!this.config["where"]) this.config["where"] = {};
    this.config["where"][key] = syntax;
  }

  /**
   * Replaces or creates an 'or' condition in graphql syntax.
   * @param {string} key - The name of the column
   * @param {string} syntax - the graphql syntax for the where condition
   */
  setOr(key, syntax) {
    if (!this.config["or"]) this.config["or"] = {};
    this.config["or"][key[0]] = syntax[0];
  }

  /**
   * Removes a column from the where condition
   * @param {string} key - The name of the column
   */
  deleteWhere(key) {
    delete this.config["where"][key];
  }

  /**
   * Removes a column from the or condition
   * @param {object} orObject - The object to be deleted
   */
  deleteOr(orObject) {
    const keyToDelete = Object.keys(orObject)[0];
    this.config["or"] && delete this.config["or"][keyToDelete];
  }

  /**
   * Replaces or creates an 'order_by' condition in graphql syntax.
   * @param {string} key - The name of the column
   * @param {string} syntax - either 'asc' or 'desc'
   */
  setOrder(key, syntax) {
    this.config["order_by"][key] = syntax;
  }

  /**
   * Returns true if a column is defined as sortable in the config, assumes false if not found.
   * @param {string} columnName - The name of the column in the config
   * @returns {boolean}
   */
  isSortable(columnName) {
    return this.config["columns"][columnName]["sortable"] || false;
  }

  /**
   * Returns true if a column is defined as searchable in the config, assumes false if not found.
   * @param {string} columnName - The name of the column in the config
   * @returns {boolean}
   */
  isSearchable(columnName) {
    return this.config["columns"][columnName]["searchable"] || false;
  }

  /**
   * Returns true if a column is defined as primary key in the config, assumes false if not found.
   * @param {string} columnName - The name of the column in the config
   * @returns {boolean}
   */
  isPK(columnName) {
    return this.config["columns"][columnName]["primary_key"] || false;
  }

  /**
   * Returns the type of a column as defined in the config, assumes string if not found.
   * @param {string} columnName - The name of the column in the config
   * @returns {string}
   */
  getType(columnName) {
    return (
      this.config["columns"][columnName]["type"] || "string"
    ).toLowerCase();
  }

  /**
   * Returns the default value when value is null
   * @param {string} columnName - The name of the column in the config
   * @returns {string}
   */
  getDefault(columnName) {
    return this.config["columns"][columnName]["default"];
  }

  /**
   * Attempts to format value based on configuration specification `format`
   * @param {string} columnName - The column to read the configuration from
   * @param {object} value - The actual value to be presented to the component
   */
  getFormattedValue(columnName, value) {
    const type = this.getType(columnName);

    if (value === null) return "-";

    switch (type) {
      case "string": {
        if (typeof value === "object") return JSON.stringify(value);
        else return `${value}`;
      }
      case "currency": {
        return `$${value.toLocaleString()}`;
      }
      case "boolean": {
        return value ? "True" : "False";
      }
      // Integers, Decimals
      default: {
        return `${value}`;
      }
    }
  }

  /**
   * Returns the label for a column as specified in the config, either a 'table' label or 'search' label.
   * Returns null if the label is not found. Assumes type as 'table'.
   * @param {string} columnName - The name of the column.
   * @param {string} type - Type type: 'table' or 'search'
   * @returns {string|null}
   */
  getLabel(columnName, type = "table") {
    return this.config["columns"][columnName]["label_" + type] || null;
  }

  /**
   * Returns an array with key-value pairs
   * @param {string} section - the 'key' name of the section in the config object
   * @returns {[string, any][]}
   */
  getEntries(section) {
    return Object.entries(this.config[section] || section);
  }

  /**
   * Returns an array of strings containing the names of the columns in the current state of config
   * @returns {Array}
   */
  get columns() {
    return this.getEntries("columns").map(k => k[0]);
  }

  /**
   * Returns the url path for a single item, or null if ot does not exist.
   * @returns {string|null}
   */
  get singleItem() {
    return this.config["single_item"] || null;
  }

  /**
   * Generates the filters section and injects the abstract with finished GraphQL syntax.
   * @params {bool} aggregate - True if this is an aggregate filter
   * @returns {string}
   */
  generateFilters(aggregate = false) {
    let output = [];

    // Aggregates do not need limit and offset filters
    if (aggregate === false) {
      if (this.config["limit"]) {
        output.push("limit: " + this.config["limit"]);
      }

      if (this.config["offset"] !== null) {
        output.push("offset: " + this.config["offset"]);
      }
    }

    if (this.config["where"] !== null) {
      let where = [];
      let or = [];
      for (let [key, value] of this.getEntries("where")) {
        where.push(`${key}: {${value}}`);
      }
      if (!!this.config["or"]) {
        for (let [key, value] of this.getEntries("or")) {
          or.push(`{${key}: {${value}}}`);
        }
      }
      if (or.length > 0) {
        output.push(`where: {${where.join(", ")}, _or: [${or.join(", ")}]}`);
      } else {
        output.push(`where: {${where.join(", ")}}`);
      }
    }

    if (this.config["order_by"]) {
      let order_by = [];
      for (let [key, value] of this.getEntries("order_by")) {
        order_by.push(
          this.isNestedKey(key)
            ? this.sortifyNestedKey(key, value)
            : `${key}: ${value}`
        );
      }
      output.push(`order_by: {${order_by.join(", ")}}`);
    }

    return output.join(",\n");
  }

  /**
   * Generates a list with the names of the columns in graphql syntax
   * @returns {string}
   */
  generateColumns() {
    return this.columns.join("\n");
  }

  /**
   * Generates a series of 'where' clauses in GraphQL for each filter setting provided in the configuration
   * and the current state of the app.
   * @param {object} filters - The filters configuration
   * @param {object} filtersState - The current filter's state
   */
  loadFilters(filters, filtersState) {
    for (let group in filters) {
      for (let filter of filters[group]["filters"]) {
        for (let filterItem of filter.filter["where"]) {
          for (let [key, syntax] of this.getEntries(filterItem)) {
            // If enabled, add to the list or remove it from the query.

            if (filtersState[filter.id]) {
              key === "or"
                ? this.setOr(Object.keys(syntax), Object.values(syntax))
                : this.setWhere(key, syntax);
            } else {
              key === "or" ? this.deleteOr(syntax) : this.deleteWhere(key);
            }
          }
        }
      }
    }
  }

  /**
   * Generates a GraphQL query based on the current state of the configuration.
   * @returns {string}
   */
  get query() {
    // First copy the abstract and work from the copy
    let query = this.abstractStructure;

    // Replace the name of the table
    query = query.replace("gqlAbstractTableName", this.config["table"]);
    query = query.replace(
      "gqlAbstractTableAggregateName",
      this.config["table"] + "_aggregate"
    );

    // Generate Filters
    query = query.replace("gqlAbstractFilters", this.generateFilters());
    query = query.replace(
      "gqlAbstractAggregateFilters",
      this.generateFilters(true)
    );

    // Generate Columns
    query = query.replace("gqlAbastractColumns", this.generateColumns());

    // Aggregate Tables

    return query;
  }

  /**
   * Returns a GQL object based on the current state of the configuration.
   * @returns {Object} gql object
   */
  get gql() {
    return gql`
      ${this.query}
    `;
  }
}

export default gqlAbstract;
