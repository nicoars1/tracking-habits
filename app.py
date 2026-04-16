from flask import Flask, render_template, redirect, url_for, session, request, flash
from flask_bcrypt import Bcrypt # Hash para contraseñas
import re # Para la validación de emails
import os # Para las claves
from pymongo import MongoClient

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Emails válidos
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

# Base de datos
DB_PASSWORD = os.getenv("DB_PASSWORD")
client = MongoClient(f"mongodb+srv://habitsUsers:{DB_PASSWORD}@habitsuser.eevbec1.mongodb.net/?appName=habitsUser")
db = client["db"]
collection = db["users"]

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

@app.route('/login')
def login():
    if request.method == 'POST':
        user = request.form['user']
        password = request.form['password']

        # Buscar usuario en base de datos
        user_doc = collection.find_one({'user: user'})

        #Verificar si las credenciales son correctas
        if user_doc and bcrypt.check_password_hash(user_doc['password'], password):
            if not user_doc.get('verified', False):
               # flash("Debe verificar su email antes de iniciar sesión")
                return redirect(url_for('login'))
            session['user'] = user_doc['user']
            return redirect(url_for('home'))
        else:
            flash("Usuario o contraseña incorrectos")
            return redirect(url_for('login'))
        
    return render_template('login.html')

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

        return redirect(url_for('login'))
    return render_template('register.html')

