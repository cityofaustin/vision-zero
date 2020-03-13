const readOnlyStaticRules = [
  "dashboard:visit",
  "crashes:visit",
  "crash:visit",
  "locations:visit",
  "location:visit",
];

const editorStaticRules = ["crash: edit", "location: edit"];

const adminStaticRules = [
  "users:get",
  "user:get",
  "user:create",
  "user:edit",
  "user:editRole",
  "user:delete",
  "user:unblock",
];

const itSupervisorStaticRules = ["user:makeAdmin"];

const rules = {
  // Changing readonly to camelCase will break Hasura permissions
  readonly: {
    static: readOnlyStaticRules,
    // dynamic: {
    //   "posts:edit": ({ userId, postOwnerId }) => {
    //     if (!userId || !postOwnerId) return false;
    //     return userId === postOwnerId;
    //   },
    // },
  },
  editor: {
    static: [...readOnlyStaticRules, ...editorStaticRules],
  },
  admin: {
    static: [...readOnlyStaticRules, ...editorStaticRules, ...adminStaticRules],
  },
  itSupervisor: {
    static: [
      ...readOnlyStaticRules,
      ...editorStaticRules,
      ...adminStaticRules,
      ...itSupervisorStaticRules,
    ],
  },
};

export default rules;

// TODO: Restrict routes
// TODO: Restrict edit logic in crash details view
// TODO: Restrict giving admin role to itSupervisor
