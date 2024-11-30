/**
 * A user object returned from the Auth0
 * management API.
 *
 * The Auth0-react lib also exports a User type, but
 * it's shape is quite different.
 */
export type User = {
  app_metadata: {
    roles: string[];
  };
  created_at: string;
  email: string;
  last_login?: string;
  logins_count?: number;
  name: string;
  user_id: string;
  last_ip?: string;
  updated_at?: string;
};
