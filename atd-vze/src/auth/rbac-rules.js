const rules = {
  readOnly: {
    static: ["dashboard:visit", "crashes:visit", "locations:visit"],
    // dynamic: {
    //   "posts:edit": ({ userId, postOwnerId }) => {
    //     if (!userId || !postOwnerId) return false;
    //     return userId === postOwnerId;
    //   },
    // },
  },
  editor: {
    static: [
      "users:get",
      "user:view",
      "user:edit",
      "user:delete",
      "user:unblock",
      "home-page:visit",
      "dashboard-page:visit",
    ],
  },
  admin: {
    static: [
      "users:get",
      "user:view",
      "user:edit",
      "user:delete",
      "user:unblock",
      "home-page:visit",
      "dashboard-page:visit",
    ],
  },
  itSupervisor: {
    static: [
      "posts:list",
      "posts:create",
      "posts:edit",
      "posts:delete",
      "users:get",
      "users:getSelf",
      "users:list",
      "home-page:visit",
      "dashboard-page:visit",
    ],
  },
};

export default rules;
