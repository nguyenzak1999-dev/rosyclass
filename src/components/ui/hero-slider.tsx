"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const images = [
  {
    src: "/demo/kids-classroom.svg",
    alt: "Học viên tại RosyClass",
  },
  {
    src: "/demo/kids-songs.svg",
    alt: "Lớp học giao tiếp người đi làm",
  },
  {
    src: "/demo/kids-storytime.svg",
    alt: "Lớp học tiếng Anh trẻ em",
  },
]

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  useEffect(() => {
    const timer = setInterval(goToNext, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {images.map((image, index) => (
        <div
          key={image.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-all z-20 opacity-0 group-hover:opacity-100"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-all z-20 opacity-0 group-hover:opacity-100"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-pure-white w-8"
                : "bg-pure-white/50 hover:bg-pure-white/80 w-2.5"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
