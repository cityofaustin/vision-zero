import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  ButtonGroup,
  Col,
  Row,
} from "reactstrap";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const CrashDiagram = props => {
  const [rotation, setRotation] = useState(0);

  // Need to revisit setting the s3 folder based on environment, manually setting to "staging" for PR testing
  const s3Folder = process.env.NODE_ENV === "production" ? "production" : "staging";

  console.log(process.env);
  console.log(process.env.CONTEXT);
  console.log(s3Folder);

  const requestCR3 = () => {
    const requestUrl = `${process.env.REACT_APP_CR3_API_DOMAIN}/cr3/download/${props.crashId}`;
    const token = window.localStorage.getItem("id_token");

    axios
      .request(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const win = window.open(res.data.message, "_blank");
        win.focus();
      });
  };

  const rotate = event => {
    setRotation(event.target.value);
  };

  const resetRotate = () => {
    setRotation(0);
  };

  return (
    <Card className="h-100">
      <CardHeader>
        <Row className="d-flex align-items-center">
          <Col>Crash Diagram</Col>
          <Col>
            {props.isCr3Stored ? (
              <Button
                color="primary"
                style={{ float: "right" }}
                onClick={requestCR3}
              >
                Download CR-3 PDF
              </Button>
            ) : (
              <div></div>
            )}
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        {!!props.cr3FileMetadata && props.cr3FileMetadata.diagram_s3_file ? (
          <TransformWrapper
            options={{
              limitToBounds: true,
              limitToWrapper: true,
              centerContent: true,
              minScale: 0.5,
            }}
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <React.Fragment>
                <Row>
                  <Col className="tools mb-2">
                    <ButtonGroup>
                      <Button color="primary" onClick={zoomIn}>
                        <i className="fa fa-search-plus"></i>
                      </Button>
                      <Button color="primary" onClick={zoomOut}>
                        <i className="fa fa-search-minus"></i>
                      </Button>
                    </ButtonGroup>
                    <Button
                      color="primary"
                      style={{ float: "right" }}
                      onClick={resetTransform}
                    >
                      <i className="fa fa-repeat"></i>
                    </Button>
                  </Col>
                </Row>
                <TransformComponent>
                  <Row>
                    <Col className="d-flex justify-content-center">
                      <img
                        className="img-fluid w-75"
                        style={{ transform: `rotate(${rotation}deg)` }}
                        src={`https://atd-vision-zero-website.s3.amazonaws.com/cr3_crash_diagrams/${s3Folder}/${props.cr3FileMetadata.diagram_s3_file}`}
                        alt="crash diagram"
                      />
                    </Col>
                  </Row>
                </TransformComponent>
              </React.Fragment>
            )}
          </TransformWrapper>
        ) : props.isTempRecord ? (
          <div>
            CR-3 PDFs, diagrams and narratives are not available for temporary
            records. Using the case id, check the{" "}
            <a href={"https://cris.dot.state.tx.us/"} target={"_new"}>
              CRIS website
            </a>{" "}
            for the latest status of this crash.
          </div>
        ) : (
          <div>
            The CR-3 file for this crash has not been imported, so there is no
            PDF, diagram or narrative available. Use Brazos to search for the
            associated CR-3 Crash Report.
          </div>
        )}
      </CardBody>
      {!!props.cr3FileMetadata && props.cr3FileMetadata.diagram_s3_file ? (
        <CardFooter>
          <form>
            <Row className="form-group d-flex align-items-center mb-0">
              <Col md="2">
                <label htmlFor="formControlRange">Rotate Image:</label>
              </Col>
              <Col md="8">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  className="form-control-range"
                  id="formControlRange"
                  onChange={rotate}
                ></input>
              </Col>
              <Col className="d-flex justify-content-center" md="2">
                <Button color="primary" onClick={resetRotate}>
                  Reset
                </Button>
              </Col>
            </Row>
          </form>
        </CardFooter>
      ) : (
        <div></div>
      )}
    </Card>
  );
};

export default CrashDiagram;
