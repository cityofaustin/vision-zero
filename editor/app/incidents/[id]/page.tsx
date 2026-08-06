"use client";
import { use } from "react";

export default function IncidentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div>
      <p>{`Incident details page for ID #${id}`}</p>
    </div>
  );
}
