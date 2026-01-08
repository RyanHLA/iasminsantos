import { ReactNode } from "react";

interface StickySectionProps {
  children: ReactNode;
  index: number;
  id?: string;
  className?: string;
}

const StickySection = ({ children, index, id, className = "" }: StickySectionProps) => {
  return (
    <section
      id={id}
      className={`sticky-section sticky top-0 min-h-screen w-full overflow-hidden shadow-2xl transition-transform will-change-transform ${className}`}
      style={{ zIndex: index + 1 }}
    >
      {/* Overlay de Dimming */}
      <div className="section-overlay absolute inset-0 bg-black pointer-events-none opacity-0 z-50 will-change-opacity" />
      
      {/* Content wrapper */}
      <div className="section-content w-full h-full will-change-transform">
        {children}
      </div>
    </section>
  );
};

export default StickySection;