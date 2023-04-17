let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary('maps');

  map = new Map(document.getElementById('map'), {
    center: { lat: 33.74850123320353, lng: -84.3878613378074 },
    zoom: 12,
  });
}

initMap();
