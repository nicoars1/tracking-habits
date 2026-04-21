from flask import Flask
from flask_bcrypt import Bcrypt
import re
import os
from pymongo import MongoClient
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    msg = MIMEMultipart('alternative')
    msg['Subject'] = asunto
    msg['From'] = MAIL_USER
    msg['To'] = destinatario
    msg.attach(MIMEText(contenido_html, 'html'))
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as servidor:
            servidor.login(MAIL_USER, MAIL_PASSWORD)
            servidor.sendmail(MAIL_USER, destinatario, msg.as_string())
            return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

from routes_auth import auth_bp
from routes_main import main_bp

app.register_blueprint(auth_bp)
app.register_blueprint(main_bp)

if __name__ == '__main__':
    app.run(debug=True)