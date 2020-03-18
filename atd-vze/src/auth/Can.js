import rules from "./rbac-rules";

const check = (rules, roles, action, data) => {
  // Collect user roles and check if any are authorized to render child component
  const isAuthorizedArray = roles.reduce((acc, role) => {
    const permissions = rules[role];
    if (!permissions) {
      // role is not present in the rules
      acc.push(false);
    }

    const staticPermissions = permissions.static;

    if (staticPermissions && staticPermissions.includes(action)) {
      // static rule not provided for action
      acc.push(true);
    }
    return acc;
  }, []);

  return isAuthorizedArray.includes(true);
};

const Can = props =>
  check(rules, props.roles, props.perform, props.data)
    ? props.yes()
    : props.no();

Can.defaultProps = {
  yes: () => null,
  no: () => null,
};

export default Can;
