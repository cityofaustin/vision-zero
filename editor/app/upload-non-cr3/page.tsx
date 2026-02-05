"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import Papa, { ParseResult } from "papaparse";
import { ZodError } from "zod";
import AlignedLabel from "@/components/AlignedLabel";
import { useMutation } from "@/utils/graphql";
import { INSERT_NON_CR3 } from "@/queries/nonCr3s";
import {
  NonCr3Upload,
  NonCr3UploadDedupedSchema,
  NonCr3ValidationError,
} from "@/types/nonCr3";
import {
  FaFileCsv,
  FaCircleCheck,
  FaCircleInfo,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { useDocumentTitle } from "@/utils/documentTitle";

const MAX_ERRORS_TO_DISPLAY = 50;

export default function UploadNonCr3() {
  useDocumentTitle("Upload Non-CR3 records");
  const [parsing, setParsing] = useState(false);
  const [data, setData] = useState<NonCr3Upload[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    NonCr3ValidationError[] | null
  >();
  const [uploadError, setUploadError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { mutate, loading: isMutating } = useMutation(INSERT_NON_CR3);

  const onSelectFile = useCallback(
    (file: File) => {
      Papa.parse<NonCr3Upload>(file, {
        delimiter: ",",
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<NonCr3Upload>) => {
          if (results.errors.length > 0) {
            // handle CSV parsing errors
            const formattedErrors: NonCr3ValidationError[] = results.errors.map(
              (issue) => ({
                rowNumber: (issue.row || 0) + 1,
                fieldName: "",
                message: issue.message,
              })
            );
            setValidationErrors(formattedErrors);
          } else {
            // CSV has been parsed — run schema validations
            try {
              const parsedData: NonCr3Upload[] =
                NonCr3UploadDedupedSchema.parse(results.data);
              setData(parsedData);
            } catch (err) {
              if (err instanceof ZodError) {
                const formattedErrors = err.issues.map((issue) => {
                  const [rowNumber, fieldName] = issue.path;
                  const message = issue.message;
                  return {
                    rowNumber: Number(rowNumber) + 1,
                    fieldName: String(fieldName),
                    message,
                  };
                });
                setValidationErrors(formattedErrors);
              }
            }
          }
          setParsing(false);
        },
      });
    },
    [setValidationErrors, setParsing, setData]
  );

  const onUpload = async () => {
    try {
      await mutate({ objects: data });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setUploadError(true);
      setSuccess(false);
    }
  };

  return (
    <div className="h-100 d-flex flex-column">
      <div className="fs-3 fw-bold">Upload Non-CR3 records</div>

      {!data && (
        <Row>
          <Col xs={12} md={6} lg={3}>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Control
                type="file"
                name="file"
                accept=".csv"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSuccess(false);
                  if (validationErrors) {
                    setValidationErrors(null);
                  }
                  if (e.target?.files && e.target?.files.length > 0) {
                    setParsing(true);
                    onSelectFile(e.target?.files[0]);
                    // reset file input
                    e.target.value = "";
                  } else {
                    setParsing(false);
                  }
                }}
              />
            </Form>
          </Col>
          <Col className="my-auto">
            <Link
              href="/files/non_cr3_template.csv"
              download="non_cr3_template.csv"
              className="text-decoration-none ms-3 text-nowrap d-flex align-items-center"
            >
              <FaFileCsv className="me-2" />
              Download CSV template
            </Link>
          </Col>
        </Row>
      )}
      {data && !validationErrors && !uploadError && !success && !isMutating && (
        <>
          <Row>
            <Col>
              <Alert variant="info">
                <AlignedLabel>
                  <FaCircleInfo className="me-2" />
                  {`${data.length.toLocaleString()} records will be imported`}
                </AlignedLabel>
              </Alert>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                role="submit"
                disabled={!data.length || isMutating}
                onClick={(e) => {
                  e.preventDefault();
                  onUpload();
                }}
              >
                Continue
              </Button>
            </Col>
          </Row>
        </>
      )}
      <Row className="mt-3">
        <Col>
          {parsing && (
            <AlignedLabel>
              <Spinner variant="primary" className="me-2" />
              <span>Processing...</span>
            </AlignedLabel>
          )}
          {!validationErrors && isMutating && (
            <AlignedLabel>
              <Spinner variant="primary" className="me-2" />
              <span>Uploading records...</span>
            </AlignedLabel>
          )}
          {success && (
            <Alert variant="success">
              <AlignedLabel>
                <FaCircleCheck className="me-2" />
                <span>Records successfully imported</span>
              </AlignedLabel>
            </Alert>
          )}
          {validationErrors && (
            <Alert variant="danger" className="d-flex justify-content-between">
              <AlignedLabel>
                <FaTriangleExclamation className="me-2" />
                <span>
                  Your file is invalid — please correct the below errors and try
                  again
                </span>
              </AlignedLabel>
            </Alert>
          )}
          {uploadError && (
            <Alert variant="danger" className="d-flex justify-content-between">
              <AlignedLabel>
                <FaTriangleExclamation className="me-2" />
                <span>
                  There was an error uploading your file - please try again.
                </span>
              </AlignedLabel>
            </Alert>
          )}
          {validationErrors && (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Row #</th>
                  <th>Field</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody className="font-monospace">
                {validationErrors
                  .slice(0, MAX_ERRORS_TO_DISPLAY)
                  .map(({ fieldName, rowNumber, message }, i) => (
                    <tr key={i}>
                      {/* if dupes are detected, rowNumber will be NaN and  the fieldname will be the string literal `"undefined"` */}
                      <td>{isNaN(rowNumber) ? "" : rowNumber + 1}</td>
                      <td>{fieldName === "undefined" ? "" : fieldName}</td>
                      <td>{message}</td>
                    </tr>
                  ))}
                {validationErrors.length > MAX_ERRORS_TO_DISPLAY && (
                  <tr>
                    <td colSpan={3} className="text-center">{`${
                      validationErrors.length - MAX_ERRORS_TO_DISPLAY
                    } more errors not shown`}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </div>
  );
}
