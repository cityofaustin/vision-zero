"use client";
import useSWRInfinite from "swr/infinite";
import { useEffect, useState, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ListUsersPage } from "@/types/users";

const PAGE_SIZE = 50;
const INITIAL_PAGE_LIMIT = 10;

/**
 * Basic fetch wrapper that uses a bearer token and
 * throws an error if something goes wrong
 */
const fetcher = async (url: string, token: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

/**
 * SWR hook that fetches all users up to the first
 * <INITIAL_PAGE_LIMIT> * <PAGE_SIZE>
 */
export function useUsersInfinite(token: string) {
  const getKey = (pageIndex: number, previousPageData: ListUsersPage) => {
    if (!token) {
      return null;
    }
    if (previousPageData && previousPageData.users.length < PAGE_SIZE) {
      // end of data - stop trying to fetch
      return null;
    }
    // return the next URL to fetch
    return `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/user/list_users?page=${pageIndex}&per_page=${PAGE_SIZE}`;
  };
  const { data: pages, isLoading } = useSWRInfinite<ListUsersPage>(
    getKey,
    (url) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      // initial size ensures that we fetch up to 10 pages of data. if the user base
      // grows beyond <INITIAL_PAGE_LIMIT> * <PAGE_SIZE> not all users will be loaded
      initialSize: INITIAL_PAGE_LIMIT,
    }
  );
  // build up our user array from each page, sort it, and memoize it for good measure
  const users = useMemo(
    () =>
      pages
        ?.flatMap((page) => page.users)
        .sort((a, b) => {
          // sort by last_login, which is undefined if a user has never logged in
          if (!a.last_login) return 1;
          if (!b.last_login) return -1;
          return b.last_login > a.last_login ? 1 : -1;
        }) || [],
    [pages]
  );

  return { users, isLoading };
}

/**
 * Get a single user by ID
 */
export async function getUser(userId: string, token: string) {
  const endpoint = `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/user/get_user/${userId}`;
  return fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
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
