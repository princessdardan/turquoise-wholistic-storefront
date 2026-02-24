"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import Lightbox from "./lightbox"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Reset to first image when images change (e.g. variant switch)
  useEffect(() => {
    setSelectedIndex(0)
  }, [images])

  const lightboxImages = useMemo(
    () =>
      images
        .filter((img) => !!img.url)
        .map((img, i) => ({
          url: img.url!,
          alt: `Product image ${i + 1}`,
        })),
    [images]
  )

  const currentImage = images[selectedIndex]

  return (
    <div className="flex flex-col gap-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-sand-50 cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setLightboxOpen(true)
          }
        }}
        aria-label="Click to zoom image"
      >
        {currentImage?.url && (
          <Image
            src={currentImage.url}
            alt={`Product image ${selectedIndex + 1}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-x-2 overflow-x-auto no-scrollbar pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={clx(
                "relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-sand-50 transition-all",
                index === selectedIndex
                  ? "ring-2 ring-turquoise-400 ring-offset-1"
                  : "opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
            >
              {image.url && (
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        selectedIndex={selectedIndex}
        onIndexChange={setSelectedIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}

export default ImageGallery
