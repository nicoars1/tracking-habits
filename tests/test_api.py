import pytest
import json


from app import app, collection, bcrypt

@pytest.fixture
def client():
    app.config['TESTING'] = True

    collection.delete_many({"user": {"$regex": "^nico_test"}})

    with app.test_client() as client:
        yield client
    collection.delete_many({"user": {"$regex": "^nico_test"}})

# API
def test_get_habits_sin_autenticacion(client):
    response = client.get('/api/habits')
    data = json.loads(response.data)

    assert response.status_code == 200
    assert data['source'] == 'local'
    assert data['habits'] == []


# AUTH
def test_existe_nuevo_usuario(client):
    data ={
        "user": "nico_test",
        "email": "nico@gmail.com",
        "password": "12345678"
        }
        
    response = client.post('/register', data=data)
    new_account = collection.find_one({'user': data["user"]})
    
    assert response.status_code == 302
    assert new_account["user"] == data["user"]
    assert new_account["email"] == data["email"]
    assert not new_account["verified"]
    assert new_account["password"] != data["password"] 
    assert bcrypt.check_password_hash(new_account["password"], data["password"])

def test_iniciar_sesion_sin_verificar(client):
    data ={
        "user": "nico_test2",
        "email": "nico2@gmail.com",
        "password": "123456789"
        }
    
    client.post('/register', data=data)
    
    response = client.post("/login", data=data, follow_redirects=True)

    assert b"Debe verificar su email" in response.data

def test_iniciar_sesion_verificado(client):
    collection.insert_one({
        "user": "nico_test3",
        "email": "nico3@gmail.com",
        "password": bcrypt.generate_password_hash("12345678").decode("utf-8"),
        "verified": True
    })
    
    data = {
        "user": "nico_test3",
        "password": "12345678"
    }
    
    response = client.post("/login", data=data, follow_redirects=True)

    assert "Sesión iniciada correctamente" in response.data.decode("utf-8")

# SEGURIDAD
def test_rutas_sin_login(client):
    response = client.get("/settings", follow_redirects=True)

    assert "Debe iniciar sesión para entrar a los ajustes" in response.data.decode("utf-8")
    

