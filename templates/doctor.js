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

    // output table of pet info in the HTML DOM
    let petList = `<h1>Current Patients</h1>`;
    petResult.forEach((pet) => {
      petList += `<h2>${pet.name}  ${pet.breed_id} ${pet.age} ${pet.sex}</h2>`;
    });
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
  const breedResponse = await fetch((url = 'http://localhost:5000/get_breeds'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
  const breedResult = await breedResponse.json();
  console.log(breedResult);
  let breedOptions = "";
  breedResult.forEach((breed) => {
    breedOptions += `<option value="${breed.breed_id}">${breed.name}</option>`;
  });

  options.innerHTML = breedOptions; 

  addPet();

  } catch (error) {
    document.getElementById(
      'errorMsg'
    ).innerHTML = `Download error: ${error.message}`;
    console.error(`Download error: ${error.message}`);
  }
});
// doc_login

//
function addPet(){

  addPetForm.addEventListener("submit", async () => {
    let name = document.getElementById("petname").value;
    let age = document.getElementById("age").value;
    let sex = document.getElementById("sex").value;
    let insurance = document.getElementById("insurance").value;
    let breed = document.getElementById("breed").value;   
    const data = {
      name: name,
      age: age,
      sex: sex,
      insurance: insurance,
      breed_id: breed
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
    }
  )
}