import React from "react";
import "./App.css";
import Dashboard from "./views/dashboard/dashboard";
import Map from "./views/map/map";
import NotFound from "./views/NotFound/NotFound";
import { Row, Col, Alert } from "reactstrap";
import { useRoutes, A } from "hookrouter";

const routes = {
  "/": () => <Dashboard />,
  "/map": () => <Map />
};

const App = () => {
  const routeResult = useRoutes(routes);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vision Zero Viewer</h1>
        <A href="/">Home</A>
        <A href="/map">Map</A>
      </header>
      <Row>
        <Col md="12">
          <Alert color="primary">
            <h4 className="alert-heading">This site is a work in progress.</h4>
            <p>
              The information displayed below may be outdated or incorrent.
              <br></br>
              Check back later for live Vision Zero data.
            </p>
          </Alert>
        </Col>
      </Row>
      {routeResult || <NotFound />}
    </div>
  );
};

export default App;
