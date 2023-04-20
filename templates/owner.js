let loginBtn = document.getElementById('login-btn');
loginBtn.addEventListener('click', async () => {
  const data = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
  };
  //console.log(data);
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
  </table>
  <div id='pets'></div>`;
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

    // output table of pet info in the HTML DOM
    let pet_ids = { pet_ids: result.pet_ids };
    const pet_response = await fetch(
      (url = 'http://localhost:5000/get_pet_symptom_condition'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(pet_ids),
      }
    );

    const pet_data = await pet_response.json();

    let pet_ids_arr = pet_ids.pet_ids;

    let petList = `<h1>My Pets</h1>`;

    for (let i = 0; i < pet_ids_arr.length; i++) {
      let curr_pet_id = pet_ids_arr[i];
      let pet_conditions = pet_data[curr_pet_id].conditions;
      let pet_symptoms = pet_data[curr_pet_id].symptoms;

      let current_pet = petResult[i];
      petList += `<h2> ${current_pet.name} ${current_pet.breed_id} ${current_pet.age} ${current_pet.sex} </h2>`;

      for (let j = 0; j < pet_conditions.length; j++) {
        let condition = pet_conditions[j];
        let start_date = '';
        let end_date = '';
        if (condition.startDate != null) {
          start_date = condition.startDate.substring(0, 16);
        } else {
          start_date = condition.startDate;
        }

        if (condition.endDate != null) {
          end_date = condition.endDate.substring(0, 16);
        } else {
          end_date = 'N/A';
        }

        petList += `<h3 title="${condition.description}">
        <span>Condition:</span> ${condition.name}, 
        ${condition.severity} 
        <span>Start: </span>${start_date} 
        <span>End: </span>${end_date}</h3>`;
      }

      for (let k = 0; k < pet_symptoms.length; k++) {
        let symptom = pet_symptoms[k];
        start_date = '';
        end_date = '';
        if (symptom.startDate != null) {
          start_date = symptom.startDate.substring(0, 16);
        } else {
          start_date = symptom.startDate;
        }

        if (symptom.endDate != null) {
          end_date = symptom.endDate.substring(0, 16);
        } else {
          end_date = 'N/A';
        }
        petList += `<h3><span>Symptom: </span>${symptom.name} 
        ${symptom.severity}
        <span>Start: </span>${start_date} 
        <span>End: </span>${end_date}<h3>`;
      }
    }
    //document.getElementById('your-pets').innerHTML = petList;

    document.getElementById('pets').innerHTML = petList;
  } catch (error) {
    document.getElementById(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
});
