from flask import Flask, render_template, redirect, url_for, session, request, flash
from flask_bcrypt import Bcrypt # Hash para contraseñas
import re # Para la validación de emails
import os # Para las claves
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
# Emails válidos
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

MAIL_USER = os.getenv("MAIL_USER")
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
s = Serializer(app.secret_key)

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

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calendario')
def calendario():
    return render_template('calendario.html')

@app.route('/user')
def user():
    if 'user' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('home')) # La idea es que si el usuario tiene sesión iniciada lo lleve a un dashboard de usuario

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = request.form['user']
        password = request.form['password']

        # Buscar usuario en base de datos
        user_doc = collection.find_one({'user': user})

        #Verificar si las credenciales son correctas
        if user_doc and bcrypt.check_password_hash(user_doc['password'], password):
            if not user_doc.get('verified', False):
                flash("Debe verificar su email antes de iniciar sesión", 'error')
                return redirect(url_for('login'))
            session['user'] = user_doc['user']
            return redirect(url_for('home'))
        else:
            flash("Usuario o contraseña incorrectos", 'error')
            return redirect(url_for('login'))
        
    return render_template('login.html')

@app.route('/verificar/<token>')
def verificar_email(token):
    email = verificar_token(token, salt='verificacion-email', max_age=3600)
    if not email:
        flash("El enlace es inválido o expiró", 'error')
        return redirect(url_for('login'))
    
    collection.update_one({'email': email}, {'$set': {'verified': True}})
    flash("Email verificado correctamente.")
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user = str(request.form['user']).strip()
        email = str(request.form['email']).lower().strip()
        password = request.form['password']

        # Validamos mails y contraseñas
        if not EMAIL_RE.match(email):
            flash("El email no tiene un formato válido")
            return redirect(url_for('register'))
        
        if collection.find_one({'$or': [{'email': email}, {'user': user}]}):
            flash("El correo o el usuario ya existen")
            return redirect(url_for('register'))
        
        if len(password) > 128:
            flash("La contraseña es demasiado larga")
            return redirect(url_for('register'))
        
        if len(password) < 8:
            flash("La contraseña debe tener al menos 8 caracteres")
            return redirect(url_for('register'))
        
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        collection.insert_one({
            'user': user,
            'email': email,
            'password': hashed_password,
            'verified': False
        })

        # Enviar mail de verificacion
        token = generar_token(email, salt='verificacion-email')
        link = url_for('verificar_email', token=token, _external=True)
        enviado = enviar_email(
            email,
            "Verificá tu cuenta - Habits App",
            f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; padding: 40px 32px; text-align: center; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                                
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <div style="width: 60px; height: 60px; background-color: #000000; border-radius: 16px; font-size: 28px; line-height: 60px; text-align: center;">
                                            ✨
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                                            ¡Hola, {user}!
                                        </h2>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                                            Estás a un paso de empezar a construir tu mejor versión. Hacé clic en el botón de abajo para verificar tu correo y activar tu progreso.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <a href="{link}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 16px;">
                                            Verificar mi cuenta
                                        </a>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 0;">
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                                            Este enlace expira en 1 hora.<br>
                                            Si no creaste esta cuenta, simplemente ignorá este mensaje.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
        )

        if enviado:
            flash("Revisá tu correo para verificar tu cuenta", 'success')
        else:
            flash("No se pudo enviar el correo de verificación. Si el problema persiste contactar con soporte.", 'error')

        return redirect(url_for('login'))
    return render_template('register.html')

