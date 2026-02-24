"use client"

import { Dialog, Transition } from "@headlessui/react"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import X from "@modules/common/icons/x"
import Image from "next/image"
import { Fragment, useCallback, useEffect } from "react"

type LightboxProps = {
  images: { url: string; alt: string }[]
  selectedIndex: number
  onIndexChange: (index: number) => void
  open: boolean
  onClose: () => void
}

export default function Lightbox({
  images,
  selectedIndex,
  onIndexChange,
  open,
  onClose,
}: LightboxProps) {
  const hasPrev = selectedIndex > 0
  const hasNext = selectedIndex < images.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(selectedIndex - 1)
  }, [hasPrev, selectedIndex, onIndexChange])

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(selectedIndex + 1)
  }, [hasNext, selectedIndex, onIndexChange])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, goPrev, goNext])

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex flex-col">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2"
              aria-label="Close lightbox"
            >
              <X size="24" />
            </button>
          </div>

          {/* Main image area */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="flex-1 flex items-center justify-center px-4 pb-4 relative">
              {/* Prev arrow */}
              {hasPrev && (
                <button
                  onClick={goPrev}
                  className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Image */}
              {images[selectedIndex] && (
                <div className="relative max-h-[75vh] max-w-[90vw] w-full h-full">
                  <Image
                    src={images[selectedIndex].url}
                    alt={images[selectedIndex].alt}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                  />
                </div>
              )}

              {/* Next arrow */}
              {hasNext && (
                <button
                  onClick={goNext}
                  className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Image counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            </Dialog.Panel>
          </Transition.Child>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 p-4 overflow-x-auto no-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  className={`relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === selectedIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </Transition>
  )
}
