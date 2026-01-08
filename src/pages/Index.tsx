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
      <div ref={containerRef} className="relative w-full">
        <StickySection index={0} className="bg-background">
          <Hero />
        </StickySection>
        
        <StickySection index={1} id="albuns" className="bg-background">
          <Gallery />
        </StickySection>
        
        <StickySection index={2} id="sobre" className="bg-background">
          <About />
        </StickySection>
        
        <StickySection index={3} id="servicos" className="bg-background">
          <Services />
        </StickySection>
        
        <StickySection index={4} id="depoimentos" className="bg-background">
          <Testimonials />
        </StickySection>
        
        <StickySection index={5} id="contato" className="bg-background">
          <Contact />
        </StickySection>
        
        <StickySection index={6} className="bg-soft-black">
          <Footer />
        </StickySection>
      </div>
    </main>
  );
};

export default Index;