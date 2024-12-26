"use client";
import { useState, useEffect } from "react";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import Papa, { ParseResult } from "papaparse";
import { z, ZodError } from "zod";
import { FaExclamationTriangle } from "react-icons/fa";
import AlignedLabel from "@/components/AlignedLabel";
import { useMutation } from "@/utils/graphql";
import { INSERT_NON_CR3 } from "@/queries/nonCr3s";

const MAX_ERRORS_TO_DISPLAY = 25;

const nonCr3Schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is missing or invalid"),
  case_id: z.string().regex(/^\d+$/, "Case ID is missing or invalid"),
  address: z
    .string()
    /**
     * Remove all characters except letters, digits, whitespace, and these: `\/-.,&`.
     */
    .transform((val) => val.replace(/[^A-Za-z0-9\\/\-\s.,&]/g, ""))
    .refine((value) => value.trim() !== "", {
      message: "Address is missing or invalid",
    }),
  longitude: z.coerce
    .number()
    .min(-99.7404, {
      message: `Longitude is less than the minimum bounds (${-99.7404})`,
    })
    .max(-95.7404, {
      message: `Longitude is greater than the maximum bounds (${-95.7404})`,
    }),
  latitude: z.coerce
    .number()
    .min(28.2747, {
      message: `Latitude is less than the maximum bounds (${28.2747})`,
    })
    .max(32.2747, {
      message: `Latitude is greater than the maximum bounds (${32.2747})`,
    }),
  hour: z.coerce.number().int().min(0).max(23, "Hour must be between 0 and 23"),
});

type NonCr3 = z.infer<typeof nonCr3Schema>;

type NonCr3ValidationError = {
  rowNumber: number;
  fieldName: string;
  message: string;
};

export default function UploadNonCr3() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [data, setData] = useState<NonCr3[] | null>(null);
  const [errors, setErrors] = useState<NonCr3ValidationError[] | null>();
  const [success, setSuccess] = useState(false);
  const { mutate, loading: isMutating } = useMutation(INSERT_NON_CR3);

  const onClickContinue = () => {
    setSuccess(false);
    setParsing(true);
    const fileType = file?.type;
    if (file && fileType?.includes("csv")) {
      Papa.parse<NonCr3>(file, {
        delimiter: ",",
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<NonCr3>) => {
          if (results.errors.length > 0) {
            // handle CSV parsing errors
            const formattedErrors: NonCr3ValidationError[] = results.errors.map(
              (issue) => ({
                rowNumber: (issue.row || 0) + 1,
                fieldName: "",
                message: issue.message,
              })
            );
            setErrors(formattedErrors);
          } else {
            // CSV has been parsed — now run schema validations
            let parsedData: NonCr3[] | undefined;
            console.log(results.data);
            try {
              parsedData = z.array(nonCr3Schema).parse(results.data);
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
                setErrors(formattedErrors);
              }
            }
            if (parsedData) {
              setData(parsedData);
            }
          }
          setParsing(false);
        },
      });
    }
  };

  useEffect(() => {
    if (file) {
      onClickContinue();
    }
  }, [file]);

  const onUpload = async () => {
    const stuff = await mutate({ objects: data });
    setSuccess(true);
    console.log("stuffresponse", stuff);
  };

  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold">
          Upload Non-CR3 records
        </Card.Header>
        <Card.Body>
          <Row>
            <Col>
              {!data && (
                <Form onSubmit={(e) => e.preventDefault()}>
                  <Row>
                    <Col>
                      <Form.Control
                        type="file"
                        name="file"
                        accept=".csv"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (errors) {
                            setErrors(null);
                          }
                          if (e.target?.files) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      ></Form.Control>
                    </Col>
                  </Row>
                </Form>
              )}
              {data && !errors && !success && (
                <>
                  <Row>
                    <Col>
                      <p>{`You will import ${data.length} rows!`}</p>
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
                  {parsing && <p>Processing...</p>}
                  {!errors && isMutating && <p>Uploading...</p>}
                  {success && <p>Success!</p>}
                  {errors && (
                    <Alert
                      variant="danger"
                      className="d-flex justify-content-between"
                    >
                      <AlignedLabel>
                        <FaExclamationTriangle className="me-2" />
                        <span>
                          Your file is invalid — please correct the below errors
                          and try again.
                        </span>
                      </AlignedLabel>
                    </Alert>
                  )}
                  {errors && (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Row #</th>
                          <th>Field</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody className="font-monospace">
                        {errors
                          .slice(0, MAX_ERRORS_TO_DISPLAY)
                          .map(({ fieldName, rowNumber, message }, i) => (
                            <tr key={i}>
                              <td>{rowNumber}</td>
                              <td>{fieldName}</td>
                              <td>{message}</td>
                            </tr>
                          ))}
                        {errors.length > MAX_ERRORS_TO_DISPLAY && (
                          <tr>
                            <td colSpan={3} className="text-center">{`${
                              errors.length - MAX_ERRORS_TO_DISPLAY
                            } more errors not shown`}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}
