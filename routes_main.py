from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request, flash
from app import collection
from datetime import datetime, timezone, timedelta

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
    
@main_bp.route("/api/habits/toggle", methods=['POST'])
def toggle_habit():
    if 'user' not in session:
        return jsonify({'error': 'No autorizado'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Datos inválidos'}), 400

    habit_id = data.get('id')
    exact_time = data.get('date')
    day = data.get('day')
    offset = data.get('offset', 0)

    if not habit_id or not exact_time or not day:
        return jsonify({'error': 'Faltan datos (id, date o day)'}), 400

    user = collection.find_one({'user': session['user']})
    if not user:
        session.clear()
        return jsonify({'error': 'Usuario no encontrado'}), 404

    habits = user.get('habits', [])
    habit_encontrado = None
    for habit in habits:
        if habit['id'] == habit_id:
            habit_encontrado = habit
            break

    if not habit_encontrado:
        return jsonify({'error': 'Hábito no encontrado'}), 404

    completed_dates = habit_encontrado.get('completedDates', [])
    ya_completado_hoy = any(to_local_day(d, offset) == day for d in completed_dates)
    nuevas_fechas = [d for d in completed_dates if to_local_day(d, offset) != day]

    if not ya_completado_hoy:
        nuevas_fechas.append(exact_time)

    try:
        collection.update_one(
            {'user': session['user'], 'habits.id': habit_id},
            {'$set': {'habits.$.completedDates': nuevas_fechas}}
        )
        return jsonify({'status': 'ok', 'completed': not ya_completado_hoy})
    except Exception as e:
        print(f"Error en toggle: {e}")
        return jsonify({'error': 'Error interno'}), 500
    
def to_local_day(iso_str, offset_minutes):
    dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
    local_dt = dt - timedelta(minutes=offset_minutes)
    return local_dt.strftime('%Y-%m-%d')