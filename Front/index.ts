function initMap(): void {
  const chicago = new google.maps.LatLng(41.85, -87.65);
  const dc = new google.maps.LatLng(38.906624, -77.065774)

  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: dc,
      zoom: 6,
    }
  );

  const coordInfoWindow = new google.maps.InfoWindow();

  coordInfoWindow.setContent(createInfoWindowContent(dc, map.getZoom()!));
  coordInfoWindow.setPosition(dc);
  coordInfoWindow.open(map);

  map.addListener("zoom_changed", () => {
    coordInfoWindow.setContent(
      createInfoWindowContent(dc, map.getZoom()!)
    );
    coordInfoWindow.open(map);
  });
}

const TILE_SIZE = 256;

function createInfoWindowContent(latLng: google.maps.LatLng, zoom: number) {
  const scale = 1 << zoom;

  const worldCoordinate = project(latLng);

  const pixelCoordinate = new google.maps.Point(
    Math.floor(worldCoordinate.x * scale),
    Math.floor(worldCoordinate.y * scale)
  );

  const tileCoordinate = new google.maps.Point(
    Math.floor((worldCoordinate.x * scale) / TILE_SIZE),
    Math.floor((worldCoordinate.y * scale) / TILE_SIZE)
  );

  return [
    "Chicago, IL",
    "LatLng: " + latLng,
    "Zoom level: " + zoom,
    "World Coordinate: " + worldCoordinate,
    "Pixel Coordinate: " + pixelCoordinate,
    "Tile Coordinate: " + tileCoordinate,
  ].join("<br>");
}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng: google.maps.LatLng) {
  let siny = Math.sin((latLng.lat() * Math.PI) / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);

  return new google.maps.Point(
    TILE_SIZE * (0.5 + latLng.lng() / 360),
    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
  );
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

