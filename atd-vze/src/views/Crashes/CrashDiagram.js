import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  ButtonGroup,
  Alert,
  Col,
  Row,
} from "reactstrap";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import cat from "../../assets/img/brand/cat.jpg";
import cat2 from "../../assets/img/brand/cat2.jpg";

function CrashDiagram(props) {
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

  return (
    <Card>
      <CardHeader>
        <Row>
          <Col>Crash Diagram</Col>
          <Col>
            {props.isTempRecord ? (
              <Alert color="warning">
                <strong>
                  CR3 PDFs are not available for temporary records.
                </strong>
                <br />
                Using the case id, check the{" "}
                <a href={"https://cris.dot.state.tx.us/"} target={"_new"}>
                  CRIS website
                </a>{" "}
                for the latest status of this crash.
              </Alert>
            ) : props.isCr3Stored ? (
              <Button
                color="primary"
                style={{ float: "right" }}
                onClick={requestCR3}
              >
                Download CR-3 PDF
              </Button>
            ) : (
              <Alert color="warning">
                The CR-3 file for this crash has not been imported. Use Brazos
                to search for the associated CR-3 Crash Report.
              </Alert>
            )}
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <TransformWrapper
          defaultScale={1}
        //   defaultPositionX={200}
        //   defaultPositionY={100}
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <React.Fragment>
              <div className="tools mb-2">
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
                  <i className="fa fa-expand"></i>
                </Button>
              </div>
              <div className="d-flex justify-content-center">
              <TransformComponent>
                <img src={cat} alt="test" />
              </TransformComponent>
              </div>
            </React.Fragment>
          )}
        </TransformWrapper>
      </CardBody>
    </Card>
  );
}

export default CrashDiagram;
