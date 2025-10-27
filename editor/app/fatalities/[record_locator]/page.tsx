"use client";

import { useQuery } from "@/utils/graphql";
import { GET_CRASH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { useDocumentTitle } from "@/utils/documentTitle";
import { formatAddresses } from "@/utils/formatters";
import { formatYear } from "@/utils/formatters";
import { notFound } from "next/navigation";

export default function FatalCrashDetailsPage({
  params,
}: {
  params: { record_locator: string };
}) {
  const recordLocator = params.record_locator;

  const typename = "crashes";

  const { data, error } = useQuery<Crash>({
    query: recordLocator ? GET_CRASH : null,
    variables: { recordLocator },
    typename,
  });

  if (error) {
    console.error(error);
  }

  // Set document title based on loaded data
  useDocumentTitle(
    data && data.length > 0
      ? `Fatalities ${data[0].record_locator} - ${formatAddresses(data[0])}`
      : "Vision Zero Editor",
    true // exclude the suffix
  );

  if (!data) {
    // todo: loading spinner (would be nice to use a spinner inside cards)
    return;
  }

  if (data.length === 0) {
    // 404
    notFound();
  }

  return (
    <>
      {data && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fs-3 fw-bold text-uppercase">
            {formatAddresses(data[0])}
          </span>
          <span className="fs-5">
            {formatYear(data[0].crash_timestamp)} Fatal Crash #
            {data[0].law_enforcement_ytd_fatality_num}
          </span>
        </div>
      )}
    </>
  );
}
