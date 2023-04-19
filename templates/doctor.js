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

    let petList = `<h1>Current Patients</h1>`;

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
        <span>End: </span>${end_date}<div id="endForm"><button id="end" 
        onclick="endForm(${condition.condition_id},
        ${current_pet.pet_id})">Update Condition</button></div></h3>`;
        console.log(condition.condition_id);
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
        console.log(start_date);
        petList += `<h3><span>Symptom: </span>${symptom.name} 
        ${symptom.severity}
        <span>Start: </span>${start_date} 
        <span>End: </span>${end_date}<h3>`;
      }
    }
    document.getElementById('patients').innerHTML = petList;

    document.getElementById('addPet').innerHTML = `
    <div class="form-input">
    <h1>Add a Pet</h1>
    <form action="#" id="addPetForm">
      <div class="class-field">
        <label for="petname">Name</label>
        <input
          id="petname"
          type="text"
          placeholder="Enter pet name"
          required
        />
      </div>
      <div class="class-field">
        <label for="age">Age</label>
        <input
          id="age"
          type="text"
          placeholder="Enter pet age"
          required
        />
      </div>
      <div class="class-field">
        <label for="sex">Sex</label>
        <select
          id="sex"
          required
        />
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
      </div>
      <div class="class-field">
        <label for="insurance">Insurance</label>
        <input
          id="insurance"
          type="text"
          placeholder="Enter pet insurance"
          required
        />
      </div>
      <div class="class-field">
        <label for="breed">Breed</label>
        <select
          id="breed"
          required
        />
        </select>
      </div>
      <div class="field-btn">
        <input type="submit" id="addPet-btn" value="add" />
      </div>
    </form>
  </div>`;

    let options = document.getElementById('breed');
    const breedResponse = await fetch(
      (url = 'http://localhost:5000/get_breeds'),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      }
    );
    const breedResult = await breedResponse.json();
    console.log(breedResult);
    let breedOptions = '';
    breedResult.forEach((breed) => {
      breedOptions += `<option value="${breed.breed_id}">${breed.name}</option>`;
    });

    options.innerHTML = breedOptions;

    addPet();
  } catch (error) {
    document.getElementsByClassName(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
});

function addPet() {
  addPetForm.addEventListener('submit', async () => {
    let name = document.getElementById('petname').value;
    let age = document.getElementById('age').value;
    let sex = document.getElementById('sex').value;
    let insurance = document.getElementById('insurance').value;
    let breed = document.getElementById('breed').value;
    const data = {
      name: name,
      age: age,
      sex: sex,
      insurance: insurance,
      breed_id: breed,
    };
    console.log(data);
    try {
      const response = await fetch((url = 'http://localhost:5000/add_pet'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      document.getElementById(
        'errorMsg'
      ).innerHTML = `Download error: ${error.message}`;
      console.error(`Download error: ${error.message}`);
    }
  });
}

function endForm(condition_id, pet_id) {
  document.getElementById('endForm').innerHTML = `
  <form class=docDataEntry id="condUpdate" onsubmit= >
    <label for="severity">Severity: </label>
    <select
          id="severity"
          name="severity"
        >
        <option value="MILD">Mild</option>
        <option value="MODERATE">Moderate</option>
        <option value="SEVERE">Severe</option>
        </select>
                <label for="startDate">Start Date: </label>
        <input
          id="startDate"
          type="text"
          placeholder="YYYY-MM-DD"
        />
        <label for="endDate">End Date: </label>
        <input
          id="endDate"
          type="text"
          placeholder="YYYY-MM-DD"
        />
        <div class="field-btn">
        <input type="submit" id="update-btn" value="Submit Update" />
        <button>Back</button>
      </div>
  </form>`;
  console.log(condition_id, pet_id);
  const condUpdate = document.getElementById('condUpdate');

  condUpdate.addEventListener('submit', function (e) {
    e.preventDefault();
    const updateData = {
      severity: document.getElementById('severity').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      condition_id: condition_id,
      pet_id: pet_id,
    };
    console.log(updateData);
    try {
      fetch((url = 'http://localhost:5000/update_condition'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData), // body data type must match "Content-Type" header
      });
    } catch (error) {
      document.getElementsByClassName(
        'errorMsg'
      ).innerHTML = `Download error: ${error.message}`;
      console.error(`Download error: ${error.message}`);
    }
  });
}
