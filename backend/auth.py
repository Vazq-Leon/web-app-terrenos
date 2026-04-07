from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

auth_bp = Blueprint('auth', __name__)


# ─── Modelo Admin ─────────────────────────────────────────────────────────────
class Admin(db.Model):
    __tablename__ = 'admins'

    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)

    @staticmethod
    def crear(username, plain_password):
        """Crea un nuevo admin con contraseña hasheada."""
        hashed = generate_password_hash(plain_password)
        admin = Admin(username=username, password=hashed)
        db.session.add(admin)
        db.session.commit()
        return admin

    def verificar_password(self, plain_password):
        return check_password_hash(self.password, plain_password)


# ─── POST /api/auth/login ─────────────────────────────────────────────────────
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400

    admin = Admin.query.filter_by(username=data['username']).first()
    if not admin or not admin.verificar_password(data['password']):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    token = create_access_token(identity=admin.username)
    return jsonify({'token': token, 'username': admin.username})


# ─── POST /api/auth/logout ────────────────────────────────────────────────────
@auth_bp.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    # Con JWT sin lista negra el cliente simplemente descarta el token;
    # aquí devolvemos confirmación.
    return jsonify({'mensaje': 'Sesión cerrada correctamente'})


# ─── GET /api/auth/me ─────────────────────────────────────────────────────────
@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    username = get_jwt_identity()
    return jsonify({'username': username})
