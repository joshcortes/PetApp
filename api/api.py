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
                   (condition_id, pet_id))

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
                   (symptom_id, pet_id))

    cursor.connection.commit()
    cursor.close()

    return "Successfully removed symptom from pet!"

@app.route("/add_pet", methods=['POST'])
@jwt_required()
@doc_required()
def add_pet():
    cursor = mysql.connection.cursor()

    name = request.json['name']
    age = request.json['age']
    sex = request.json['sex']
    insurance = request.json['insurance']
    breed_id = request.json['breed_id']

    cursor.execute('INSERT INTO Pets(name, age, sex, insurance, breed_id) VALUES(%s,%s,%s,%s,%s)',
                   (name, age, sex, insurance, breed_id))

    cursor.connection.commit()
    cursor.close()

    return "Successfully added pet to DB!"

@app.route("/designate_owner", methods=['POST'])
@jwt_required()
@doc_required()
def designate_owner():
    cursor = mysql.connection.cursor()

    pet_id = request.json['pet_id']
    owner_id = request.json['owner_id']

    cursor.execute('INSERT INTO Pet_Owner(pet_id, owner_id) VALUES(%s,%s)',
                   (pet_id,owner_id))

    cursor.connection.commit()
    cursor.close()

    return "Successfully designated owner of pet!"

@app.route("/designate_doctor", methods=['POST'])
@jwt_required()
@doc_required()
def designate_doctor():
    cursor = mysql.connection.cursor()

    pet_id = request.json['pet_id']
    doctor_id = request.json['owner_id']

    cursor.execute('INSERT INTO Pet_Owner(pet_id, owner_id) VALUES(%s,%s)',
                   (pet_id,doctor_id))

    cursor.connection.commit()
    cursor.close()

    return "Successfully designated doctor of pet!"

@app.route("/register_owner", methods=['POST'])
def register_owner():
    cursor = mysql.connection.cursor()

    first_name = request.json['first_name']
    last_name = request.json['last_name']
    email = request.json['email']
    phone = request.json['phone']
    address = request.json['address']
    username = request.json['username']
    password = request.json['password']

    cursor.execute('INSERT INTO Owners(first_name, last_name, email, phone_number, address, username, password) VALUES(%s,%s,%s,%s,%s,%s,%s)',
                   (first_name, last_name, email, phone, address, username, password))

    cursor.connection.commit()
    cursor.close()

    return "Successfully added owner!"

@app.route("/register_doctor", methods=['POST'])
def register_doctor():
    cursor = mysql.connection.cursor()

    first_name = request.json['first_name']
    last_name = request.json['last_name']
    email = request.json['email']
    phone = request.json['phone']
    address = request.json['address']
    license_number = request.json['license_number']
    username = request.json['username']
    password = request.json['password']

    cursor.execute('INSERT INTO Doctors(first_name, last_name, email, phone_number, address, license_number, username, password) VALUES(%s,%s,%s,%s,%s,%s,%s)',
                   (first_name, last_name, email, phone, address, license_number,username, password))

    cursor.connection.commit()
    cursor.close()

    return "Successfully added owner!"

# For this route to work, send via fetch a dictionary that looks like this:
# dict = {'symptoms': symptom_array[]}
@app.route("/likely_condition", methods=['POST'])
@jwt_required()
def get_likely_condition():
    cursor = mysql.connection.cursor()

    symptoms = request.json['symptoms']

    response = ''

    return response

@app.route("/search_by_x", methods=['GET'])
@jwt_required()
def search_by_x():
    '''
        searchign any attribute you want
        @table -> any table you want to search i.e. owner, pet doctor etc
        @what_to_search_for -> the attribut you want to search by i.e. name, id, conditon etc
        @specified_search_item -> The specific value you want to find i.e. samantha, kubo, bronchitis
    '''
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    table = request.json('table')
    what_to_search_for = request.json('what_to_search_for')
    specified_search_item = request.json('specified_search_item')
    
    cursor.execute('SELECT * FROM %s WHERE %s = %s',
                   (table, what_to_search_for, specified_search_item))

    cursor.connection.commit()
    cursor.close()

    data = cursor.fetchall()

    return data

@app.route("/get_product_condition", methods=['GET'])
@jwt_required()
def get_product_condition():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    condition_id = request.json('condition_id')

    cursor.execute('SELECT product_id, name, type FROM Product P JOIN Condition_Product R ON P.product_id = R.product_id WHERE C.condition_id = %s',
                   (condition_id))    

    data = cursor.fetchall()

    return data

@app.route("/get_locations", methods=['GET'])
@jwt_required()
def get_locations():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    product_id = request.json['product_id']

    cursor.execute('SELECT loc_id, address, name FROM Locations L, Product_Location P WHERE L.loc_id = P.loc_id AND P.product_id = %s',
                   (product_id))
    
    data = cursor.fetchall()

    return data