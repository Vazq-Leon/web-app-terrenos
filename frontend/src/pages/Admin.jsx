import { useState, useRef } from 'react'
import { useTerrenos } from '../context/TerrenosContext'

const formVacio = {
    nombre: '',
    ubicacion: '',
    precio: '',
    descripcion: '',
    coordenadas: '',
}

// ─── Palette ────────────────────────────────────────────────────────────────
const bg = '#0f1117'
const surface = '#1c1e2e'
const surfaceHover = '#23263a'
const border = '#2e3150'
const accent = '#7c5cfc'
const accentHover = '#6a4ae8'
const textMain = '#e8eaf6'
const textMuted = '#8a8fba'
const danger = '#e05252'
const success = '#3ecf8e'

export default function Admin() {
    const { terrenos, agregarTerreno, editarTerreno, eliminarTerreno, subirMedia } = useTerrenos()
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState(formVacio)
    const [fotosPrev, setFotosPrev] = useState([])   // URLs para preview (strings)
    const [videosPrev, setVideosPrev] = useState([]) // URLs para preview (strings)
    const [fotosArchivos, setFotosArchivos] = useState([])   // File objects pendientes
    const [videosArchivos, setVideosArchivos] = useState([]) // File objects pendientes
    const [confirmarEliminar, setConfirmarEliminar] = useState(null)
    const [guardando, setGuardando] = useState(false)
    const fotosRef = useRef()
    const videosRef = useRef()

    // ── Helpers ──────────────────────────────────────────────────────────────
    const abrirNuevo = () => {
        setForm(formVacio)
        setFotosPrev([])
        setVideosPrev([])
        setEditId(null)
        setShowForm(true)
    }

    const abrirEditar = (t) => {
        setForm({
            nombre: t.nombre,
            ubicacion: t.ubicacion,
            precio: t.precio,
            descripcion: t.descripcion,
            coordenadas: t.coordenadas,
        })
        setFotosPrev(t.fotos || [])    // URLs ya del backend
        setVideosPrev(t.videos || [])
        setFotosArchivos([])           // sin archivos nuevos pendientes
        setVideosArchivos([])
        setEditId(t.id)
        setShowForm(true)
    }

    const cerrarForm = () => {
        setShowForm(false)
        setEditId(null)
        setForm(formVacio)
        setFotosPrev([])
        setVideosPrev([])
        setFotosArchivos([])
        setVideosArchivos([])
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleFotos = (e) => {
        const archivos = Array.from(e.target.files)
        const urls = archivos.map((f) => URL.createObjectURL(f))
        setFotosPrev((prev) => [...prev, ...urls])
        setFotosArchivos((prev) => [...prev, ...archivos])
    }

    const handleVideos = (e) => {
        const archivos = Array.from(e.target.files)
        const urls = archivos.map((f) => URL.createObjectURL(f))
        setVideosPrev((prev) => [...prev, ...urls])
        setVideosArchivos((prev) => [...prev, ...archivos])
    }

    const quitarFoto = (i) => {
        setFotosPrev((prev) => prev.filter((_, idx) => idx !== i))
        setFotosArchivos((prev) => prev.filter((_, idx) => idx !== i))
    }
    const quitarVideo = (i) => {
        setVideosPrev((prev) => prev.filter((_, idx) => idx !== i))
        setVideosArchivos((prev) => prev.filter((_, idx) => idx !== i))
    }

    const guardar = async () => {
        if (!form.nombre.trim() || !form.ubicacion.trim() || !form.precio.trim()) return
        try {
            setGuardando(true)
            let terreno
            if (editId) {
                terreno = await editarTerreno(editId, form)
            } else {
                terreno = await agregarTerreno(form)
            }
            // Subir archivos nuevos
            for (const archivo of fotosArchivos) {
                await subirMedia(terreno.id, archivo, 'foto')
            }
            for (const archivo of videosArchivos) {
                await subirMedia(terreno.id, archivo, 'video')
            }
            cerrarForm()
        } catch (e) {
            alert('Error al guardar: ' + e.message)
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (id) => {
        try {
            await eliminarTerreno(id)
        } catch (e) {
            alert('Error al eliminar: ' + e.message)
        }
        setConfirmarEliminar(null)
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', backgroundColor: bg, color: textMain, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <style>{`
                @media (max-width: 768px) {
                    .admin-header { flex-direction: column; align-items: flex-start !important; gap: 16px; padding: 20px !important; }
                    .stats-container { flex-direction: column; padding: 10px 20px !important; }
                    .desktop-table { display: none !important; }
                    .mobile-cards { display: block !important; }
                    .admin-container { padding: 10px 20px 40px !important; }
                    .modal-content { width: 95% !important; padding: 20px !important; max-height: 95vh !important; }
                    .form-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 400px) {
                    .admin-header h1 { font-size: 18px !important; }
                    .modal-content { padding: 15px !important; }
                    .admin-container { padding: 10px 10px 40px !important; }
                }
                .mobile-cards { display: none; }
            `}</style>

            {/* ── Header ── */}
            <div className="admin-header" style={{ borderBottom: `1px solid ${border}`, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: surface }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '0.5px' }}>
                        🏡 Panel de Control
                    </h1>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: textMuted }}>Administra los terrenos y su contenido multimedia</p>
                </div>
                <button onClick={abrirNuevo} style={btnStyle(accent, accentHover)}>
                    + Agregar Terreno
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="stats-container" style={{ display: 'flex', gap: '16px', padding: '24px 32px 8px' }}>
                {[
                    { label: 'Total Terrenos', value: terrenos.length, color: accent },
                    { label: 'Con Fotos', value: terrenos.filter((t) => t.fotos?.length > 0).length, color: success },
                    { label: 'Con Videos', value: terrenos.filter((t) => t.videos?.length > 0).length, color: '#f5a623' },
                ].map((stat) => (
                    <div key={stat.label} style={{ flex: 1, backgroundColor: surface, borderRadius: '12px', padding: '18px 22px', border: `1px solid ${border}` }}>
                        <p style={{ margin: 0, fontSize: '12px', color: textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
                        <p style={{ margin: '6px 0 0', fontSize: '32px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Content ── */}
            <div className="admin-container" style={{ padding: '16px 32px 40px' }}>

                {/* Desktop Table */}
                <div className="desktop-table" style={{ backgroundColor: surface, borderRadius: '14px', border: `1px solid ${border}`, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${border}` }}>
                                {['Nombre', 'Ubicación', 'Precio (MXN)', 'Fotos', 'Videos', 'Acciones'].map((h) => (
                                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {terrenos.map((t, i) => (
                                <tr key={t.id} style={{ borderBottom: i < terrenos.length - 1 ? `1px solid ${border}` : 'none', transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = surfaceHover}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{t.nombre}</td>
                                    <td style={{ padding: '14px 18px', color: textMuted, fontSize: '14px' }}>{t.ubicacion}</td>
                                    <td style={{ padding: '14px 18px', color: success, fontWeight: 600 }}>$ {t.precio}</td>
                                    <td style={{ padding: '14px 18px' }}>
                                        <span style={badgeStyle(t.fotos?.length > 0 ? success : textMuted)}>
                                            {t.fotos?.length || 0} foto{t.fotos?.length !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 18px' }}>
                                        <span style={badgeStyle(t.videos?.length > 0 ? '#f5a623' : textMuted)}>
                                            {t.videos?.length || 0} video{t.videos?.length !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 18px', display: 'flex', gap: '8px' }}>
                                        <button onClick={() => abrirEditar(t)} style={btnSmall(accent)}>Editar</button>
                                        <button onClick={() => setConfirmarEliminar(t.id)} style={btnSmall(danger)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="mobile-cards">
                    {terrenos.map((t) => (
                        <div key={t.id} style={{ backgroundColor: surface, borderRadius: '12px', border: `1px solid ${border}`, padding: '20px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{t.nombre}</h3>
                                <span style={{ color: success, fontWeight: 700 }}>${t.precio}</span>
                            </div>
                            <p style={{ margin: '0 0 16px', fontSize: '14px', color: textMuted }}>📍 {t.ubicacion}</p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                <span style={badgeStyle(success)}>{t.fotos?.length || 0} fotos</span>
                                <span style={badgeStyle('#f5a623')}>{t.videos?.length || 0} videos</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => abrirEditar(t)} style={{ ...btnSmall(accent), flex: 1, padding: '10px' }}>Editar</button>
                                <button onClick={() => setConfirmarEliminar(t.id)} style={{ ...btnSmall(danger), flex: 1, padding: '10px' }}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>

                {terrenos.length === 0 && (
                    <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: surface, borderRadius: '14px', border: `1px solid ${border}` }}>
                        <p style={{ color: textMuted }}>No hay terrenos registrados. ¡Haz clic en el botón de arriba para agregar el primero!</p>
                    </div>
                )}
            </div>

            {/* ── Confirm Delete Modal ── */}
            {confirmarEliminar && (
                <Overlay onClick={() => setConfirmarEliminar(null)}>
                    <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '16px', padding: '32px', maxWidth: '380px', width: '90%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <p style={{ fontSize: '40px', margin: '0 0 12px' }}>⚠️</p>
                        <h2 style={{ margin: '0 0 8px', color: textMain }}>¿Eliminar terreno?</h2>
                        <p style={{ color: textMuted, margin: '0 0 24px' }}>Esta acción no se puede deshacer.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setConfirmarEliminar(null)} style={btnStyle(border, surfaceHover)}>Cancelar</button>
                            <button onClick={() => eliminar(confirmarEliminar)} style={btnStyle(danger, '#c43e3e')}>Sí, eliminar</button>
                        </div>
                    </div>
                </Overlay>
            )}

            {/* ── Add / Edit Form Panel ── */}
            {showForm && (
                <Overlay onClick={cerrarForm}>
                    <div className="modal-content" style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '18px', padding: '32px', maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>

                        <button onClick={cerrarForm} style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', color: textMuted, fontSize: '22px', cursor: 'pointer' }}>✕</button>

                        <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700 }}>
                            {editId ? '✏️ Editar Terreno' : '➕ Nuevo Terreno'}
                        </h2>

                        {/* Campos básicos */}
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <Field label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Bosque Sereno" />
                            <Field label="Precio (MXN) *" name="precio" value={form.precio} onChange={handleChange} placeholder="Ej: 1,200,000" />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <Field label="Ubicación *" name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Huatulco, Oaxaca" />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <Field label="Coordenadas" name="coordenadas" value={form.coordenadas} onChange={handleChange} placeholder="Ej: 15.8566° N, 96.1322° W" />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Descripción</label>
                            <textarea
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                placeholder="Describe el terreno: características, acceso, servicios..."
                                rows={4}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>

                        {/* Upload Fotos */}
                        <label style={labelStyle}>Fotos 📷</label>
                        <div
                            onClick={() => fotosRef.current.click()}
                            style={uploadZone}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleFotos({ target: { files: e.dataTransfer.files } }) }}
                        >
                            <p style={{ margin: 0, color: textMuted, fontSize: '14px' }}>📂 Haz clic o arrastra fotos aquí</p>
                            <p style={{ margin: '4px 0 0', color: textMuted, fontSize: '12px' }}>JPG, PNG, WEBP</p>
                            <input ref={fotosRef} type="file" accept="image/*" multiple onChange={handleFotos} style={{ display: 'none' }} />
                        </div>
                        {fotosPrev.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px', marginBottom: '20px' }}>
                                {fotosPrev.map((src, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <img src={src} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${border}` }} />
                                        <button onClick={() => quitarFoto(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: danger, border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: 'white', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Videos */}
                        <label style={{ ...labelStyle, marginTop: '8px' }}>Videos 🎬</label>
                        <div
                            onClick={() => videosRef.current.click()}
                            style={uploadZone}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleVideos({ target: { files: e.dataTransfer.files } }) }}
                        >
                            <p style={{ margin: 0, color: textMuted, fontSize: '14px' }}>📂 Haz clic o arrastra videos aquí</p>
                            <p style={{ margin: '4px 0 0', color: textMuted, fontSize: '12px' }}>MP4, MOV, WEBM</p>
                            <input ref={videosRef} type="file" accept="video/*" multiple onChange={handleVideos} style={{ display: 'none' }} />
                        </div>
                        {videosPrev.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px', marginBottom: '20px' }}>
                                {videosPrev.map((src, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <video src={src} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${border}` }} />
                                        <button onClick={() => quitarVideo(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: danger, border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: 'white', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Acciones */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                            <button onClick={cerrarForm} style={btnStyle(border, surfaceHover)}>Cancelar</button>
                            <button onClick={guardar} style={btnStyle(accent, accentHover)}>
                                {editId ? 'Guardar Cambios' : 'Crear Terreno'}
                            </button>
                        </div>

                    </div>
                </Overlay>
            )}

        </div>
    )
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────
function Overlay({ children, onClick }) {
    return (
        <div onClick={onClick} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' }}>
            {children}
        </div>
    )
}

function Field({ label, name, value, onChange, placeholder }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
        </div>
    )
}

// ─── Estilos compartidos ─────────────────────────────────────────────────────

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: bg,
    border: `1px solid ${border}`,
    borderRadius: '8px',
    color: textMain,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
}

const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    color: textMuted,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
}

const uploadZone = {
    border: `2px dashed ${border}`,
    borderRadius: '10px',
    padding: '22px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    marginBottom: '8px',
}

const btnStyle = (bg, hover) => ({
    padding: '10px 22px',
    backgroundColor: bg,
    color: textMain,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background 0.2s',
})

const btnSmall = (color) => ({
    padding: '6px 14px',
    backgroundColor: `${color}22`,
    color: color,
    border: `1px solid ${color}55`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background 0.2s',
})

const badgeStyle = (color) => ({
    padding: '3px 10px',
    backgroundColor: `${color}22`,
    color: color,
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
})
