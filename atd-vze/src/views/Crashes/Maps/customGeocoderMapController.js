import { MapController } from "react-map-gl";

export class CustomGeocoderMapController extends MapController {
  _onPan(event) {
    // ignore pan on geocoder input
    if (this._isGeocoderInputNode(event.target)) {
      return;
    }

    super._onPan(event);
  }

  _onDoubleTap(event) {
    // ignore double taps on geocoder input
    if (this._isGeocoderInputNode(event.target)) {
      return;
    }

    super._onDoubleTap(event);
  }

  _isGeocoderInputNode(node) {
    return node.classList.contains("mapboxgl-ctrl-geocoder--input");
  }
}
