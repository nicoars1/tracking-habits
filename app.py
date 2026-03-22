from flask import Flask, render_template, redirect, url_for, session, request, flash
from flask_bcrypt import Bcrypt # Hash para contraseñas
import re # Para la validación de emails

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Emails válidos
EMAIL_RE = re.compile(r'^[^@/s]+@[^@\s]+\.[^@/s]+$')

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