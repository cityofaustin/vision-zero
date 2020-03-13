const readOnlyStaticRules = [
  "dashboard:visit",
  "crashes:visit",
  "crash:visit",
  "locations:visit",
  "location:visit",
];

const editorStaticRules = [];

const adminStaticRules = [
  "users:get",
  "user:view",
  "user:edit",
  "user:delete",
  "user:unblock",
  "home-page:visit",
  "dashboard-page:visit",
];

const itSupervisorStaticRules = [];

const rules = {
  readOnly: {
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
