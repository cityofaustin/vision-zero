import { MapController } from "react-map-gl";

// This custom controller fixes the issue where mouse events were propagating through
// the geocoder control to the map below. The code below ignores these events for specific classes.
// https://github.com/uber/react-map-gl/blob/master/docs/advanced/custom-map-controller.md

export class CustomGeocoderMapController extends MapController {
  _onPan(event) {
    // ignore pan (drag) on geocoder and map style inputs
    if (
      this._isGeocoderInputNode(event.target) ||
      this._isMapStyleInputNode(event.target)
    ) {
      return;
    }

    super._onPan(event);
  }

  _onDoubleTap(event) {
    // ignore double taps on geocoder and map style inputs
    if (
      this._isGeocoderInputNode(event.target) ||
      this._isMapStyleInputNode(event.target)
    ) {
      return;
    }

    super._onDoubleTap(event);
  }

  _onPanStart(event) {
    // ignore pan (drag) start on geocoder and map style inputs
    if (
      this._isGeocoderInputNode(event.target) ||
      this._isMapStyleInputNode(event.target)
    ) {
      return;
    }

    super._onPanStart(event);
  }

  _isGeocoderInputNode(node) {
    return node.classList.contains("mapboxgl-ctrl-geocoder--input");
  }
  _isMapStyleInputNode(node) {
    return node.classList.contains("map-style-selector");
  }
}
