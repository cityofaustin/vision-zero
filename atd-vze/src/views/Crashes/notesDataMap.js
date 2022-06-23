export const notesDataMap = [
  {
    title: "Notes",
    mutationVariableKey: "id", //FIXME what is this for

    fields: {
      date: {
        label: "Date",
        editable: false,
      },
      user_id: {
        label: "Updated By",
        editable: false,
      },
      text: {
        label: "Note",
        editable: false,
      },
    },
  },
];