if(localStorage.getItem('token')){
    loginForm = document.getElementById('loginForm');
    //loginForm.style.display = "none";
    loggedIn = document.getElementById('loggedIn');
    //loggedIn.style.display = "block";
}
else{
    loginForm = document.getElementById('loginForm');
    //loginForm.style.display = "block";
    loggedIn = document.getElementById('loggedIn');
    //loggedIn.style.display = "none";
}

loginForm.addEventListener('submit', async () => {
    const data = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
    };
    console.log(data);
    try {
      const response = await fetch((url = 'http://localhost:5000/owner_login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      const result = await response.json();
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user_id', result.owner_id);
      console.log(result);
      let output = `<h1>Welcome, ${result.first_name} ${result.last_name}</h1><table>
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
  </table>`;
      document.getElementById('pageContents').innerHTML = output;
  
      let ownerData = { user_type: 'owner_id', user_id: result.owner_id };
      // fetch pet info related to owner with /pet_info
      const petResponse = await fetch((url = 'http://localhost:5000/pet_info'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(ownerData), // body data type must match "Content-Type" header
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