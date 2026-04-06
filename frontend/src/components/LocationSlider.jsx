import { useState, useEffect } from 'react';
import './LocationSlider.css';

export default function LocationSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const locations = [
    {
      title: "San Pedro Pochutla",
      description: "San Pedro Pochutla es un municipio vibrante, considerado el centro comercial y de distribución más importante de la costa oaxaqueña.",
      image: "https://images.trvl-media.com/place/6299471/c44a1ef9-eed9-46a4-9da9-463193a93448.jpg"
    },
    {
      title: "Santa María Huatulco",
      description: "Santa María Huatulco posee una riqueza cultural única y es la puerta histórica a uno de los destinos sustentables más hermosos de México.",
      image: "https://files.huatulcogob.com/4385fd18-d059-42f7-91ed-f9dae08bd10f.jpeg"
    },
    {
      title: "Bahías de Huatulco",
      description: "Bahías de Huatulco destaca por sus espectaculares 9 bahías y 36 playas bañadas por el Pacífico, ideales para relajarse y conectar con la naturaleza.",
      image: "https://www.mansionescruzdelmar.com/assets/img/santacruz.jpg"
    }
  ];

  const handleNext = () => {
    setActiveIndex((prev) => (prev < locations.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : locations.length - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="location-slider-container">
      <main className="intro-section">
        <div className="ls-container">
          <div className="ls-grid">
            <div className="ls-column-12">
              <ul className="slider">
                {locations.map((loc, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li key={index} className={`slider-item ${isActive ? 'active' : ''}`}>
                      <div className="ls-grid ls-vertical">
                        <div className="ls-column-md-2 hide-mobile">
                          <div className="intro">
                            <div className="title"><span className="underline">{loc.title}</span></div>
                          </div>
                        </div>
                        <div className="ls-column-md-10">
                          <div className="image-holder">
                            <img src={loc.image} alt={loc.title} />
                          </div>
                          <div className="ls-grid">
                            <div className="ls-column-md-9">
                              <div className="intro show-mobile">
                                <div className="title"><span className="underline">{loc.title}</span></div>
                              </div>
                              <p className="description">{loc.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="ls-column-12">
              <div className="controls">
                <button className="previous" onClick={handlePrev} aria-label="Anterior">
                  <span className="visually-hidden">Anterior</span>
                  <span className="icon arrow-left" aria-hidden="true"></span>
                </button>
                <button className="next" onClick={handleNext} aria-label="Siguiente">
                  <span className="visually-hidden">Siguiente</span>
                  <span className="icon arrow-right" aria-hidden="true"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
