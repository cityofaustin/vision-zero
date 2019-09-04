import React, { Component } from "react";
import MapGL, {
  Marker,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

// import ControlPanel from "./control-panel";
import Pin from "./Pin";
import { setPinColor } from "../../styles/mapPinStyles";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const fullscreenControlStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  padding: "10px",
};

const navStyle = {
  position: "absolute",
  top: 36,
  left: 0,
  padding: "10px",
};

export default class CrashQAMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 30.26714,
        longitude: -97.743192,
        zoom: 17,
        bearing: 0,
        pitch: 0,
      },
      popupInfo: null,
      markerLatitude: 0,
      markerLongitude: 0,
      mapStyle: "satellite-streets",
      pinColor: "warning",
      isDragging: false,
    };
  }

  _updateViewport = viewport => {
    this.setState({
      viewport,
      markerLatitude: viewport.latitude,
      markerLongitude: viewport.longitude,
    });
  };

  _handleMapStyleChange = e => {
    const style = e.target.id;
    // Set pin color based on map layer for visibility
    const pinColor = setPinColor(style);
    this.setState({ mapStyle: style, pinColor });
  };

  getCursor = ({ isDragging }) => {
    isDragging !== this.state.isDragging && this.setState({ isDragging });
  };

  render() {
    const { viewport } = this.state;

    return (
      <div>
        {/* TODO: add address search bar, use reported street name as initial address */}
        <MapGL
          {...viewport}
          width="100%"
          height="350px"
          mapStyle={`mapbox://styles/mapbox/${this.state.mapStyle}-v9`}
          onViewportChange={this._updateViewport}
          getCursor={this.getCursor}
          mapboxApiAccessToken={TOKEN}
        >
          <div className="fullscreen" style={fullscreenControlStyle}>
            <FullscreenControl />
          </div>
          <div className="nav" style={navStyle}>
            <NavigationControl showCompass={false} />
          </div>
          <Marker
            latitude={this.state.markerLatitude}
            longitude={this.state.markerLongitude}
          >
            <Pin
              size={40}
              color={this.state.pinColor}
              isDragging={this.state.isDragging}
            />
          </Marker>
          <ButtonGroup className="float-right mt-2 mr-2">
            <Button
              active={this.state.mapStyle === "satellite-streets"}
              id="satellite-streets"
              onClick={this._handleMapStyleChange}
              color="light"
            >
              Satellite
            </Button>
            <Button
              active={this.state.mapStyle === "streets"}
              id="streets"
              onClick={this._handleMapStyleChange}
              color="light"
            >
              Street
            </Button>
          </ButtonGroup>
        </MapGL>
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
                value={this.state.markerLatitude}
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
                id="qa-longtiude"
                name="qa-longitude"
                placeholder=""
                value={this.state.markerLongitude}
                readOnly
              />
            </Col>
            <Col
              className="mt-3
            "
            >
              {/* Records to update on submit qa status #3 (Crash status table), lat/lon confirmed, geocode source #5 (Geocoder table)*/}
              <Button className="mr-3" type="submit" size="sm" color="primary">
                <i className="fa fa-dot-circle-o"></i> Submit
              </Button>
              <Button type="reset" size="sm" color="danger">
                <i className="fa fa-ban"></i> Reset
              </Button>
            </Col>
          </FormGroup>
        </Form>
      </div>
    );
  }
}
