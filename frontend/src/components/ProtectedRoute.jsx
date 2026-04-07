import { Navigate } from 'react-router-dom'

/**
 * Protege rutas que requieren autenticación de administrador.
 * Si no hay token en localStorage redirige al login.
 */
export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
        return <Navigate to="/admin/login" replace />
    }
    return children
}
