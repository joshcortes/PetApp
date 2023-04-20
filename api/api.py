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
from flask_jwt_extended import unset_jwt_cookies
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config[
    "JWT_SECRET_KEY"
] = "super mega ultra secret code that should be changed and put away somewhere XD"  # Change this!
jwt = JWTManager(app)

## DATABASE CONFIGURATION
app.config["MYSQL_HOST"] = os.getenv("MYSQL_HOST")
app.config["MYSQL_USER"] = os.getenv("MYSQL_USER")
app.config["MYSQL_PASSWORD"] = os.getenv("MYSQL_PASSWORD")
app.config["MYSQL_DB"] = os.getenv("MYSQL_DB")
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


@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout Successful"})
    unset_jwt_cookies(response)
    return response


@app.route("/owner_login", methods=["POST"])
def login_owner():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute(
        "Select username, owner_id, first_name, last_name, email, phone_number, address, password FROM Owners WHERE username = %s AND password = %s",
        (username, password),
    )
    user = cursor.fetchone()

    owner_id = user["owner_id"]

    cursor.execute(
        """SELECT P.pet_id FROM Pets P, Pet_Owner O 
                        WHERE P.pet_id = O.pet_id AND O.owner_id = %s""",
        (owner_id,),
    )
    pets = cursor.fetchall()

    pet_ids = [p["pet_id"] for p in pets]

    if (user is None) or (user["username"] != username or user["password"] != password):
        return {"msg": "Wrong username or password"}, 401

    access_token = create_access_token(
        identity=username, additional_claims={"is_owner": True}
    )

    response = {
        "access_token": access_token,
        "owner_id": owner_id,
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "email": user["email"],
        "phone_number": user["phone_number"],
        "address": user["address"],
        "pet_ids": pet_ids,
    }
    return response


@app.route("/doc_login", methods=["POST"])
def login_doc():
    print("did somethign")
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute(
        "Select doctor_id, username, password, first_name, last_name, email, phone_number, address, license_number FROM Doctors WHERE username = %s AND password = %s",
        (username, password),
    )
    user = cursor.fetchone()
    print(user)

    doctor_id = user["doctor_id"]

    cursor.execute(
        """SELECT P.pet_id FROM Pets P, Pet_Doctor D 
                        WHERE P.pet_id = D.pet_id AND D.doctor_id = %s""",
        (doctor_id,),
    )
    pets = cursor.fetchall()
    print(pets)
    # for pet in pets:
    #     pet_ids.append(pet[0])
    pet_ids = [p["pet_id"] for p in pets]

    print(pet_ids)

    if (user is None) or (user["username"] != username or user["password"] != password):
        return {"msg": "Wrong username or password"}, 401

    access_token = create_access_token(
        identity=username, additional_claims={"is_doctor": True}
    )

    response = {
        "access_token": access_token,
        "doctor_id": doctor_id,
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "email": user["email"],
        "phone_number": user["phone_number"],
        "address": user["address"],
        "license_number": user["license_number"],
        "pet_ids": pet_ids,
    }
    return response


@app.route("/pet_info", methods=["GET", "POST"])
@jwt_required()
def get_pet_info():
    user_type = request.json.get("user_type", None)
    user_id = request.json.get("user_id", None)

    # cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    print(user_type, user_id)
    if user_type == "owner_id":
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            "SELECT P.pet_id, P.name, P.age, P.sex, S.name "
            + "FROM Pet_Owner O, Pets P, Breeds_species S "
            + "WHERE O.pet_id = P.pet_id AND P.breed_id=S.breed_id AND O.owner_id = %s",
            (user_id,),
        )
        pet = cursor.fetchall()
        print(pet)
    elif user_type == "doctor_id":
        print("doctor")
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            "SELECT P.pet_id, P.name, P.age, P.sex, S.name "
            + "FROM Pet_Doctor D, Pets P, Breeds_species S "
            + "WHERE D.pet_id = P.pet_id AND P.breed_id=S.breed_id AND D.doctor_id = %s",
            (user_id,),
        )
        pet = cursor.fetchall()
    else:
        return {"msg": "Unknown user type"}, 401

    if pet is not None:
        pet_data = []
        for row in pet:
            pet_data_row = {
                "pet_id": row["pet_id"],
                "name": row["name"],
                "age": row["age"],
                "sex": row["sex"],
                "breed_id": row["S.name"],
            }
            pet_data.append(pet_data_row)
        return pet_data

    return {"msg": "No pet found"}, 404


@app.route("/pet_history", methods=["GET"])
@jwt_required()
def get_pet_history():
    pet_id = request.json.get("pet_id", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute(
        """SELECT name, affected_part, severity, startDate, endDate 
                        FROM Symptoms S, Pet_Symptom P 
                        WHERE S.symptom_id = P.symptom_ID AND P.pet_id = %s""",
        (pet_id),
    )

    history = cursor.fetchone()
    pet_history = {
        "name": history["name"],
        "affected_part": history["affected_part"],
        "severity": history["severity"],
        "startDate": history["startDate"],
        "endDate": history["endDate"],
    }
    return pet_history


@app.route("/add_pet_condition", methods=["POST"])
@jwt_required()
@doc_required()
def add_pet_condition():
    cursor = mysql.connection.cursor()

    pet_id = request.json["pet_id"]
    startDate = request.json["starDate"]
    endDate = request.json["endDate"]
    severity = request.json["severity"]
    conditon_name = request.json["condition_name"]

    cursor.execute(
        """INSERT INTO Pet_Condition(condition_id, pet_id, startDate, endDate, severity)
                        SELECT condition_id, %s, %s, %s, %s 
                        FROM Conditions 
                        WHERE name = %s""",
        (pet_id, startDate, endDate, severity, conditon_name),
    )

    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully added condition to db!")


@app.route("/add_pet_symptom", methods=["POST"])
@jwt_required()
@doc_required()
def add_pet_symptom():
    cursor = mysql.connection.cursor()

    pet_id = request.json["pet_id"]
    startDate = request.json["starDate"]
    endDate = request.json["endDate"]
    severity = request.json["severity"]
    symptom_name = request.json["symptom_name"]

    cursor.execute(
        """INSERT INTO Pet_Symptom(symptom_id, pet_id, startDate, endDate, severity) 
                        SELECT symptom_id, %s,%s,%s,%s 
                        FROM Symptoms 
                        WHERE name = %s""",
        (pet_id, startDate, endDate, severity, symptom_name),
    )

    cursor.connection.commit()
    cursor.close()

    return "Successfully added symptom to db!"


@app.route("/update_condition", methods=["POST"])
# @jwt_required()
# @doc_required()
def update_condition():
    cursor = mysql.connection.cursor()

    severity = request.json["severity"]
    end_date = request.json["endDate"]
    start_date = request.json["startDate"]
    condition_id = request.json["condition_id"]
    pet_id = request.json["pet_id"]

    cursor.execute(
        """UPDATE Pet_Condition 
                        SET startDate = %s, endDate = %s, severity = %s
                        WHERE condition_id = %s AND pet_id = %s""",
        (start_date, end_date, severity, condition_id, pet_id),
    )
    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully updated the condition end date!")


@app.route("/update_symptom", methods=["POST"])
# @jwt_required()
# @doc_required()
def update_symptom():
    cursor = mysql.connection.cursor()

    severity = request.json["severity"]
    end_date = request.json["endDate"]
    start_date = request.json["startDate"]
    symptom_id = request.json["symptom_id"]
    pet_id = request.json["pet_id"]

    cursor.execute(
        """UPDATE Pet_Symptom 
                        SET startDate = %s, endDate = %s, severity = %s
                        WHERE symptom_id = %s AND pet_id = %s""",
        (start_date, end_date, severity, symptom_id, pet_id),
    )
    cursor.connection.commit()
    cursor.close()

    return "Successfully updated the condition end date!"


@app.route("/remove_pet_conditon", methods=["POST"])
@jwt_required()
@doc_required()
def remove_pet_conditon():
    cursor = mysql.connection.cursor()

    condition_id = request.json["condition_id"]
    pet_id = request.json["pet_id"]

    cursor.execute(
        """DELETE FROM Pet_Condition 
                        WHERE condition_id = %s AND pet_id = %s""",
        (condition_id, pet_id),
    )

    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully removed condition from pet!")


@app.route("/remove_pet_symptom", methods=["POST"])
@jwt_required()
@doc_required()
def remove_pet_symptom():
    cursor = mysql.connection.cursor()

    symptom_id = request.json["symptom_id"]
    pet_id = request.json["pet_id"]

    cursor.execute(
        """DELETE FROM Pet_Symptom 
                        WHERE symptom_id = %s AND pet_id = %s""",
        (symptom_id, pet_id),
    )

    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully removed symptom from pet!")


@app.route("/add_pet", methods=["POST"])
@jwt_required()
@doc_required()
def add_pet():
    cursor = mysql.connection.cursor()

    name = request.json["name"]
    age = request.json["age"]
    sex = request.json["sex"]
    insurance = request.json["insurance"]
    breed_id = request.json["breed_id"]

    cursor.execute(
        """INSERT INTO Pets(name, age, sex, insurance, breed_id) 
                        VALUES(%s,%s,%s,%s,%s)""",
        (name, age, sex, insurance, breed_id),
    )

    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully added pet to DB!")


@app.route("/designate_owner", methods=["POST"])
@jwt_required()
@doc_required()
def designate_owner():
    cursor = mysql.connection.cursor()

    pet_id = request.json["pet_id"]
    owner_id = request.json["owner_id"]

    cursor.execute(
        """INSERT INTO Pet_Owner(pet_id, owner_id) 
                        VALUES(%s,%s)""",
        (pet_id, owner_id),
    )

    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully designated owner of pet!")


@app.route("/designate_doctor", methods=["POST"])
@jwt_required()
@doc_required()
def designate_doctor():
    cursor = mysql.connection.cursor()

    pet_id = request.json["pet_id"]
    doctor_id = request.json["owner_id"]

    cursor.execute(
        """INSERT INTO Pet_Owner(pet_id, owner_id) 
                        VALUES(%s,%s)""",
        (pet_id, doctor_id),
    )

    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully designated doctor of pet!")


@app.route("/register_owner", methods=["POST"])
def register_owner():
    cursor = mysql.connection.cursor()

    first_name = request.json["first_name"]
    last_name = request.json["last_name"]
    email = request.json["email"]
    phone = request.json["phone"]
    address = request.json["address"]
    username = request.json["username"]
    password = request.json["password"]

    cursor.execute(
        """INSERT INTO Owners(first_name, last_name, email, phone_number, address, username, password) 
                        VALUES(%s,%s,%s,%s,%s,%s,%s)""",
        (first_name, last_name, email, phone, address, username, password),
    )

    cursor.connection.commit()
    cursor.close()

    return jsonify("Successfully added owner!")


@app.route("/register_doctor", methods=["POST"])
def register_doctor():
    cursor = mysql.connection.cursor()

    first_name = request.json["first_name"]
    last_name = request.json["last_name"]
    email = request.json["email"]
    phone = request.json["phone"]
    address = request.json["address"]
    license_number = request.json["license_number"]
    username = request.json["username"]
    password = request.json["password"]

    cursor.execute(
        """INSERT INTO Doctors(first_name, last_name, email, phone_number, address, license_number, username, password) 
                        VALUES(%s,%s,%s,%s,%s,%s,%s)""",
        (
            first_name,
            last_name,
            email,
            phone,
            address,
            license_number,
            username,
            password,
        ),
    )

    cursor.connection.commit()
    cursor.close()

    return "Successfully added owner!"


# For this route to work, send via fetch a dictionary that looks like this:
# dict = {'symptoms': symptom_array[]}
@app.route("/likely_condition", methods=["POST"])
def get_likely_condition():
    cursor = mysql.connection.cursor()

    symptoms = request.json["symptoms"]

    cursor.execute(
        """SELECT id, name, COUNT(symptom_id) AS MatchingSymptomsNumber
                    FROM 
                    (SELECT C.condition_id AS id, name, symptom_id 
                    FROM Conditions C
                    INNER JOIN Symptom_Indicates_Condition S 
                    ON C.condition_id = S.condition_id
                    WHERE symptom_id = %s 
                    UNION
                    SELECT C.condition_id AS id, name, symptom_id 
                    FROM Conditions C
                    INNER JOIN Symptom_Indicates_Condition S 
                    ON C.condition_id = S.condition_id
                    WHERE symptom_id = %s
                    UNION
                    SELECT C.condition_id AS id, name, symptom_id 
                    FROM Conditions C
                    INNER JOIN Symptom_Indicates_Condition S 
                    ON C.condition_id = S.condition_id
                    WHERE symptom_id = %s 
                    UNION
                    SELECT C.condition_id AS id, name, symptom_id 
                    FROM Conditions C
                    INNER JOIN Symptom_Indicates_Condition S 
                    ON C.condition_id = S.condition_id
                    WHERE symptom_id = %s) symptom_conditions
                    GROUP BY id
                    ORDER BY COUNT(symptom_id) DESC;""",
        (symptoms[0], symptoms[1], symptoms[2], symptoms[3]),
    )

    data = cursor.fetchall()
    print(data)
    condition_data = []
    for row in data:
        condition_data_row = {
            "id": row[0],
            "name": row[1],
            "symptoms_number": row[2],
        }
        condition_data.append(condition_data_row)
    
    return condition_data

@app.route("/get_symptoms", methods=["GET"])
def get_symptoms():
    """
    gets all symptoms in alphabetical order
    """
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute(
        "SELECT * FROM Symptoms ORDER BY name",
    )

    data = cursor.fetchall()

    return jsonify(data)

@app.route("/search_by_x", methods=["POST"])
@jwt_required()
def search_by_x():
    """
    searchign any attribute you want
    @table -> any table you want to search i.e. owner, pet doctor etc
    @what_to_search_for -> the attribut you want to search by i.e. name, id, conditon etc
    @specified_search_item -> The specific value you want to find i.e. samantha, kubo, bronchitis
    """
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    table = request.json["table"]
    what_to_search_for = request.json["what_to_search_for"]
    specified_search_item = request.json["specified_search_item"]

    print(table)
    print(what_to_search_for)
    print(specified_search_item)
    query = "SELECT * FROM " + table + " WHERE " + what_to_search_for + " = %s"
    cursor.execute(
        query,
        (specified_search_item),
    )

    cursor.connection.commit()
    cursor.close()

    data = cursor.fetchall()

    return jsonify(data)

@app.route("/get_breeds", methods=["GET"])
@jwt_required()
def get_breeds():
    """
    gets all breeds
    """
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute(
        "SELECT * FROM Breeds_species",
    )

    data = cursor.fetchall()

    return jsonify(data)


@app.route("/get_product_condition", methods=["GET"])
@jwt_required()
def get_product_condition():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    condition_id = request.json("condition_id")

    cursor.execute(
        """SELECT product_id, name, type 
                        FROM Product P 
                        JOIN Condition_Product R ON P.product_id = R.product_id 
                        WHERE C.condition_id = %s""",
        (condition_id),
    )

    data = cursor.fetchall()

    return data


@app.route("/get_product_locations", methods=["GET", "POST"])
@jwt_required()
def get_locations():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    product_id = request.json["product_id"]

    cursor.execute(
        """SELECT loc_id, address, name 
                        FROM Locations L, Product_Location P 
                        WHERE L.loc_id = P.loc_id AND P.product_id = %s""",
        (product_id),
    )

    data = cursor.fetchall()

    return data


@app.route("/get_pet_symptom_condition", methods=["POST"])
# @jwt_required()
def get_pet_symptom_condition():
    """
    make sure you are sending a dictionary with an array
    """
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    pet_ids = request.json["pet_ids"]
    print(pet_ids)
    all_pet_info = {}

    for pet_id in pet_ids:
        cursor.execute(
            """SELECT C.condition_id, C.name, C.description, P.startDate, P.endDate, P.severity 
                            FROM Conditions C, Pet_Condition P
                            WHERE P.pet_id = %s AND C.condition_id = P.condition_id""",
            (pet_id,),
        )
        conditions = cursor.fetchall()

        cursor.execute(
            """SELECT S. symptom_id, S.name, S.affected_part, P.startDate, P.endDate, P.severity 
                            FROM Symptoms S, Pet_Symptom P
                            WHERE S.symptom_id=P.symptom_id AND pet_id = %s""",
            (pet_id,),
        )

        symptoms = cursor.fetchall()

        con_symp_dict = {"conditions": conditions, "symptoms": symptoms}

        all_pet_info[pet_id] = con_symp_dict

    cursor.close()

    response = all_pet_info

    return response


@app.route("/get_all_locations", methods=["GET"])
def get_all_locations():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("""SELECT * FROM Locations where loc_id < 9005""")

    locations = cursor.fetchall()

    return jsonify(locations)


@app.route("/get_all_products", methods=["GET"])
def get_all_products():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("""SELECT product_id, name FROM Products""")

    products = cursor.fetchall()

    return jsonify(products)

@app.route("/delete_pet", methods=["POST"])
def delete_pet():
    cursor = mysql.connection.cursor()
    pet_id = request.json['pet_id']
    cursor.execute('DELETE FROM Pets WHERE pet_id = %s',
                   (pet_id,))
    mysql.connection.commit()
    cursor.close()

    return "Successfully deleted user!"

@app.route("/get_pet_by_x", methods=['POST'])
def get_pet_by_x():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    attribute = request.json['attribute']
    pet_attribute = request.json['pet_attribute']
    querey = 'Select * FROM Pets WHERE ' + attribute +' = %s'
    cursor.execute(querey,(pet_attribute,))
    pets = cursor.fetchall()

    return jsonify(pets)