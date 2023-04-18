if (localStorage.getItem('token')) {
  loginForm = document.getElementById('loginForm');
  loginForm.style.display = 'none';
  loggedIn = document.getElementById('loggedIn');
  loggedIn.style.display = 'block';
} else {
  loginForm = document.getElementById('loginForm');
  //loginForm.style.display = "block";
  loggedIn = document.getElementById('loggedIn');
  loggedIn.style.display = 'none';
}

// loginForm.addEventListener('submit', async () => {
//   const username = document.getElementById('username').value;
//   const password = document.getElementById('password').value;
//   const data = { username: username, password: password };
//   console.log(data);
//   axios
//     .post('http://localhost/doc_login', data)
//     .then((response) => {
//       console.log(`POST: user is added`, response.data); // append to DOM
//       appendToDOM([response.data]);
//     })
//     .catch((error) => console.error(error));
// });

loginForm.addEventListener('submit', async () => {
  const data = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
  };
  console.log(data);
  try {
    const response = await fetch((url = 'http://localhost:5000/doc_login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    const result = await response.json();
    localStorage.setItem('token', result.access_token);
    localStorage.setItem('user_id', result.doctor_id);
    console.log(result);
    let output = `<h1>Welcome, Dr. ${result.last_name}</h1><table>
  <tr>
    <td>Email:</td>
    <td>${result.email}</td>
  </tr>
  <tr>
    <td>Phone number:</td>
    <td>${result.phone_number}</td>
  </tr>
  <tr>
    <td>Address:</td>
    <td>${result.address}</td>
  </tr>
  <tr>
    <td>License number:</td>
    <td>${result.license_number}</td>
  </tr>
</table>`;
    document.getElementById('pageContents').innerHTML = output;

    let doctorData = { user_type: 'doctor_id', user_id: result.doctor_id };
    // fetch pet info related to doctor with /pet_info
    const petResponse = await fetch((url = 'http://localhost:5000/pet_info'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(doctorData), // body data type must match "Content-Type" header
    });
    const petResult = await petResponse.json();
    console.log(petResult);
    // output table of pet info in the HTML DOM
  } catch (error) {
    document.getElementById(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
});
