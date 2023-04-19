let locations = [];
let productOptions = ``;

// const fetchProducts = () => {
//   fetch('http://localhost:5000/get_locations')
//     .then((response) => (productResults = response.json()))
//     .then(
//       productResults.forEach((product) => {
//         productOptions += (
//           <option value='${product.product_id}'>${product.name}</option>
//         );
//       })
//     );
// };

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

  // fetch('http://localhost:5000/get_locations')
  //   .then((response) => response.json())
  //   .then((locations) => {
  //     locations.forEach((location) => {
  //       let marker = new google.maps.Marker({
  //         position: { lat: location.lat, lng: location.lng },
  //         map: myMap,
  //         title: location.name,
  //       });
  //     });
  //   });
  marker.setMap(myMap);
}
// const marker = new google.maps.Marker({
//   position: { lat: 33.75148340214221, lng: -84.32222888974691 },
//   title: 'Feed & Seed Pet Supply',
//   myMap,
// });
initMap();
