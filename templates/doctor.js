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

   

    let pet_ids = {"pet_ids": result.pet_ids};
    const pet_response = await fetch((url = 'http://localhost:5000/get_pet_symptom_condition'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(pet_ids),
    });

    const pet_data = await pet_response.json();

    let pet_ids_arr = pet_ids.pet_ids;

    let petList = `<h1>Current Patients</h1>`;

    for (let i = 0; i < pet_ids_arr.length; i++) {
      let curr_pet_id = pet_ids_arr[i];
      let pet_conditions = pet_data[curr_pet_id].conditions;
      let pet_symptoms = pet_data[curr_pet_id].symptoms;

      let current_pet = petResult[i];
      console.log(current_pet);
      petList += `<h2> ${current_pet.name} ${current_pet.breed_id} ${current_pet.age} ${current_pet.sex} <h2>`

      for (let j = 0; j < pet_conditions.length; j++) {
        let condition = pet_conditions[j];
        let start_date = '';
        let end_date = '';
        if (condition.startDate != null) {
          start_date = condition.startDate.substring(0,16);
        } else {
          start_date = condition.startDate;
        }

        if (condition.endDate != null) {
          end_date = condition.endDate.substring(0,16);
        } else {
          end_date = condition.endDate
        }
        
        
        petList += `<h3> ${condition.name} ${start_date} ${end_date} ${condition.severity} <h3>`
      }

      for (let k = 0; k < pet_symptoms.length; k++) {
        let symptom = pet_symptoms[k];
        start_date = '';
        end_date = '';
        if (symptom.startDate != null) {
          start_date = symptom.startDate.substring(0,16);
        } else {
          start_date = symptom.startDate;
        }

        if (symptom.endDate != null) {
          end_date = symptom.endDate.substring(0,16);
        } else {
          end_date = symptom.endDate
        }
        console.log(start_date);
        petList += `<h3> ${symptom.name} ${start_date} ${end_date} ${symptom.severity} ${symptom.affected_part} <h3>`
      }
    }
    document.getElementById('patients').innerHTML = petList;


     /*
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
