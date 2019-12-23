export const crashChangesGridTableColumns = {
    change_id: {
        searchable: false,
        sortable: false,
        label_table: "Change ID",
        type: "Int",
    },
    record_type: {
        searchable: false,
        sortable: true,
        label_table: "Record Type",
        type: "String",
    },
    record_id: {
        primary_key: true,
        searchable: true,
        sortable: true,
        label_search: "Search by Record ID",
        label_table: "Record ID",
        type: "Int",
    },
    created_timestamp: {
        searchable: false,
        sortable: true,
        label_table: "Create Date",
        type: "Date",
    },
    "status { description }": {
        searchable: false,
        sortable: true,
        label_table: "Status",
        type: "String",
    }
};
