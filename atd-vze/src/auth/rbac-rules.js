// Read-only permissions not enforced by Can component
// since all authorized users should have accesss
const readOnlyStaticRules = [
  "dashboard:visit",
  "crashes:visit",
  "crash:visit",
  "locations:visit",
  "location:visit",
];

const editorStaticRules = ["crash: edit", "location: edit"];

const adminStaticRules = [
  "users:visit",
  "users:get",
  "user:get",
  "user:create",
  "user:edit",
  "user:editRole",
  "user:delete",
  "user:unblock",
];

const itSupervisorStaticRules = ["user:makeAdmin"];

export const rules = {
  // Changing readonly to camelCase will break Hasura permissions
  readonly: {
    label: "Read-only",
    static: readOnlyStaticRules,
  },
  editor: {
    label: "Editor",
    static: [...readOnlyStaticRules, ...editorStaticRules],
  },
  admin: {
    label: "Admin",
    static: [...readOnlyStaticRules, ...editorStaticRules, ...adminStaticRules],
  },
  itSupervisor: {
    label: "IT Supervisor",
    static: [
      ...readOnlyStaticRules,
      ...editorStaticRules,
      ...adminStaticRules,
      ...itSupervisorStaticRules,
    ],
  },
};

export default rules;
