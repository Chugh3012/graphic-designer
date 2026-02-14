"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [hasPrevious]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [hasNext]);

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goToPrevious, goToNext]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-charcoal/95"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center text-cream/70 hover:text-cream transition-colors"
          aria-label="Close lightbox"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Previous Arrow */}
        <button
          type="button"
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className={`absolute left-4 md:left-8 z-10 w-12 h-12 flex items-center justify-center transition-colors ${
            hasPrevious
              ? "text-cream/70 hover:text-cream cursor-pointer"
              : "text-cream/20 cursor-not-allowed"
          }`}
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={goToNext}
          disabled={!hasNext}
          className={`absolute right-4 md:right-8 z-10 w-12 h-12 flex items-center justify-center transition-colors ${
            hasNext
              ? "text-cream/70 hover:text-cream cursor-pointer"
              : "text-cream/20 cursor-not-allowed"
          }`}
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Image Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="relative z-[1] w-full max-w-5xl mx-8 md:mx-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative aspect-[4/3] md:aspect-[16/10]">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Caption & Counter */}
            <div className="mt-4 flex items-center justify-between">
              {currentImage.caption ? (
                <p className="font-sans text-sm text-cream/70">
                  {currentImage.caption}
                </p>
              ) : (
                <span />
              )}
              <p className="font-sans text-xs tracking-widest text-cream/50">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
