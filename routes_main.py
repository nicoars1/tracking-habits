from flask import Blueprint, render_template, session, redirect, url_for
from app import collection

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    usuario_actual = None
    email_actual = None
    
    if 'user' in session:
        usuario_actual = collection.find_one({'user':session['user']})
        email_actual = collection.find_one({'email':session['user']})

    return render_template('index.html', usuario=usuario_actual, email=email_actual)

@main_bp.route('/calendario')
def calendario():
    return render_template('calendario.html')

@main_bp.route('/settings')
def settings():
    if 'user' not in session:
        return redirect(url_for('auth.login'))
    
    usuario_actual = collection.find_one({'user':session['user']})
    email_actual = collection.find_one({'email':session['user']})

    return render_template('settings.html', usuario=usuario_actual, email=email_actual)