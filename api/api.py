from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
import MySQLdb.cursors
import os
from functools import wraps
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended import jwt_required
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
jwt = JWTManager(app)

## DATABASE CONFIGURATION
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')
mysql = MySQL(app)

def doc_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["is_doctor"]:
                return fn(*args, **kwargs)
            else:
                return jsonify(msg="Doctors only!"), 403
        return decorator
    return wrapper

def owner_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["is_owner"]:
                return fn(*args, **kwargs)
            else:
                return jsonify(msg="Owners only!"), 403
        return decorator
    return wrapper

@app.route("/owner_login", methods=['POST'])
def login_owner():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute('Select username, owner_id FROM Owners WHERE username = %s AND password = %s',
                    (username, password))
    user = cursor.fetchone()

    owner_id = user['owner_id']

    if (user is None) or (user['username'] != username or user['password'] != password):
        return {"msg": "Wrong username or password"}, 401

    access_token = create_access_token(
        identity = username,
        additional_claims={"is_owner": True}
    )

    response = {"access_token": access_token,
                "doctor_id": owner_id}
    return response

@app.route("/doc_login", methods=['POST'])
def login_doc():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute('Select doctor_id, username, password, first_name, last_name, email, phone_number, address, license_number FROM Doctors WHERE username = %s AND password = %s',
                    (username, password))
    user = cursor.fetchone()
    print(user)

    if (user is None) or (user['username'] != username or user['password'] != password):
        return {"msg": "Wrong username or password"}, 401

    doctor_id = user['doctor_id']
    
    access_token = create_access_token(
        identity = username,
        additional_claims={"is_doctor": True}
    )

    response = {"access_token": access_token,
                "doctor_id": doctor_id,
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "email": user["email"],
                "phone_number": user["phone_number"],
                "address": user["address"],
                "license_number": user["license_number"],
                }
    return response

@app.route("/pet_info", methods=["GET"])
# @jwt_required()
def get_pet_info():
    user_type = request.json.get("user_type", None)
    user_id = request.json.get("user_id", None)

    # cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    print(user_type, user_id)
    if user_type == 'owner_id':
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT P.pet_id, P.name, P.age, P.sex, S.name ' + 
                    'FROM Pet_Owner O, Pets P, Breeds_species S ' + 
                    'WHERE O.pet_id = P.pet_id AND P.breed_id=S.breed_id AND O.owner_id = %s', 
                    (user_id,))
        pet = cursor.fetchall()
        print(pet)
    elif user_type == 'doctor_id':
        print("doctor")
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT P.pet_id, P.name, P.age, P.sex, S.name ' + 
                    'FROM Pet_Doctor D, Pets P, Breeds_species S ' + 
                    'WHERE D.pet_id = P.pet_id AND P.breed_id=S.breed_id AND D.doctor_id = %s', 
                    (user_id,))
        pet = cursor.fetchall()
    else: 
        return {"msg": "Unknown user type"}, 401
    
    
    if pet is not None:
        pet_data = []
        for row in pet:
            pet_data_row={
                'pet_id': row['pet_id'],
                'name': row['name'],
                'age': row['age'],
                'sex': row['sex'],
                'breed_id': row['S.name']
            }
            pet_data.append(pet_data_row)
        return pet_data
    
    return {"msg": "No pet found"}, 404

@app.route("/pet_history", methods=["GET"])
@jwt_required()
def get_pet_history():
    pet_id = request.json.get("pet_id", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute('SELECT name, affected_part, severity, startDate, endDate FROM Symptoms S, Pet_Symptom P WHERE S.symptom_id = P.symptom_ID AND P.pet_id = %s',
                  (pet_id))
    
    history = cursor.fetchone()
    pet_history = {
        'name': history['name'],
        'affected_part': history['affected_part'],
        'severity': history['severity'],
        'startDate': history['startDate'],
        'endDate': history['endDate']
    }
    return pet_history

@app.route("/add_pet_condition", methods=['POST'])
@jwt_required()
@doc_required()
def add_pet_condition():
    cursor = mysql.connection.cursor()

    pet_id = request.json['pet_id']
    startDate = request.json['starDate']
    endDate = request.json['endDate']
    severity = request.json['severity']
    conditon_name = request.json['condition_name']

    cursor.execute('INSERT INTO Pet_Symptom(condition_id, pet_id, startDate, endDate, severity) SELECT condition_id, %s,%s,%s,%s FROM Condition WHERE name = %s',
                   (pet_id, startDate, endDate, severity, conditon_name))
    
    cursor.connection.commit()
    cursor.close()

    return "Successfully added condition to db!"

@app.route("/add_pet_symptom", methods=['POST'])
@jwt_required()
@doc_required()
def add_pet_symptom():
    cursor = mysql.connection.cursor()

    pet_id = request.json['pet_id']
    startDate = request.json['starDate']
    endDate = request.json['endDate']
    severity = request.json['severity']
    symptom_name = request.json['symptom_name']

    cursor.execute('INSERT INTO Pet_Symptom(symptom_id, pet_id, startDate, endDate, severity) SELECT symptom_id, %s,%s,%s,%s FROM Symptom WHERE name = %s',
                   (pet_id, startDate, endDate, severity, symptom_name))
    
    cursor.connection.commit()
    cursor.close()

    return "Successfully added symptom to db!"

@app.route("/update_condition_end_date", methods=['POST'])
@jwt_required()
@doc_required()
def update_condition_end_date():
    cursor = mysql.connection.cursor()

    end_date = request.json['end_date']
    symptom_id = request.json['symptom_id']
    pet_id = request.json['pet_id']

    cursor.execute('UPDATE Pet_Symptom SET endDate = %s WHERE symptom_id = %s AND pet_id = %s',
                   (end_date, symptom_id, pet_id))
    
    cursor.connection.commit()
    cursor.close()

    return 'Successfully updated the condition end date!'

@app.route("/remove_pet_conditon", methods=['POST'])
@jwt_required()
@doc_required()
def remove_pet_conditon():
    cursor = mysql.connection.cursor()

    condition_id = request.json['condition_id']
    pet_id = request.json['pet_id']

    cursor.execute('DELETE FROM Pet_Condition WHERE condition_id = %s AND pet_id = %s',
                   condition_id, pet_id)

    cursor.connection.commit()
    cursor.close()

    return "Successfully removed condition from pet!"

@app.route("/remove_pet_symptom", methods=['POST'])
@jwt_required()
@doc_required()
def remove_pet_symptom():
    cursor = mysql.connection.cursor()

    symptom_id = request.json['symptom_id']
    pet_id = request.json['pet_id']

    cursor.execute('DELETE FROM Pet_Condition WHERE symptom_id = %s AND pet_id = %s',
                   symptom_id, pet_id)

    cursor.connection.commit()
    cursor.close()

    return "Successfully removed symptom from pet!"

@app.route("/add_pet", methods=['POST'])
@jwt_required()
@doc_required()
def add_pet():
    
    return "THIS IS NOT DUNE"