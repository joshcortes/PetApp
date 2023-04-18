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
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  console.log(username);
  const data = { username: username, password: password };
  console.log(data);
  try {
    const response = await fetch((url = 'localhost:5000/doc_login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    console.log(response.json());
    return response.json();
  } catch (error) {
    console.error(`Download error: ${error.message}`);
  }
});
