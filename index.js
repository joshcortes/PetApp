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
  let productOptions = '';
  productResult.forEach((product) => {
    productOptions += `<option value="${product.product_id}">${product.name}</option>`;
  });
  document.getElementById('products').innerHTML = productOptions;
})();
