import os
import uuid
import secrets
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from dotenv import load_dotenv
from extensions import db, jwt

load_dotenv()

app = Flask(__name__)

# ─── Configuración ───────────────────────────────────────────────────────────
database_url = os.environ.get('DATABASE_URL', '')
# Render a veces da postgres:// en lugar de postgresql://
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# La clave JWT debe estar en variables de entorno; en desarrollo se genera una aleatoria.
_jwt_secret = os.environ.get('JWT_SECRET_KEY')
if not _jwt_secret:
    import warnings
    _jwt_secret = secrets.token_hex(32)
    warnings.warn(
        "JWT_SECRET_KEY no está configurado. Se usará una clave aleatoria "
        "temporal que cambiará al reiniciar la aplicación. "
        "Configura JWT_SECRET_KEY en producción.",
        stacklevel=2,
    )
app.config['JWT_SECRET_KEY'] = _jwt_secret

# ─── Inicializar extensiones ──────────────────────────────────────────────────
db.init_app(app)
jwt.init_app(app)

CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Registro de blueprints ──────────────────────────────────────────────────
from auth import auth_bp  # noqa: E402  (importar después de configurar app)
app.register_blueprint(auth_bp)

# ─── Uploads ─────────────────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200 MB

ALLOWED_IMAGES = {'jpg', 'jpeg', 'png', 'webp', 'gif'}
ALLOWED_VIDEOS = {'mp4', 'mov', 'webm', 'avi', 'mkv'}


# ─── Modelos ──────────────────────────────────────────────────────────────────
class Terreno(db.Model):
    __tablename__ = 'terrenos'

    id          = db.Column(db.Integer, primary_key=True)
    nombre      = db.Column(db.String(200), nullable=False)
    ubicacion   = db.Column(db.String(300))
    precio      = db.Column(db.String(100))
    descripcion = db.Column(db.Text)
    coordenadas = db.Column(db.String(200))
    medias      = db.relationship('Media', backref='terreno', lazy=True,
                                  cascade='all, delete-orphan',
                                  order_by='Media.orden')

    def to_dict(self, base_url=''):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'ubicacion': self.ubicacion,
            'precio': self.precio,
            'descripcion': self.descripcion,
            'coordenadas': self.coordenadas,
            'fotos':  [f'{base_url}/uploads/{m.filename}' for m in self.medias if m.tipo == 'foto'],
            'videos': [f'{base_url}/uploads/{m.filename}' for m in self.medias if m.tipo == 'video'],
        }


class Media(db.Model):
    __tablename__ = 'media'

    id          = db.Column(db.Integer, primary_key=True)
    terreno_id  = db.Column(db.Integer, db.ForeignKey('terrenos.id'), nullable=False)
    tipo        = db.Column(db.String(10))   # 'foto' | 'video'
    filename    = db.Column(db.String(300))
    orden       = db.Column(db.Integer, default=0)


# ─── Helpers ─────────────────────────────────────────────────────────────────
def get_base_url():
    return request.host_url.rstrip('/')

def extension_permitida(filename, permitidas):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in permitidas


# ─── Rutas ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return jsonify({'status': 'ok', 'mensaje': 'API Bienes Raíces Huatulco'})


# Servir archivos estáticos subidos
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# GET /api/terrenos
@app.route('/api/terrenos', methods=['GET'])
def listar_terrenos():
    terrenos = Terreno.query.all()
    base = get_base_url()
    return jsonify([t.to_dict(base) for t in terrenos])


# GET /api/terrenos/<id>
@app.route('/api/terrenos/<int:terreno_id>', methods=['GET'])
def obtener_terreno(terreno_id):
    t = Terreno.query.get_or_404(terreno_id)
    return jsonify(t.to_dict(get_base_url()))


# POST /api/terrenos
@app.route('/api/terrenos', methods=['POST'])
@jwt_required()
def crear_terreno():
    data = request.get_json()
    if not data or not data.get('nombre'):
        return jsonify({'error': 'El nombre es requerido'}), 400

    t = Terreno(
        nombre=data.get('nombre'),
        ubicacion=data.get('ubicacion', ''),
        precio=data.get('precio', ''),
        descripcion=data.get('descripcion', ''),
        coordenadas=data.get('coordenadas', ''),
    )
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict(get_base_url())), 201


# PUT /api/terrenos/<id>
@app.route('/api/terrenos/<int:terreno_id>', methods=['PUT'])
@jwt_required()
def editar_terreno(terreno_id):
    t = Terreno.query.get_or_404(terreno_id)
    data = request.get_json()

    t.nombre      = data.get('nombre', t.nombre)
    t.ubicacion   = data.get('ubicacion', t.ubicacion)
    t.precio      = data.get('precio', t.precio)
    t.descripcion = data.get('descripcion', t.descripcion)
    t.coordenadas = data.get('coordenadas', t.coordenadas)

    db.session.commit()
    return jsonify(t.to_dict(get_base_url()))


# DELETE /api/terrenos/<id>
@app.route('/api/terrenos/<int:terreno_id>', methods=['DELETE'])
@jwt_required()
def eliminar_terreno(terreno_id):
    t = Terreno.query.get_or_404(terreno_id)
    # Borrar archivos físicos
    for m in t.medias:
        ruta = os.path.join(app.config['UPLOAD_FOLDER'], m.filename)
        if os.path.exists(ruta):
            os.remove(ruta)
    db.session.delete(t)
    db.session.commit()
    return jsonify({'mensaje': 'Terreno eliminado'})


# POST /api/terrenos/<id>/media  — subir foto o video
@app.route('/api/terrenos/<int:terreno_id>/media', methods=['POST'])
@jwt_required()
def subir_media(terreno_id):
    t = Terreno.query.get_or_404(terreno_id)

    if 'archivo' not in request.files:
        return jsonify({'error': 'No se envió ningún archivo'}), 400

    archivo = request.files['archivo']
    tipo = request.form.get('tipo', 'foto')   # 'foto' | 'video'

    es_imagen = extension_permitida(archivo.filename, ALLOWED_IMAGES)
    es_video  = extension_permitida(archivo.filename, ALLOWED_VIDEOS)

    if not (es_imagen or es_video):
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400

    ext = archivo.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    archivo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    orden = Media.query.filter_by(terreno_id=terreno_id, tipo=tipo).count()
    media = Media(terreno_id=terreno_id, tipo=tipo, filename=filename, orden=orden)
    db.session.add(media)
    db.session.commit()

    base = get_base_url()
    return jsonify({'id': media.id, 'url': f'{base}/uploads/{filename}', 'tipo': tipo}), 201


# DELETE /api/media/<media_id>
@app.route('/api/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
def eliminar_media(media_id):
    m = Media.query.get_or_404(media_id)
    ruta = os.path.join(app.config['UPLOAD_FOLDER'], m.filename)
    if os.path.exists(ruta):
        os.remove(ruta)
    db.session.delete(m)
    db.session.commit()
    return jsonify({'mensaje': 'Archivo eliminado'})


# ─── Init ─────────────────────────────────────────────────────────────────────
with app.app_context():
    from auth import Admin  # noqa: E402
    db.create_all()

    # Crear admin por defecto si no existe ninguno
    if not Admin.query.first():
        default_user = os.environ.get('ADMIN_USERNAME', 'admin')
        default_pass = os.environ.get('ADMIN_PASSWORD')
        if not default_pass:
            import warnings
            default_pass = 'admin1234'
            warnings.warn(
                "ADMIN_PASSWORD no está configurado. Se usará 'admin1234' como "
                "contraseña por defecto. Cambia esto en producción.",
                stacklevel=2,
            )
        Admin.crear(default_user, default_pass)

if __name__ == '__main__':
    app.run(debug=True)
