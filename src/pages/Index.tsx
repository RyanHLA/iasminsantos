import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import StickySection from "@/components/StickySection";
import useStickyStack from "@/hooks/useStickyStack";

const Index = () => {
  const containerRef = useStickyStack();

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Sticky Stack effect only for Hero and Gallery */}
      <div ref={containerRef} className="relative w-full">
        <StickySection index={0} className="bg-background">
          <Hero />
        </StickySection>
        
        <StickySection index={1} id="albuns" className="bg-background">
          <Gallery />
        </StickySection>
      </div>
      
      {/* Normal sections without effect */}
      <section id="sobre">
        <About />
      </section>
      <section id="servicos">
        <Services />
      </section>
      <section id="depoimentos">
        <Testimonials />
      </section>
      <section id="contato">
        <Contact />
      </section>
      <Footer />
    </main>
  );
};

export default Index;