const loginBtn = document.getElementById('login-btn');

const generateConditionForm = (
  description,
  name,
  severity,
  startDate,
  endDate,
  formID,
  formBtnID
) => {
  return `<h3 title="${description}">
        <span>Condition:</span> ${name}, 
        ${severity} 
        <span>Start: </span>${startDate} 
        <span>End: </span>${endDate}<div id="${formID}">
        <button id=${formBtnID}>Update Condition</button></div></h3>`;
};

loginBtn.addEventListener('click', async () => {
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
    let onClickHandlers = [];

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
        let form_id = `updateForm${current_pet.pet_id}${condition.condition_id}`;
        let formBtnID = `updateFormBtn${current_pet.pet_id}${condition.condition_id}`;

        console.log(form_id);
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

        petList += generateConditionForm(
          condition.description,
          condition.name,
          condition.severity,
          start_date,
          end_date,
          form_id,
          formBtnID
        );
        console.log(condition.condition_id);
        onClickHandlers.push({
          id: formBtnID,
          func: () => {
            updateForm(condition.condition_id, current_pet.pet_id, form_id);
          },
        });
      }

      for (let k = 0; k < pet_symptoms.length; k++) {
        let symptom = pet_symptoms[k];
        start_date = '';
        end_date = '';
        let form_id = `updateForm${current_pet.pet_id}${symptom.symptom_id}`;
        let formBtnID = `updateFormBtn${current_pet.pet_id}${symptom.symptom_id}`;

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
        <span>End: </span>${end_date}<div id="${form_id}">
        <button id="${formBtnID}">Update Symptom</button></div></h3>`;
        onClickHandlers.push({
          id: formBtnID,
          func: () => {
            updateForm(symptom.symptom_id, current_pet.pet_id, form_id);
          },
        });
      }
    }
    document.getElementById('patients').innerHTML = petList;
    console.log(onClickHandlers);
    for (let onClickHandler of onClickHandlers) {
      const button = document.getElementById(onClickHandler.id);
      button.addEventListener('click', onClickHandler.func);
    }

    document.getElementById('addPet').innerHTML = `
    <div class="form-input">
    <h1>Add a Pet</h1>
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
        <button id="addPet-btn">Add Pet</button>
      </div>
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

    document.getElementById('searchPet').style.display = "block";

    searchPet(); 

    document.getElementById('deletePet').style.display = "block";
    
    deletePet();
  } catch (error) {
    document.getElementsByClassName(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
});

function addPet() {
  let addPetBtn = document.getElementById('addPet-btn');
  addPetBtn.addEventListener('click', async () => {
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

function updateForm(consym_id, pet_id, form_id) {
  console.log(form_id);
  console.log(consym_id, pet_id);
  const originalContent = document.getElementById(form_id).innerHTML;
  document.getElementById(form_id).innerHTML = `
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
        <button type="button" id="back-btn">Back</button>
      </div>
  </form>`;
  console.log(consym_id, pet_id);
  const condUpdate = document.getElementById('condUpdate');
  let backendurl = '';
  if (consym_id >= 6000) {
    backendurl += 'http://localhost:5000/update_symptom';
  } else {
    backendurl += 'http://localhost:5000/update_condition';
  }
  condUpdate.addEventListener('submit', function (e) {
    e.preventDefault();
    const updateData = {
      severity: document.getElementById('severity').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      condition_id: consym_id,
      pet_id: pet_id,
    };
    console.log(updateData);
    try {
      fetch((url = backendurl), {
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
  const backBtn = document.getElementById('back-btn');
  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById(form_id).innerHTML = originalContent;
  });
}

function searchPet(){
  document.getElementById('search-btn').addEventListener('click', async () => {
    let attribute = document.getElementById('attribute').value;
    let searchValue = document.getElementById('searchValue').value;
    const searchData = {
      attribute: attribute,
      pet_attribute: searchValue,
    };
    console.log(searchData);
    try {
      const searchResponse = await fetch((url = 'http://localhost:5000/get_pet_by_x'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(searchData), // body data type must match "Content-Type" header
      });
      const searchResult = await searchResponse.json();
      console.log(searchResult);

      let searchResults = document.getElementById('searchResults');
      let output = "";
      searchResult.forEach((pet) => {
        output += `<h2>${pet.pet_id} ${pet.name} ${pet.age} ${pet.sex} ${pet.insurance}</h2>`
      });

      searchResults.innerHTML = output;
    } catch (error) {
      document.getElementById(
        'errorMsg'
      ).innerHTML = `Download error: ${error.message}`;
      console.error(`Download error: ${error.message}`);
    }
  });
}

function deletePet(){
  document.getElementById('delete-btn').addEventListener('click', async () => {
    let petID = document.getElementById('petID').value;
    const deleteData = {
      pet_id: petID,
    };
    console.log(deleteData);
    try {
      const deleteResponse = await fetch((url = 'http://localhost:5000/delete_pet'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(deleteData), // body data type must match "Content-Type" header
      });
      const deleteResult = await deleteResponse.json();
      console.log(deleteResult);
    } catch (error) {
      document.getElementById(
        'errorMsg'
      ).innerHTML = `Download error: ${error.message}`;
      console.error(`Download error: ${error.message}`);
    }
  });
}
