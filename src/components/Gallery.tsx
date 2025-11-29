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
    <section id="galeria" className="py-24 px-6 bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Galería
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Espacios diseñados para reconectar con tu esencia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-elegant hover:shadow-dramatic transition-all duration-700 animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute bottom-8 left-8 right-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-background text-2xl font-semibold tracking-wide">{image.alt}</p>
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
