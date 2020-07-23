import React, { useState, useEffect } from "react";
import moment from "moment";
import styled from "styled-components";
import { Bar } from "react-chartjs-2";
import { Container, Col, Row } from "reactstrap";

import { colors } from "../../constants/colors";

const CrashesByYearAverage = ({
  avgData,
  avgDataTotal,
  currentYearTotal,
  currentYearData,
}) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const formatChartData = (avgData, currentYearData) => {
      const labels = avgData.map((data) =>
        moment({ month: parseInt(data.month) - 1 }).format("MMM")
      );
      const avgValues = avgData.map((data) => data.avg);
      const currentYearValues = currentYearData.map((data) => data.total);

      return {
        labels,
        datasets: [
          {
            label: "Five Year Average",
            backgroundColor: colors.viridis3Of6,
            data: avgValues,
            barPercentage: 1.0,
          },
          {
            label: "Total Year to Date",
            backgroundColor: colors.viridis1Of6Highest,
            data: currentYearValues,
            barPercentage: 1.0,
          },
        ],
      };
    };

    const isDataFetched = !!avgData.length && !!currentYearData.length;

    if (isDataFetched) {
      const formattedData = formatChartData(avgData, currentYearData);
      setChartData(formattedData);
    }
  }, [avgData, currentYearData]);

  const StyledDiv = styled.div`
    .year-total-div {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-radius: 4px;
      border-style: none;
      opacity: 1;
    }
  `;

  return (
    <>
      {/* <Row className="pb-2">
        <Col xs={4} s={2} m={2} l={2} xl={2}>
          <div>
            <hr
              className="my-1"
              style={{
                border: `4px solid ${colors.buttonBackground}`,
              }}
            ></hr>
            <h3 className="h6 text-center py-1 mb-0">
              <strong>Year</strong>
            </h3>
            <hr className="my-1"></hr>
            <h3 className="h6 text-center py-1">Total</h3>
          </div>
        </Col>
        <Col xs={4} s={2} m={2} l={2} xl={2}>
          <StyledDiv>
            <div className="year-total-div">
              <hr
                className="my-1"
                style={{
                  border: `4px solid ${colors.viridis3Of6}`,
                }}
              ></hr>
              <h4 className="h6 text-center py-1 mb-0">
                <strong>Five Year Average</strong>
              </h4>
              <hr className="my-1"></hr>
              <h4 className="h6 text-center py-1">{avgDataTotal}</h4>
            </div>
          </StyledDiv>
        </Col>
        <Col xs={4} s={2} m={2} l={2} xl={2}>
          <StyledDiv>
            <div className="year-total-div">
              <hr
                className="my-1"
                style={{
                  border: `4px solid ${colors.viridis1Of6Highest}`,
                }}
              ></hr>
              <h4 className="h6 text-center py-1 mb-0">
                <strong>{moment().format("YYYY")}</strong>
              </h4>
              <hr className="my-1"></hr>
              <h4 className="h6 text-center py-1">{currentYearTotal}</h4>
            </div>
          </StyledDiv>
        </Col>
      </Row> */}
      <Container>
        <Bar
          data={chartData}
          width={null}
          height={null}
          options={{
            responsive: true,
            aspectRatio: 1.16,
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
            },
          }}
        />
      </Container>
    </>
  );
};

export default CrashesByYearAverage;
