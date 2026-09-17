# Bulk user management

Use this tool to block/unblock VZE users in bulk via the Auth0 user management API.

## Good to know

The Vision Zero Editor production and staging environments share a single user pool. As such, this script blocks users from both staging and prod—there's no mechanism to distinguish between them.

## Set up

1. Create a python environment with `requests` installed
2. Export the variables in `env_template` into your python environment. You will need the client ID and secret from the **CR3 and User Management API - Prod + Staging** application in Auth0.
3. You can optionally set the `ADMIN_USER_EMAIL` env variable as the email address of a user to be *ignored* by the script. 

## Run the script

This script will block or unblock *all* users of the app. By default it executes as a "dry run", in which no users are actually updated, their email addresses are merely printed. You must use the `--no-dry-run` flag to actually execute the script.

The block versus unblock action is controlled with the first position command argument. Use `block` or `unblock`.

For example, the following command *will block all VZE users*:

```shell
python update_users.py block --no-dry-run
```

Conversely, this command will unblock all users:

```shell
python update_users.py unblock --no-dry-run
```
