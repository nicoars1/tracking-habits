from flask import Blueprint, render_template, redirect, url_for, session, request, flash
from werkzeug.security import check_password_hash
from datetime import datetime
import re

from app import bcrypt, collection, enviar_email, generar_token, verificar_token, EMAIL_RE

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = request.form['user']
        password = request.form['password']

        user_doc = collection.find_one({'user': user})

        if user_doc and bcrypt.check_password_hash(user_doc['password'], password):
            collection.update_one(
                {'user': user_doc['user']},
                {'$set': {'last_login': datetime.utcnow()}}
            )

            if not user_doc.get('verified', False):
                flash("Debe verificar su email antes de iniciar sesión", 'error')
                return redirect(url_for('auth.login'))
            session['user'] = user_doc['user']
            return redirect(url_for('main.home'))
        else:
            flash("Usuario o contraseña incorrectos", 'error')
            return redirect(url_for('auth.login'))
        
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user = str(request.form['user']).strip()
        email = str(request.form['email']).lower().strip()
        password = request.form['password']

        # Validaciones
        if not EMAIL_RE.match(email):
            flash("El email no tiene un formato válido", 'error')
            return redirect(url_for('register'))

        if collection.find_one({'$or': [{'email': email}, {'user': user}]}):
            flash("El correo o el usuario ya existen", 'error')
            return redirect(url_for('register'))

        if len(password) > 128:
            flash("La contraseña es demasiado larga", 'error')
            return redirect(url_for('register'))

        if len(password) < 8:
            flash("La contraseña debe tener al menos 8 caracteres", 'error')
            return redirect(url_for('register'))

        # Hash + guardar
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        collection.insert_one({
            'user': user,
            'email': email,
            'password': hashed_password,
            'verified': False,
            'created_at': datetime.utcnow(),
            'last_login': None,
            'motivation': '',
            'notifications_enabled': False,
            'habits': [],
            'total_completed': 0
        })

        # Email de verificación
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
            flash("No se pudo enviar el correo de verificación", 'error')

        return redirect(url_for('login'))

    return render_template('register.html')

@auth_bp.route('/verificar/<token>')
def verificar_email(token):
    email = verificar_token(token, salt='verificacion-email', max_age=3600)
    if not email:
        flash("El enlace es inválido o expiró", 'error')
        return redirect(url_for('login'))
    
    collection.update_one({'email': email}, {'$set': {'verified': True}})
    flash("Email verificado correctamente.")
    return redirect(url_for('login'))

@auth_bp.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    if request.method == 'POST':
        email = request.form['email'].strip().lower()
        user_doc = collection.find_one({'email': email})

        flash("Si el correo es válido, vas a recibir un enlace para recuperar tu contraseña")

        if user_doc:
            token = generar_token(email, salt='recuperar-password')
            link = url_for('reset', token=token, _external=True)
            enviado = enviar_email(
            email,
            "Recuperá tu contraseña - Habits App",
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
                                            🔐
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                                            Recuperación de contraseña
                                        </h2>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                                            Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el botón de abajo para crear una nueva.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding-bottom: 32px;">
                                        <a href="{link}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 16px;">
                                            Cambiar contraseña
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
                                            Este enlace expira en 30 minutos.<br>
                                            Si no pediste este cambio, tu cuenta sigue siendo segura y podés ignorar este mensaje.
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
        return redirect(url_for('login'))
    
    return render_template('reset_password.html')

@auth_bp.route('/reset/<token>', methods=['GET', 'POST'])
def reset(token):
    # 30 min de expiracion
    email = verificar_token(token, salt='recuperar-password', max_age=1800)
    if not email:
        flash("El enlace es inválido o expiró", 'error')
        return redirect(url_for('reset_password'))
    
    if request.method == 'POST':
        nueva = request.form['password']
        confirma = request.form['confirm_password']

        if nueva != confirma:
            flash("Las contraseñas no coinciden", 'error')
            return redirect(url_for('reset', token=token))
        
        if len(nueva) < 8:
            flash("La contraseña debe tener al menos 8 caracteres", 'error')
            return redirect(url_for('reset', token=token))
        
        if len(nueva) > 128:
            flash("La contraseña no puede tener más de 100 caracteres", 'error')
            return redirect(url_for('reset', token=token))
        
        hashed = bcrypt.generate_password_hash(nueva).decode('utf-8')
        collection.update_one({'email': email}, {'$set': {'password': hashed}})
        flash("Contraseña actualizada correctamente")
        return redirect(url_for('login'))
    
    return render_template('reset.html', token=token)

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash("Sesión cerrada correctamente")
    return redirect(url_for('main.home'))

@auth_bp.route('/delete_account', methods=['GET', 'POST'])
def delete_account():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    borrar_usuario = session['user']

    try:
        resultado = collection.delete_one({'user': borrar_usuario})

        if resultado.deleted_count > 0:
            session.clear()
            flash("Tu cuenta ha sido eliminada permanentemente. Esperamos verte pronto.", 'success')
            return redirect(url_for('home'))
        
        else:
            flash("No se pudo encontrar la cuenta para eliminar.", 'error')
            return redirect(url_for('settings'))
        
    except Exception as e:
        print(f"Error al eliminar la cuenta: {e}")
        return redirect(url_for('settings'))