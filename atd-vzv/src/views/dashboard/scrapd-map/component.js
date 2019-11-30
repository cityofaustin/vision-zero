import Proptypes from 'prop-types';
import React from 'react';
import ReactMapboxGl from 'react-mapbox-gl';
import styled from '@emotion/styled';
import { Cluster, Feature, Layer, Marker } from 'react-mapbox-gl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBiking, faCarCrash, faMotorcycle, faWalking } from '@fortawesome/free-solid-svg-icons';

const Map = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoicmdyZWluaG9mZXIiLCJhIjoiY2pwMWt1aGxwMDI0czNrbGJmN2JxaDdsdSJ9.B84ADcgppQIggUtHv4C3UQ',
  height: '400px'
});

const MapDiv = styled.div({
  height: '90vh',
  width: '80vw',
  display: 'inline-block',
  borderRadius: '5px',
  border: '1px solid',
  margin: '2em 0'
});

const clusterMarkerStyle = {
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  border: '2px solid #A70308',
  cursor: 'pointer'
};

const clusterMarkerStyleXS = {
  ...clusterMarkerStyle,
  width: 30,
  height: 30,
  backgroundColor: '#FF0000'
};

const clusterMarkerStyleS = {
  ...clusterMarkerStyle,
  width: 40,
  height: 40,
  backgroundColor: '#BF0000'
};

const clusterMarkerStyleM = {
  ...clusterMarkerStyle,
  width: 50,
  height: 50,
  backgroundColor: '#800000'
};

const clusterMarkerStyleL = {
  ...clusterMarkerStyle,
  width: 60,
  height: 60,
  backgroundColor: '#400000'
};

const clusterMarkerStyleXL = {
  ...clusterMarkerStyle,
  width: 70,
  height: 70,
  backgroundColor: '#000000'
};

const markerStyle = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#FC4B51',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '2px solid #A70308'
};

const markerStyleMotorcycle = {
  ...markerStyle,
  backgroundColor: '#0066CC',
  borderColor: '#0066CC'
};

const markerStylePedestrian = {
  ...markerStyle,
  backgroundColor: '#CCCC00',
  borderColor: '#CCCC00'
};

const markerStyleBicycle = {
  ...markerStyle,
  backgroundColor: 'orange',
  borderColor: 'orange'
};

const markerStyleMotor = {
  ...markerStyle,
  backgroundColor: 'brown',
  borderColor: 'brown'
};

function clusterMarker(coordinates, count) {
  let clusterStyle;
  if (count >= 2 && count <= 4) {
    clusterStyle = clusterMarkerStyleXS;
  } else if (count >= 5 && count <= 7) {
    clusterStyle = clusterMarkerStyleS;
  } else if (count >= 8 && count <= 11) {
    clusterStyle = clusterMarkerStyleM;
  } else if (count >= 12 && count <= 15) {
    clusterStyle = clusterMarkerStyleL;
  } else {
    clusterStyle = clusterMarkerStyleXL;
  }
  return (
    <Marker coordinates={coordinates} style={clusterStyle}>
      <div>{count}</div>
    </Marker>
  );
}

function SingleMarker(fatality) {
  let Icon;
  let SingleMarkerStyle = markerStyle;
  if (fatality.unit_mode == 'motorcycle') {
    SingleMarkerStyle = markerStyleMotorcycle;
    Icon = <FontAwesomeIcon icon={faMotorcycle} />;
  } else if (fatality.unit_mode == 'pedestrian') {
    SingleMarkerStyle = markerStylePedestrian;
    Icon = <FontAwesomeIcon icon={faWalking} />;
  } else if (fatality.unit_mode == 'bicycle') {
    SingleMarkerStyle = markerStyleBicycle;
    Icon = <FontAwesomeIcon icon={faBiking} />;
  } else if (fatality.unit_mode == 'MOTOR VEHICLE & MOTOR VEHICLE') {
    SingleMarkerStyle = markerStyleMotor;
    Icon = <FontAwesomeIcon icon={faCarCrash} />;
  }

  // Trick to ignore invalid markers. react-mapbox-gl REQUIRES a markers to be placed if it is declare. It is not
  // possible to simply return a div or a similar element. So to cheat, I put all the invalid markers at the prime
  // meridian (0,0).
  // A cleaner way would be to filter out invalid coordinates in the `map` function calling this one.
  if (isNaN(parseFloat(fatality.longitude)) || isNaN(parseFloat(fatality.latitude))) {
    console.log('Invalid marker coordinates: [' + fatality.longitude + ', ' + fatality.latitude + ']');
    return <Marker key={fatality.crash_id} style={SingleMarkerStyle} coordinates={[0, 0]} />;
  }

  console.log('Marker coordinates: [' + parseFloat(fatality.longitude) + ', ' + parseFloat(fatality.latitude) + ']');

  return (
    <Marker key={fatality.crash_id} style={SingleMarkerStyle} coordinates={[parseFloat(fatality.longitude), parseFloat(fatality.latitude)]}>
      {Icon}
    </Marker>
  );
}

const layerPaint = {
  'heatmap-weight': {
    type: 'exponential',
    stops: [[0, 0], [5, 2]]
  },
  // Increase the heatmap color weight weight by zoom level
  // heatmap-ntensity is a multiplier on top of heatmap-weight
  'heatmap-intensity': {
    stops: [[0, 0], [5, 1.2]]
  },
  // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
  // Begin color ramp at 0-stop with a 0-transparancy color
  // to create a blur-like effect.
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(33,102,172,0)',
    0.25,
    'rgb(103,169,207)',
    0.5,
    'rgb(209,229,240)',
    0.8,
    'rgb(253,219,199)',
    1,
    'rgb(239,138,98)',
    // 2,
    // 'rgb(178,24,43)'
  ],
  // Adjust the heatmap radius by zoom level
  // 'heatmap-radius': {
  //   stops: [[0, 1], [5, 15]]
  // }
  'heatmap-radius': 13
};

class ScrapdMap extends React.Component {
  render() {
    return (
      <MapDiv>
        <Map
          style="mapbox://styles/mapbox/streets-v11"
          containerStyle={{
            height: '100%',
            width: '100%'
          }}
          center={[-97.740313, 30.274687]}
          zoom={[12]}
        >
          {/* <Cluster ClusterMarkerFactory={clusterMarker}>{this.props.fatalities.map(SingleMarker)}</Cluster> */}
          <Layer type="heatmap" paint={layerPaint}>
            {this.props.fatalities.map((el, index) => (
              <Feature key={index} coordinates={[parseFloat(el.longitude), parseFloat(el.latitude)]} properties={el} />
            ))}
          </Layer>
        </Map>
      </MapDiv>
    );
  }
}

ScrapdMap.propTypes = {
  fatalities: Proptypes.array
};

export default ScrapdMap;
