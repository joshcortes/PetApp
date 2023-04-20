let locations = [];
let productLocationResult = [];
// let options = document.getElementById('products');
(async () => {
  const productResponse = await fetch(
    (url = 'http://localhost:5000/get_all_products'),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    }
  );
  productResult = await productResponse.json();
  let productOptions = '';
  productResult.forEach((product) => {
    productOptions += `<option id="${product.product_id}"value="${product.product_id}">${product.name}</option>`;
  });
  document.getElementById('productsList').innerHTML = productOptions;
})();

const setMapTitle = (product) => {
  document.getElementById(
    'mapTitle'
  ).innerHTML = `Showing locations that have : ${product.name}`;
};

const findProductBtn = document.getElementById('findProductBtn');
findProductBtn.addEventListener('click', async () => {
  const product = {
    product_id: document.getElementById('productsList').value,
    name: document.getElementById(document.getElementById('productsList').value)
      .innerHTML,
  };
  console.log(product);

  try {
    const response = await fetch(
      (url = 'http://localhost:5000/get_product_locations'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(product), // body data type must match "Content-Type" header
      }
    );
    const productLocationResult = await response.json();
    console.log(productLocationResult);
    initMap(productLocationResult);
    setMapTitle(product);
  } catch (error) {
    document.getElementById(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
});
