import React from "react";
import { Button, Col, Form, FormGroup, Input, Label } from "reactstrap";

export const CrashEditLatLonForm = ({
  latitude,
  longitude,
  handleFormSubmit,
  handleFormReset,
  handleFormCancel,
}) => (
  <Form className="form-horizontal mt-3">
    <FormGroup row>
      <Col md="3">
        <Label htmlFor="qa-latitude">Latitude</Label>
      </Col>
      <Col xs="12" md="9">
        <Input
          type="text"
          id="qa-latitude"
          name="qa-latitude"
          placeholder=""
          value={latitude}
          readOnly
        />
      </Col>
    </FormGroup>
    <FormGroup row>
      <Col md="3">
        <Label htmlFor="qa-longitude">Longitude</Label>
      </Col>
      <Col xs="12" md="9">
        <Input
          type="text"
          id="qa-longitude"
          name="qa-longitude"
          placeholder=""
          value={longitude}
          readOnly
        />
      </Col>
      <Col className="mt-3">
        <Button
          onClick={handleFormSubmit}
          className="mr-3"
          type="submit"
          size="sm"
          color="primary"
        >
          <i className="fa fa-dot-circle-o"></i> Save
        </Button>
        <Button
          onClick={handleFormReset}
          type="reset"
          size="sm"
          color="danger"
          className="mr-3"
        >
          <i className="fa fa-ban"></i> Reset
        </Button>
        <Button
          onClick={handleFormCancel}
          type="cancel"
          size="sm"
          color="secondary"
          className="mr-3"
        >
          <i className="fa fa-times"></i> Cancel
        </Button>
      </Col>
    </FormGroup>
  </Form>
);
