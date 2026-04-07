import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

const TerrenosContext = createContext(null)

// ── Helper: cabeceras con token JWT ──────────────────────────────────────────
function authHeaders(extra = {}) {
    const token = localStorage.getItem('admin_token')
    return {
        ...extra,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

export function TerrenosProvider({ children }) {
    const [terrenos, setTerrenos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    // ── Cargar terrenos desde el backend ──────────────────────────────────
    useEffect(() => {
        cargarTerrenos()
    }, [])

    async function cargarTerrenos() {
        try {
            setCargando(true)
            setError(null)
            const res = await fetch(`${API_URL}/api/terrenos`)
            if (!res.ok) throw new Error('Error al cargar terrenos')
            const data = await res.json()
            setTerrenos(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }

    // ── Crear terreno ─────────────────────────────────────────────────────
    async function agregarTerreno(form) {
        const res = await fetch(`${API_URL}/api/terrenos`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Error al crear terreno')
        const nuevo = await res.json()
        setTerrenos((prev) => [...prev, nuevo])
        return nuevo
    }

    // ── Editar terreno ────────────────────────────────────────────────────
    async function editarTerreno(id, cambios) {
        const res = await fetch(`${API_URL}/api/terrenos/${id}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(cambios),
        })
        if (!res.ok) throw new Error('Error al editar terreno')
        const actualizado = await res.json()
        setTerrenos((prev) => prev.map((t) => (t.id === id ? actualizado : t)))
        return actualizado
    }

    // ── Eliminar terreno ──────────────────────────────────────────────────
    async function eliminarTerreno(id) {
        const res = await fetch(`${API_URL}/api/terrenos/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
        if (!res.ok) throw new Error('Error al eliminar terreno')
        setTerrenos((prev) => prev.filter((t) => t.id !== id))
    }

    // ── Subir archivo multimedia ──────────────────────────────────────────
    async function subirMedia(terrenoId, archivo, tipo) {
        const formData = new FormData()
        formData.append('archivo', archivo)
        formData.append('tipo', tipo)

        const res = await fetch(`${API_URL}/api/terrenos/${terrenoId}/media`, {
            method: 'POST',
            headers: authHeaders(),
            body: formData,
        })
        if (!res.ok) throw new Error('Error al subir archivo')
        const media = await res.json()

        // Actualizar el terreno en el estado local con la nueva URL
        setTerrenos((prev) =>
            prev.map((t) => {
                if (t.id !== terrenoId) return t
                return {
                    ...t,
                    fotos:  tipo === 'foto'  ? [...(t.fotos  || []), media.url] : t.fotos,
                    videos: tipo === 'video' ? [...(t.videos || []), media.url] : t.videos,
                }
            })
        )
        return media
    }

    // ── Eliminar archivo multimedia ───────────────────────────────────────
    async function eliminarMedia(mediaId, terrenoId, url, tipo) {
        const res = await fetch(`${API_URL}/api/media/${mediaId}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
        if (!res.ok) throw new Error('Error al eliminar archivo')

        setTerrenos((prev) =>
            prev.map((t) => {
                if (t.id !== terrenoId) return t
                return {
                    ...t,
                    fotos:  tipo === 'foto'  ? (t.fotos  || []).filter((u) => u !== url) : t.fotos,
                    videos: tipo === 'video' ? (t.videos || []).filter((u) => u !== url) : t.videos,
                }
            })
        )
    }

    return (
        <TerrenosContext.Provider value={{
            terrenos,
            cargando,
            error,
            cargarTerrenos,
            agregarTerreno,
            editarTerreno,
            eliminarTerreno,
            subirMedia,
            eliminarMedia,
        }}>
            {children}
        </TerrenosContext.Provider>
    )
}

export function useTerrenos() {
    return useContext(TerrenosContext)
}
