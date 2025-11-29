import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import Location from "@/components/Location";
import Reviews from "@/components/Reviews";
import Reports from "@/components/Reports";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <Gallery />
      <Pricing />
      <Location />
      <Reviews />
      <Reports />
      <Footer />
    </div>
  );
};

export default Index;
