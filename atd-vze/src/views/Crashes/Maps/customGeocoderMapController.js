import { MapController } from "react-map-gl";

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
