import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Container, Row, Col } from "reactstrap";
import { A } from "hookrouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";

// https://usehooks.com/useWindowSize/
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

const ViewTheMap = () => {
  const size = useWindowSize();

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
      height: ${size.width > 1325 ? "403px" : "442px"};
      vertical-align: top;
      background-image: url(${process.env.PUBLIC_URL + "/map_preview.jpg"});
      background-position: center;
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
        <A href="/map" className="text-dark text-decoration-none">
          <Row>
            <Col>
                <div className="img-wrapper">
                  <div className={"map-image"}></div>
                </div>
            </Col>
          </Row>
          <Row className={"justify-content-center map-icon-row"}>
            <div className={"map-icon-circle"}>
              <FontAwesomeIcon size="3x" icon={faMap} className={"map-fa-icon"} />
            </div>
          </Row>
          <Row className="mb-4 justify-content-center">
              <h2 className="text-center card-link">
                View crash data <br />
                on interactive map
              </h2>
          </Row>
        </A>
      </StyledViewTheMap>
    </Container>
  );
};

export default ViewTheMap;
