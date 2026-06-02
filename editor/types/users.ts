/**
 * A user object returned from the Auth0
 * management API.
 *
 * The Auth0-react lib also exports a User type, but
 * it's shape is quite different.
 */
export type User = {
  app_metadata: {
    roles?: string[];
  };
  created_at: string;
  email: string;
  last_login?: string;
  logins_count?: number;
  name: string;
  user_id: string;
  updated_at?: string;
};

/**
 * Returned by the list_users API
 */
export type ListUsersPage = {
  length: number;
  limit: number;
  start: number;
  total: number;
  users: User[];
};

/**
 * Error JSON returned from the Auth0 user management API - this schema
 * does not appear to be documented
 * See: https://auth0.com/docs/api/management/v2
 */
export type UserAPIError = {
  error: string;
  errorCode: string;
  message: string;
  statusCode: number;
};
