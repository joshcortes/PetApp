// async () => {
//   const response = await fetch('http://localhost:5000/get_locations');
//   locations = await response.json();
// };

async function initMap() {
  const { Map } = await google.maps.importLibrary('maps');

  myMap = new Map(document.getElementById('map'), {
    center: { lat: 33.74850123320353, lng: -84.3878613378074 },
    zoom: 12,
  });

  fetch('http://localhost:5000/get_all_locations')
    .then((response) => response.json())
    .then((locations) => {
      locations.forEach((location) => {
        console.log(location);
        let marker = new google.maps.Marker({
          position: { lat: Number(location.lat), lng: Number(location.lng) },
          map: myMap,
          title: location.name,
        });
        marker.setMap(myMap);
      });
    });
}
initMap();
