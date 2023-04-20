let locations = [];
let productResult = [];
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
  console.log(productResult);
  let productOptions = '';
  productResult.forEach((product) => {
    productOptions += `<option value="${product.product_id}">${product.name}</option>`;
  });
  document.getElementById('productsList').innerHTML = productOptions;
})();

const findProductBtn = document.getElementById('findProductBtn');
findProductBtn.addEventListener('click', async () => {
  const product = { product_id: document.getElementById('productsList').value };
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
    const result = await response.json();
    console.log(result);
  } catch (error) {
    document.getElementById(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
});
