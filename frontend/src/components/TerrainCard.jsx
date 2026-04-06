// el diablo
import { Link } from 'react-router-dom'
import './TerrainCard.css'

export default function TerrainCard(props) {
    return (
        <div className="terrain-card">

            <h2>{props.nombre}</h2>

            <Link to={`/terreno/${props.id}`}>
                <img src={props.imagen} alt={props.nombre} />
            </Link>

            <div className="terrain-info">
                <p><strong>Ubicación:</strong> {props.ubicacion}</p>
                <p className="price">$ {props.precio} MXN</p>
                <Link to={`/terreno/${props.id}`} className="more-info-btn">
                    Más información
                </Link>
            </div>

        </div>
    )
}