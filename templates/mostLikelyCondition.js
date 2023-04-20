populateSymptoms();

async function populateSymptoms(){
    let symptom1 = document.getElementById('symptom1');
    let symptom2 = document.getElementById('symptom2');
    let symptom3 = document.getElementById('symptom3');
    let symptom4 = document.getElementById('symptom4');
    const symptomResponse = await fetch(
      (url = 'http://localhost:5000/get_symptoms'),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      }
    );
    const symptomResult = await symptomResponse.json();
    console.log(symptomResult);
    let symptomOptions = '';
    symptomResult.forEach((symptom) => {
      symptomOptions += `<option value="${symptom.symptom_id}">${symptom.name}</option>`;
    });

    symptom1.innerHTML = symptomOptions;
    symptom2.innerHTML = symptomOptions;
    symptom3.innerHTML = symptomOptions;
    symptom4.innerHTML = symptomOptions;
}