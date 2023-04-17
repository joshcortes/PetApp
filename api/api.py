from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
import MySQLdb.cursors
import os
from functools import wraps
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import verify_jwt_in_request

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

    if (user is None) or (user['username'] != username or user['password'] != password):
        return {"msg": "Wrong username or password"}, 401

    access_token = create_access_token(
        identity = username,
        additional_claims={"is_owner": True}
    )

    response = {"access_token":access_token}
    return response

@app.route("/doc_login", methods=['POST'])
def login_doc():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute('Select username, doctor_id FROM Doctors WHERE username = %s AND password = %s',
                    (username, password))
    user = cursor.fetchone()

    if (user is None) or (user['username'] != username or user['password'] != password):
        return {"msg": "Wrong username or password"}, 401

    access_token = create_access_token(
        identity = username,
        additional_claims={"is_doctor": True}
    )

    response = {"access_token":access_token}
    return response

