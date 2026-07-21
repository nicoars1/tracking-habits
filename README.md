<p align="center">
  <img src="static/img/ruti-logo.png" alt="ruti logo" width="120">
</p>

<h1 align="center">ruti</h1>

<p align="center">
  Aplicación web de seguimiento de hábitos.
</p>

<p align="center">
  <a href="https://tracking-habits-1.onrender.com"><strong>Ver demo en vivo →</strong></a>
</p>

---

## ✨ Funcionalidades

- **Registro y seguimiento de hábitos**: crear hábitos personalizados con nombre, ícono y color.
- **Marcado diario**: tildar un hábito como completado.
- **Manejo correcto de zonas horarias**: los timestamps se guardan en UTC, pero el cliente envía su offset horario para que el servidor calcule el "día" en la hora local del usuario, evitando desincronizaciones entre distintos husos horarios.
- **Vista de calendario**: navegación mes a mes con indicadores visuales de qué hábitos se completaron cada día.
- **Cuentas de usuario**: registro con verificación de email, login, recuperación de contraseña y borrado de cuenta.
- **Modo invitado**: la app funciona sin necesidad de crear una cuenta, usando localStorage como persistencia local.
- **Sincronización automática**: si un usuario invitado crea una cuenta, sus hábitos guardados localmente se migran a la base de datos.
                                                 
---

## 🛠️ Stack técnico

**Backend**
- Python + Flask (estructurado en Blueprints: routes_auth.py, routes_main.py)
- MongoDB Atlas (vía PyMongo)
- Flask-Bcrypt para hashing de contraseñas
- Verificación de email y recuperación de contraseña con tokens firmados (itsdangerous)
- Envío de emails vía API HTTP de Brevo (en lugar de SMTP, ya que no fue soportado en el hosting elegido)
- Gunicorn como servidor WSGI de producción

**Frontend**
- JavaScript vanilla (sin frameworks), organizado en módulos por responsabilidad
- Tailwind CSS

**Testing**
- pytest

**Infraestructura**
- Desplegado en Render
- Base de datos en MongoDB Atlas

---

## 📂 Estructura del proyecto

```
tracking-habits/
├── app.py                  # Punto de entrada: configuración de Flask, DB y email
├── routes_auth.py          # Rutas de autenticación (login, registro, verificación, reset)
├── routes_main.py          # Rutas principales y API de hábitos
├── requirements.txt
├── static/
│   ├── css/
│   ├── img/                 
│   └── js/
│       ├── config.js         # Constantes y estado global
│       ├── habits.js         # Lógica de creación y toggle de hábitos
│       ├── render.js         # Renderizado de la lista de hábitos
│       ├── calendar.js       # Vista de calendario mensual
│       ├── storage.js        # Persistencia (DB o localStorage)
│       ├── sync.js           # Sincronización local → DB al loguearse
│       ├── modal.js          # Ventanas emergenes
│       ├── deleteMode.js     # Modo de eliminación de hábitos
│       └── utils.js          # Utilidades
├── templates/
│   ├── index.html
│   ├── calendario.html
│   ├── login.html
│   ├── register.html
│   ├── reset.html
│   ├── reset_password.html
│   └── settings.html
└── tests/
    └── test_api.py           
```

---

## 🧪 Tests

Los tests cubren:
- Consumo de la API de hábitos sin autenticación.
- Registro de usuario, incluyendo verificación de que la contraseña se guarda hasheada.
- Login con email no verificado vs. verificado.
- Protección de rutas privadas ante usuarios sin sesión iniciada.
- ⚒️ Trabajando en más tests...

Los datos de prueba se eliminan de la base de datos automáticamente antes y después de cada corrida para que no queden datos basura almacenados.

---

## 🌐 Notas sobre el despliegue

El proyecto está desplegado en Render (plan gratuito), conectado directamente al branch main de este repo.

- **MongoDB Atlas** (tier gratuito)
- El envío de emails usa la **API HTTP de Brevo** en lugar de SMTP directo, porque Render bloquea el tráfico saliente a los puertos SMTP en el tier gratuito.
- El servidor de producción corre con gunicorn

---

## 📌 Trabajando en mejoras para el futuro!

---

## 👤 Autor

**Nicolás Arsegot** — [github.com/nicoars1](https://github.com/nicoars1)
