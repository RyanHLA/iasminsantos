import { useEffect, useRef } from "react";

export const useStickyStack = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let requestAnimationFrameId: number;

    const handleScroll = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      if (!containerRef.current) return;

      const sections = containerRef.current.querySelectorAll('.sticky-section');
      const viewportHeight = window.innerHeight;

      sections.forEach((section, index) => {
        if (index === sections.length - 1) return;

        const card = section as HTMLElement;
        const nextCard = sections[index + 1] as HTMLElement;
        if (!nextCard) return;

        const nextCardRect = nextCard.getBoundingClientRect();
        
        if (nextCardRect.top > viewportHeight * 1.5) {
          card.style.transform = 'scale(1)';
          const overlay = card.querySelector('.section-overlay') as HTMLElement;
          if (overlay) overlay.style.opacity = '0';
          return; 
        }

        const distanceToTop = nextCardRect.top;
        let progress = 0;

        if (distanceToTop <= viewportHeight) {
          progress = 1 - (distanceToTop / viewportHeight);
        }

        progress = Math.max(0, Math.min(1, progress));

        const overlay = card.querySelector('.section-overlay') as HTMLElement;
        const content = card.querySelector('.section-content') as HTMLElement;

        if (progress > 0) {
          const scale = 1 - (progress * 0.08); 
          const overlayOpacity = progress * 0.7;
          const translateY = -(progress * 30);

          card.style.transform = `scale(${scale})`;
          
          if (overlay) overlay.style.opacity = `${overlayOpacity}`;
          if (content) content.style.transform = `translateY(${translateY}px)`;
        } else {
          card.style.transform = 'scale(1)';
          if (overlay) overlay.style.opacity = '0';
          if (content) content.style.transform = 'translateY(0px)';
        }
      });
    };

    const onScroll = () => {
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      requestAnimationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
    };
  }, []);

  return containerRef;
};

export default useStickyStack;