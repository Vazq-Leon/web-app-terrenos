import TerrainCard from '../components/TerrainCard'
import LocationSlider from '../components/LocationSlider'
import { useTerrenos } from '../context/TerrenosContext'

export default function Home() {
  const { terrenos, cargando, error } = useTerrenos()

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '60px' }}>

      <div style={{ padding: '40px 20px 10px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '42px', color: '#222', margin: 0 }}>
          Bienes Raices Huatulco
        </h1>
        <p style={{ color: '#555', fontSize: '18px', maxWidth: '600px', margin: '15px auto 0 auto' }}>
          Si deseas invertir en la costa oaxaqueña, tenemos lo que necesitas y te podemos ayudar.
        </p>
      </div>

      <LocationSlider />

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {cargando && <p>Cargando terrenos desde el servidor...</p>}
        {error && <p style={{ color: 'red' }}>Error al conectar: {error}</p>}

        {!cargando && terrenos.length === 0 && !error && (
          <p style={{ color: '#888' }}>No hay terrenos publicados aún. Ve al panel de control para agregar uno.</p>
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
      </div>

    </div>
  )
}
