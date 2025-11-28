import meditationImage from "@/assets/gallery-meditation.jpg";
import diningImage from "@/assets/gallery-dining.jpg";
import yogaImage from "@/assets/gallery-yoga.jpg";
import roomImage from "@/assets/gallery-room.jpg";

const images = [
  { src: meditationImage, alt: "Sala de meditación" },
  { src: diningImage, alt: "Comedor" },
  { src: yogaImage, alt: "Deck de yoga" },
  { src: roomImage, alt: "Habitación" }
];

const Gallery = () => {
  return (
    <section id="galeria" className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-card-foreground">
            Galería de Fotos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce nuestros espacios diseñados para tu bienestar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white text-lg font-semibold">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
