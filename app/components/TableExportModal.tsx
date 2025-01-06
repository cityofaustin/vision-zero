import { useState, useEffect } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { useQuery } from "@/utils/graphql";
import { unparse } from "papaparse";
import AlignedLabel from "./AlignedLabel";
import { FaCircleInfo, FaDownload } from "react-icons/fa6";
import { formatDate } from "@/utils/formatters";

/**
 * Generate the CSV export filename
 */
const formatFileName = (exportFilename?: string) =>
  `${exportFilename || "export"}-${formatDate(new Date().toISOString())}.csv`;

interface TableExportModalProps {
  /**
   * The name that will be given to the exported file, excluding
   * the file extension
   */
  exportFilename?: string;
  /**
   * A callback fired when either the modal backdrop is clicked, or the
   * escape key is pressed
   */
  onClose: () => void;
  /**
   * The graphql query to use
   */
  query: string;
  /**
   * If the modal should be visible or hidden
   */
  show: boolean;
  /**
   * The number of records to be exported
   */
  totalRecordCount: number;
  /**
   * The typename of the query root that will be used to access the rows returned by the query
   */
  typename: string;
}

/**
 * UI component which provides a CSV download of the provided query
 */
export default function TableExportModal<T extends Record<string, unknown>>({
  exportFilename,
  onClose,
  query,
  totalRecordCount,
  show,
  typename,
}: TableExportModalProps) {
  /**
   * TODO: exclude aggregations from export
   * https://github.com/cityofaustin/atd-data-tech/issues/20481
   */
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery<T>({
    // don't fetch until this modal is visible
    query: show ? query : null,
    typename,
    hasAggregates: false,
  });

  /**
   * Hook which updates creates the CSV download blob when data becomes available
   */
  useEffect(() => {
    if (!isLoading && data) {
      const csvContent = unparse(data, {
        quotes: true,
        header: true,
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      return () => {
        // cleanup on unmount
        URL.revokeObjectURL(url);
        setDownloadUrl(null);
      };
    }
  }, [isLoading, data]);

  if (error) {
    console.error(error);
  }

  return (
    <Modal show={show} onHide={onClose} animation={false} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Download data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert
          variant="info"
          className="d-flex justify-content-between align-items-center"
        >
          <FaCircleInfo className="me-3 fs-4" />
          <div>
            You are about to download{" "}
            <span className="fw-bold">{`${totalRecordCount.toLocaleString()} `}</span>
            <span>{`record${totalRecordCount === 1 ? "" : "s"}`}</span> — this
            may take a few minutes for larger downloads
          </div>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {downloadUrl && (
          <Button
            href={downloadUrl || "#"}
            download={formatFileName(exportFilename)}
            as="a"
          >
            <AlignedLabel>
              <FaDownload className="me-2" />
              Download
            </AlignedLabel>
          </Button>
        )}
        {isLoading && (
          <Button disabled variant="outline-primary">
            <AlignedLabel>
              <Spinner size="sm" className="me-2" />
              <span>Loading...</span>
            </AlignedLabel>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
