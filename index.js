let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary('maps');

  myMap = new Map(document.getElementById('map'), {
    center: { lat: 33.74850123320353, lng: -84.3878613378074 },
    zoom: 12,
  });
  const marker = new google.maps.Marker({
    position: { lat: 33.75148340214221, lng: -84.32222888974691 },
    title: 'Feed & Seed Pet Supply',
    myMap,
  });
  marker.setMap(myMap);
}
initMap();
