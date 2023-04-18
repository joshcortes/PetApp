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

app = Flask(__name__)

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

    cursor.execute('Select username, doctor_id FROM Doctors WHERE username = %s AND password = %s',
                    (username, password))
    user = cursor.fetchone()

    doctor_id = user['doctor_id']

    if (user is None) or (user['username'] != username or user['password'] != password):
        return {"msg": "Wrong username or password"}, 401

    access_token = create_access_token(
        identity = username,
        additional_claims={"is_doctor": True}
    )

    response = {"access_token": access_token,
                "doctor_id": doctor_id}
    return response

@app.route("/pet_info", methods=["GET"])
@jwt_required()
def get_pet_info():
    owner_id = request.json.get("owner_id", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute('SELECT pet_id, name, age, sex, species FROM Pet_Owner O, Pet P, Breeds_Species S WHERE O.pet_id = P.pet_id AND P.breed_id=S.breed_id AND owner_id = %s', 
                   (owner_id))
    
    pet = cursor.fetchone()
    pet_data={
        'pet_id': pet['pet_id'],
        'name': pet['name'],
        'age': pet['age'],
        'sex': pet['sex'],
        'species': pet['species']
    }

    return pet_data

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

@app.route("/add_pet_condition")
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

    return "Successfully added condition to"

