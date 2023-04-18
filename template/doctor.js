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

loginForm.addEventListener('submit', async () => {
  const username = document.querySelector('username').value;
  const password = document.querySelector('password').value;
  const data = [username, password];
  console.log(data);
  try {
    const response = await fetch(
      (url = 'localhost:5000/doc_login'),
      (data = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      })
    );
    console.log(response.json());
    return response.json();
  } catch (error) {
    console.error(`Download error: ${error.message}`);
  }
});
