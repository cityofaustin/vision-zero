"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { User } from "@/types/users";

const PAGE_SIZE = 50;

/**
 * Fetch a page of users from list_users API
 */
async function getUserPage(page: number, perPage: number, token: string) {
  const endpoint = `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/user/list_users?page=${page}&per_page=${perPage}`;
  return fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Hook which retrieves the user's bearer
 * token from the IdToken claims
 */
export const useToken = () => {
  const [token, setToken] = useState<string>("");
  const { getIdTokenClaims } = useAuth0();
  /**
   * Get the user token - just one time
   */
  useEffect(() => {
    if (!token) {
      getIdTokenClaims().then((idToken) => {
        setToken(idToken?.__raw || "");
      });
    }
  }, [token, getIdTokenClaims]);
  return token;
};

/**
 * Hook which fetches users from the list_users API
 * in batches until all have bee retrieved
 */
export const useUsers = (token: string): [User[], boolean, unknown] => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [allUsersFetched, setAllUsersFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  /**
   * Retrieve user data from CR3/User API
   */
  useEffect(() => {
    if (!token || allUsersFetched || isFetching || error) {
      return;
    }
    /**
     * isFetching state ensures requests are not duplicated -
     * we set it to `true` when a new request is initiated
     * and `false` when it resolves and we have updated
     * all of the other states
     */
    setIsFetching(true);
    try {
      getUserPage(currentPage, PAGE_SIZE, token)
        .then((response) => response.json())
        .then((data) => {
          if (data.users.length < PAGE_SIZE) {
            setAllUsersFetched(true);
          }
          const updatedUserList = [...users, ...data.users];
          // sort by last_login
          // todo: enable sortable table columns
          updatedUserList.sort((a, b) => {
            // last_login is undfined if a user has never logged in
            if (a.last_login === undefined) return 1;
            if (b.last_login === undefined) return -1;
            return b.last_login > a.last_login ? 1 : -1;
          });
          setUsers(updatedUserList);
          setCurrentPage(currentPage + 1);
          setIsFetching(false);
        });
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }, [token, users, currentPage, allUsersFetched, error]);

  return [users, !allUsersFetched, error];
};
