import { Instagram as InstagramIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Curated Instagram posts - update these with actual post images and links
const instagramPosts = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
  {
    id: 7,
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
  {
    id: 8,
    imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
    link: "https://instagram.com/iasminsantosfotografia",
  },
];

const Instagram = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <InstagramIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              Siga no Instagram
            </h2>
          </div>
          <a
            href="https://instagram.com/iasminsantosfotografia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors text-lg"
          >
            @iasminsantosfotografia
          </a>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {instagramPosts.map((post) => (
              <CarouselItem
                key={post.id}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square overflow-hidden rounded-lg group relative"
                >
                  <img
                    src={post.imageUrl}
                    alt="Instagram post"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <InstagramIcon className="w-8 h-8 text-white" />
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
          <CarouselNext className="hidden md:flex -right-12 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
        </Carousel>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/iasminsantosfotografia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            <InstagramIcon className="w-5 h-5" />
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default Instagram;
