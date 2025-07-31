"use client";
import useSWRInfinite from "swr/infinite";
import { useMemo } from "react";
import { ListUsersPage, User, UserAPIError } from "@/types/users";
import { useGetToken } from "@/utils/auth";
import useSWR from "swr";

const PAGE_SIZE = 50;
const INITIAL_PAGE_LIMIT = 10;

/**
 * Basic fetch wrapper that uses a bearer token and
 * throws an error if something goes wrong
 */
const fetcher = async (
  url: string,
  getToken: () => Promise<string | undefined>
) => {
  const token = await getToken();
  return fetch(url, {
    headers: { Authorization: `Bearer ${token || ""}` },
  }).then((res) => res.json());
};

/**
 * SWR hook that fetches all users up to the first
 * <INITIAL_PAGE_LIMIT> * <PAGE_SIZE>
 */
export function useUsersInfinite() {
  const getToken = useGetToken();
  const getKey = (pageIndex: number, previousPageData: ListUsersPage) => {
    if (previousPageData && previousPageData.users.length < PAGE_SIZE) {
      // end of data - stop trying to fetch
      return null;
    }
    // return the next URL to fetch
    return `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/user/list_users?page=${pageIndex}&per_page=${PAGE_SIZE}`;
  };
  const {
    data: pages,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useSWRInfinite<ListUsersPage>(getKey, (url) => fetcher(url, getToken), {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    revalidateAll: true,
    // initial size ensures that we fetch up to 10 pages of data. if the user base
    // grows beyond <INITIAL_PAGE_LIMIT> * <PAGE_SIZE> not all users will be loaded
    initialSize: INITIAL_PAGE_LIMIT,
  });
  // build up our user array from each page and memoize it for good measure
  const users = useMemo(
    () => pages?.flatMap((page) => page.users) || [],
    [pages]
  );

  return { users, isLoading, isValidating, error, mutate };
}

/**
 * Hook to fetch a single user
 */
export function useUser(userId?: string, token?: string | null) {
  const getToken = useGetToken();
  const url = `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/user/get_user/${userId}`;
  return useSWR<User | UserAPIError>(
    token && userId ? url : null,
    (url) => fetcher(url, getToken),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    }
  );
}
