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

// Centralize role names used elsewhere in the app
export const readOnlyRoleName = "readonly";
export const adminRoleName = "vz-admin";
export const editorRoleName = "editor";
export const itSupervisorRoleName = "itSupervisor";

export const rules = {
  // Changing readonly to camelCase will break Hasura permissions
  [readOnlyRoleName]: {
    label: "Read-only",
    static: readOnlyStaticRules,
  },
  [editorRoleName]: {
    label: "Editor",
    static: [...readOnlyStaticRules, ...editorStaticRules],
  },
  [adminRoleName]: {
    label: "Admin",
    static: [...readOnlyStaticRules, ...editorStaticRules, ...adminStaticRules],
  },
  [itSupervisorRoleName]: {
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
