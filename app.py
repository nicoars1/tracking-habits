from flask import Flask
from flask_bcrypt import Bcrypt
import re
import os
from pymongo import MongoClient
import smtplib
import requests
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer as Serializer

load_dotenv()
app = Flask(__name__)
bcrypt = Bcrypt(app)
app.secret_key = os.getenv('SECRET_KEY')

# Base de datos
DB_PASSWORD = os.getenv("DB_PASSWORD")
client = MongoClient(f"mongodb+srv://habitsUsers:{DB_PASSWORD}@habitsuser.eevbec1.mongodb.net/?appName=habitsUser")
db = client["db"]
collection = db["users"]

# Configuracion de email
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
MAIL_USER = os.getenv("MAIL_USER")
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
BREVO_KEY = os.getenv("BREVO_KEY")
s = Serializer(app.secret_key)

# Funciones de utilidad
def generar_token(email, salt):
    return s.dumps(email, salt=salt)

def verificar_token(token, salt, max_age=3600):
    try:
        return s.loads(token, salt=salt, max_age=max_age)
    except Exception:
        return None
    
def enviar_email(destinatario, asunto, contenido_html):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_KEY,
        "content-type": "application/json"
    }
    payload = {
        "sender": {"email": MAIL_USER},
        "to": [{"email": destinatario}],
        "subject": asunto,
        "htmlContent": contenido_html
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code in (200, 201):
            return True
        else:
            print(f"Error enviando email: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

from routes_auth import auth_bp
from routes_main import main_bp

app.register_blueprint(auth_bp)
app.register_blueprint(main_bp)

if __name__ == '__main__':
    app.run(debug=True)