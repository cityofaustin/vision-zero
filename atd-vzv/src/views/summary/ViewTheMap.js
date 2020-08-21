import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Container, Row, Col } from "reactstrap";
import { A } from "hookrouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const ViewTheMap = () => {
  const StyledViewTheMap = styled.div`
    .img-wrapper {
      position: relative;
      width: 100%;
    }
    .img-wrapper:after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: all 0.2s;
      -webkit-transition: all 0.2s;
    }
    .img-wrapper:hover:after {
      opacity: 1;
    }
    .map-image {
      width: 100%;
      vertical-align: top;
    }
    .map-icon-row {
      height: 40px;
      border-top: 2px solid #8080804d;
      margin: 0;
    }
    .map-icon-circle {
      background-color: white;
      border-radius: 50%;
      border: 2px solid #8080804d;
      border-radius: 50%;
      border-bottom-color: #fff;
      border-right-color: #fff;
      transform: rotate(45deg);
      height: 100px;
      width: 100px;
      position: relative;
      top: -50px;
      text-align: center;
      padding-top: 25px;
    }
    .map-fa-icon {
      transform: rotate(-45deg);
    }
  `;

  return (
    <Container className="m-0 p-0">
      <StyledViewTheMap>
        <Row>
          <Col>
            <A href="/map">
              <div className="img-wrapper">
                <img
                  src={process.env.PUBLIC_URL + "/map_preview.jpg"}
                  className={"map-image"}
                  alt="Screenshot of map displaying crashes with serious injuries or fatalities"
                />
              </div>
            </A>
          </Col>
        </Row>
        <Row className={"justify-content-center map-icon-row"}>
          <div className={"map-icon-circle"}>
            <FontAwesomeIcon size="3x" icon={faMap} className={"map-fa-icon"} />
          </div>
        </Row>
        <Row className=" mb-4 justify-content-center">
          <h2 className="text-center">
            View crash data <br />
            on interactive map
          </h2>
        </Row>
      </StyledViewTheMap>
    </Container>
  );
};

export default ViewTheMap;
