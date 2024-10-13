import { useState } from "react";
import Link from "next/link";
import { Container, Row, Col, Button } from "react-bootstrap";
import { gql } from "graphql-request";
import { useAuth0 } from "@auth0/auth0-react";
import { useGraphQL } from "@/components/client";
import Table from "@/components/Table";
import { CrashListCrash, TableColumn } from "@/types/types";

const CRASHES_QUERY = gql`
  query {
    crashes_list_view(limit: 100) {
      id
      cris_crash_id
      address_primary
      record_locator
    }
  }
`;

const COLUMNS: TableColumn<CrashListCrash>[] = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "record_locator",
    label: "Crash ID",
    renderer: (row: CrashListCrash) => (
      <Link href={`/crashes/${row.record_locator}`}>{row.record_locator}</Link>
    ),
  },
  {
    key: "address_primary",
    label: "Address",
  },
];

export default function Home() {
  const {
    isLoading: isLoadingAuth,
    error: errorAuth,
    user,
    loginWithRedirect,
  } = useAuth0();

  const { data, error, isLoading } = useGraphQL<{
    crashes_list_view: CrashListCrash[];
  }>({
    query: CRASHES_QUERY,
  });

  return (
    <Row>
      <Col>
        {!isLoadingAuth && !errorAuth && !user && (
          <button onClick={() => loginWithRedirect()}>Log in</button>
        )}
        <h2>Main Content</h2>

        <div>
          {data && <Table rows={data.crashes_list_view} columns={COLUMNS} />}
        </div>
      </Col>
    </Row>
  );
}
