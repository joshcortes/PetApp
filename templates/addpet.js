let options = document.getElementById('breed');
async() => {
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
      breed: breed
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
      window.location.href = "./doctor.html";
    } catch (error) {
      document.getElementById(
        'errorMsg'
      ).innerHTML = `Download error: ${error.message}`;
      console.error(`Download error: ${error.message}`);
      }
    }
  )
}