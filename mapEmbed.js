// async () => {
//   const response = await fetch('http://localhost:5000/get_locations');
//   locations = await response.json();
// };
function addMarkerClickListener(marker, location) {
  marker.addListener('click', () => {
    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${location.name}</h3><p>${location.address}</p>`,
    });
    infoWindow.open(myMap, marker);
  });
}
const allLocations = async () => {
  fetch('http://localhost:5000/get_all_locations')
    .then((response) => response.json())
    .then((locations) => {
      locations.forEach((location) => {
        let marker = new google.maps.Marker({
          position: { lat: Number(location.lat), lng: Number(location.lng) },
          map: myMap,
          title: location.name,
        });
        marker.setMap(myMap);
        addMarkerClickListener(marker, location);
      });
    });
};
allLocations();

async function initMap(productLocationResult) {
  const { Map } = await google.maps.importLibrary('maps');

  myMap = new Map(document.getElementById('map'), {
    center: { lat: 33.74850123320353, lng: -84.3878613378074 },
    zoom: 12,
  });

  productLocationResult.forEach((location) => {
    let marker = new google.maps.Marker({
      position: { lat: Number(location.lat), lng: Number(location.lng) },
      map: myMap,
      title: location.name,
    });
    marker.setMap(myMap);
    addMarkerClickListener(marker, location);
  });
}
initMap();
