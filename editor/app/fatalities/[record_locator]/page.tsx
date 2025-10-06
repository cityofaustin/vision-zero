"use client";

import { useQuery } from "@/utils/graphql";
import { GET_FATALITIES } from "@/queries/fatalities";
import { Fatality } from "@/types/fatalities";

export default function FatalCrashDetailsPage({
  params,
}: {
  params: { record_locator: string };
}) {
  const recordLocator = params.record_locator;

  const typename = "fatalities";

  const { data, error, refetch, isValidating } = useQuery<Fatality>({
    query: recordLocator ? GET_FATALITIES : null,
    variables: { recordLocator },
    typename,
  });

  if (error) {
    console.error(error);
  }

  return (
    <>
      {data && (
        <div className="d-flex justify-content-between mb-3">
          <span className="fs-3 fw-bold text-uppercase">
            {data[0]?.address_primary}
          </span>
        </div>
      )}
    </>
  );
}
