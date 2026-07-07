from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request, flash
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
        flash("Debe iniciar sesión para entrar a los ajustes", "error")
        return redirect(url_for('auth.login'))
    
    usuario_actual = collection.find_one({'user':session['user']})
    email_actual = collection.find_one({'email':session['user']})

    return render_template('settings.html', usuario=usuario_actual, email=email_actual)

@main_bp.route('/api/habits', methods=['GET'])
def get_habits():
    if 'user' not in session:
        return jsonify({
            'source': 'local',
            'habits': []
        })
    
    user = collection.find_one({'user': session['user']})

    if not user:
        session.clear()
        return jsonify({
            'source': 'local',
            'habits': []
        })
    
    return jsonify({
        'source': 'db',
        'habits': user.get('habits', [])
    })

@main_bp.route('/api/habits', methods=['POST'])
def save_habits():
    if 'user' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    data = request.get_json()
    if not data or 'habits' not in data:
        return jsonify({'error': 'Datos inválidos'}), 400
    
    incoming_habits = data['habits']

    user = collection.find_one({'user': session['user']})
    if not user:
        return jsonify({'error': 'Usuario no ecnontrado'}), 404
    
    try:
        collection.update_one(
            {'user': session['user']},
            {'$set': {'habits': incoming_habits}}
        )
        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Error guardando en BD: {e}")
        return jsonify({'error': 'Error interno'}), 500