import TerrainCard from '../components/TerrainCard'
import LocationSlider from '../components/LocationSlider'
import { useTerrenos } from '../context/TerrenosContext'
import './Home.css'

export default function Home() {
  const { terrenos, cargando, error } = useTerrenos()

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '60px' }}>

      <header className="home-header">
        <h1>Bienes Raices Huatulco</h1>
        <p>
          Si deseas invertir en la costa oaxaqueña, tenemos lo que necesitas y te podemos ayudar.
        </p>
      </header>

      <LocationSlider />

      <main className="terrain-grid">
        {cargando && (
          <div style={{ width: '100%', textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#888', fontSize: '18px' }}>⏳ Cargando terrenos desde el servidor...</p>
          </div>
        )}
        
        {error && (
          <div style={{ width: '100%', textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#d32f2f', fontSize: '18px' }}>⚠️ Error al conectar: {error}</p>
          </div>
        )}
        
        {!cargando && terrenos.length === 0 && !error && (
          <div className="empty-state">
            <p>No hay terrenos publicados aún o no hemos podido cargar la información. Ve al panel de control para agregar uno.</p>
          </div>
        )}

        {terrenos.map((terreno) => (
          <TerrainCard
            key={terreno.id}
            id={terreno.id}
            nombre={terreno.nombre}
            ubicacion={terreno.ubicacion}
            precio={terreno.precio}
            imagen={terreno.fotos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          />
        ))}
      </main>

    </div>
  )
}
