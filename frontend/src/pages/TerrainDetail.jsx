import { useParams, Link } from 'react-router-dom'

export default function TerrainDetail() {
  const { id } = useParams()
  
  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>← Volver al Catálogo</Link>
      <h1>Detalle del Terreno: {id}</h1>
      <p>Aquí mostraremos los videos de tu dron, las coordenadas, precios y los botones hacia tus redes sociales.</p>
    </div>
  )
}
