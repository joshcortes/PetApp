populateSymptoms();

const findConditionBtn = document.getElementById('findCondition');

findConditionBtn.addEventListener('click', async () => {
    let sym1 = document.getElementById('symptom1').value;
    let sym2 = document.getElementById('symptom2').value;
    let sym3 = document.getElementById('symptom3').value;
    let sym4 = document.getElementById('symptom4').value;

    let symptom_array = [];
    symptom_array[0] = sym1;
    symptom_array[1] = sym2;
    symptom_array[2] = sym3;
    symptom_array[3] = sym4;

    /*
    for(let i = 0; i < 4; i++){
        if(symptom_array[i] = "NULL"){
            symptom_array[i] = null;
        }
    }
    */

    let dict = {symptoms: symptom_array};
    console.log(dict);
    
    const conditionsResponse = await fetch(
        (url = 'http://localhost:5000/likely_condition'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dict),
        }
    );
    const conditionsResult = await conditionsResponse.json();
    console.log(conditionsResult);

    let likelyConditions = document.getElementById('likelyConditions');

    let conditions = `<table>
        <tr>
            <th>Condition</th>
            <th>No. of Matching Symptoms</th>
        </tr>
    `;
    conditionsResult.forEach((condition) => {
        conditions += `<tr>
                <td>${condition.name}
                </td>
                <td>${condition.symptoms_number}
                </td>
            </tr>
        `;
    });
    conditions += `</table>`;

    likelyConditions.innerHTML = conditions;
});

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
    symptomOptions += `<option value="null"></option>`;
    symptomResult.forEach((symptom) => {
      symptomOptions += `<option value="${symptom.symptom_id}">${symptom.name}</option>`;
    });

    symptom1.innerHTML = symptomOptions;
    symptom2.innerHTML = symptomOptions;
    symptom3.innerHTML = symptomOptions;
    symptom4.innerHTML = symptomOptions;
}