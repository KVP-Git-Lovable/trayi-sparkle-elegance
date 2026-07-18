import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const current = images[index] ?? images[0];

  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, total]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <div>
      {/* Main image */}
      <div
        ref={frameRef}
        className="relative aspect-square overflow-hidden bg-secondary/40 group cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        onClick={() => setLightbox(true)}
      >
        <img
          src={current}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-200 ease-out"
          style={
            zoom
              ? { transformOrigin: `${pos.x}% ${pos.y}%`, transform: "scale(2)" }
              : undefined
          }
        />

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-[0.22em] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-3 w-3" /> Zoom
        </div>

        {/* Carousel controls */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-background/85 backdrop-blur border border-border/60 hover:bg-foreground hover:text-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-background/85 backdrop-blur border border-border/60 hover:bg-foreground hover:text-background transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-6 transition-colors ${i === index ? "bg-foreground" : "bg-foreground/25"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {images.map((g, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`aspect-square overflow-hidden bg-secondary/40 border transition-colors ${
              i === index ? "border-accent" : "border-transparent hover:border-border"
            }`}
            aria-label={`View image ${i + 1}`}
            aria-current={i === index}
          >
            <img src={g} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            aria-label="Close"
            className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center border border-border hover:bg-foreground hover:text-background transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Previous image"
                className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center border border-border hover:bg-foreground hover:text-background transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Next image"
                className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center border border-border hover:bg-foreground hover:text-background transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <img
            src={current}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {index + 1} / {total}
          </div>
        </div>
      )}
    </div>
  );
}
