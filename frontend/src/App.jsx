import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TerrainDetail from './pages/TerrainDetail'
import Admin from './pages/Admin'
import Footer from './components/Footer'
function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terreno/:id" element={<TerrainDetail />} />
          <Route path="/panel-de-control" element={<Admin />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App