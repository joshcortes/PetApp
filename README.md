# PetApp

Thank you for checking out PetApp, by Chandler Dugan, Jamie Kouttu, Christian Hart, and Eric Rivas. This is our database project submission for Database Systems CSC 4710, spring 2023. Included are all the files needed to run the app on your local machine, however some setup is needed to ensure the program functions properly. Follow these steps to get started:

1. To begin you will need to create a .env file in the root directory of the project. The required contents of this file will be attached to our submission on iCollege as a comment. Copy and paste the MAPS-API-KEY and all of the MYSQL variables into your .env file. This will allow the backend server to access our remote database.

2. Next we need to create a Python virtual environment to run the backend server that powers the app. In your terminal navigate to the "api" directory with `cd api`. Once there run the following commands:
```
python3 -m venv venv
source venv/bin/activate
```

3. You should see (venv) to the left of your terminal prompt. That means that your Python virtual environment is running. Once it is, run these commands to install all necessary dependencies and start your Flask server:
```
pip install -r requirements.txt
flask run
```

4. Last step! Open the file index.html. On line 40 of the code you should see the line `src="https://maps.googleapis.com/maps/api/js?key=APIKEY&callback=initMap"`. Inside of this URL replace the text "APIKEY" with the value of MAPS-API-KEY from your .env file.

5. Once the API key is in place the website is ready to launch! Run the index.html file in your browser of choice to get the app started!
