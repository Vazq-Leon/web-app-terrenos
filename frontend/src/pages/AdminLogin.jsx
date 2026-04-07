import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || ''

// ─── Palette ────────────────────────────────────────────────────────────────
const bg      = '#0f1117'
const surface = '#1c1e2e'
const border  = '#2e3150'
const accent  = '#7c5cfc'
const accentH = '#6a4ae8'
const textM   = '#e8eaf6'
const textMut = '#8a8fba'
const danger  = '#e05252'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [form, setForm]       = useState({ username: '', password: '' })
    const [error, setError]     = useState('')
    const [cargando, setCargando] = useState(false)

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!form.username.trim() || !form.password.trim()) {
            setError('Usuario y contraseña son requeridos')
            return
        }

        try {
            setCargando(true)
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Credenciales incorrectas')
                return
            }

            localStorage.setItem('admin_token', data.token)
            navigate('/panel-de-control')
        } catch {
            setError('Error de conexión con el servidor')
        } finally {
            setCargando(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
        }}>
            <div style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: '2.5rem',
                width: '100%',
                maxWidth: 400,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        fontSize: 40,
                        marginBottom: 8,
                    }}>🏠</div>
                    <h1 style={{
                        color: textM,
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        margin: 0,
                    }}>
                        Panel Administrativo
                    </h1>
                    <p style={{ color: textMut, fontSize: '0.875rem', marginTop: 6 }}>
                        Bienes Raíces Huatulco
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    {/* Usuario */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            color: textMut,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 6,
                        }}>
                            Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="admin"
                            autoComplete="username"
                            style={{
                                width: '100%',
                                background: '#0f1117',
                                border: `1px solid ${border}`,
                                borderRadius: 8,
                                color: textM,
                                padding: '0.65rem 0.9rem',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Contraseña */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            color: textMut,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 6,
                        }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            style={{
                                width: '100%',
                                background: '#0f1117',
                                border: `1px solid ${border}`,
                                borderRadius: 8,
                                color: textM,
                                padding: '0.65rem 0.9rem',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: `${danger}22`,
                            border: `1px solid ${danger}`,
                            borderRadius: 8,
                            color: danger,
                            padding: '0.6rem 0.9rem',
                            fontSize: '0.875rem',
                            marginBottom: '1rem',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            width: '100%',
                            background: cargando ? accentH : accent,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: cargando ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                        }}
                    >
                        {cargando ? 'Ingresando…' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
