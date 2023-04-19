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
    console.log(result.pet_ids);
    
    let pet_ids = {"pet_ids": result.pet_ids};
    console.log(pet_ids)
    const pet_response = await fetch((url = 'http://localhost:5000/get_pet_symptom_condition'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(pet_ids),
    });

    const pet_data = await pet_response.json();
    console.log(pet_data)
    /*
    let doctorData = { user_type: 'doctor_id', user_id: result.doctor_id };
    // fetch pet info related to doctor with /pet_info
    const petResponse = await fetch((url = 'http://localhost:5000/pet_info'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(doctorData), // body data type must match "Content-Type" header
    });
    const petResult = await petResponse.json();
    console.log(petResult);

    // output table of pet info in the HTML DOM
    let petList = `<h1>Current Patients</h1>`;
    petResult.forEach((pet) => {
      petList += `<h2>${pet.name}  ${pet.breed_id} ${pet.age} ${pet.sex}</h2>`;
    });
    document.getElementById('patients').innerHTML = petList;
    */
  } catch (error) {
    document.getElementById(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
  
});
// doc_login

//
