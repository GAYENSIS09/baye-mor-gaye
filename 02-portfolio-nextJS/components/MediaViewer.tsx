"use client";
import Image from "next/image"
import { getMediaUrl } from "@/lib/media"

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "avi", "mkv"]
const PDF_EXTENSION = "pdf"
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "bmp"]

function getMediaType(url: string): "image" | "video" | "pdf" | "unknown" {
  if (url.startsWith("data:image/") || url.startsWith("blob:")) return "image"
  if (url.startsWith("data:video/")) return "video"
  if (url.startsWith("data:application/pdf")) return "pdf"
  const pathname = url.startsWith("http") ? new URL(url).pathname : url
  const ext = pathname.split(".").pop()?.toLowerCase() || ""
  if (IMAGE_EXTENSIONS.includes(ext)) return "image"
  if (VIDEO_EXTENSIONS.includes(ext)) return "video"
  if (ext === PDF_EXTENSION) return "pdf"
  return "unknown"
}

interface MediaViewerProps {
  src: string
  alt?: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  controls?: boolean
}

export default function MediaViewer({
  src,
  alt = "",
  className = "",
  width,
  height,
  fill = false,
  controls = true,
}: MediaViewerProps) {
  const resolvedSrc = getMediaUrl(src) ?? src
  const type = getMediaType(resolvedSrc)
  const isExternal = resolvedSrc.startsWith("http")

  if (type === "image") {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        width={fill ? undefined : (width || 800)}
        height={fill ? undefined : (height || 600)}
        fill={fill}
        className={className}
        sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
        unoptimized={isExternal}
      />
    )
  }

  if (type === "video") {
    return (
      <video
        src={resolvedSrc}
        className={className}
        controls={controls}
        preload="metadata"
      >
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
    )
  }

  if (type === "pdf") {
    return (
      <object
        data={resolvedSrc}
        type="application/pdf"
        className={`w-full h-[600px] ${className}`}
      >
        <iframe
          src={resolvedSrc}
          className={`w-full h-[600px] ${className}`}
          title={alt || "PDF Viewer"}
        >
          <p>
            Votre navigateur ne supporte pas l&apos;affichage des PDF.{" "}
            <a href={resolvedSrc} download className="text-blue-500 underline">
              Télécharger le PDF
            </a>
          </p>
        </iframe>
      </object>
    )
  }

  return (
    <span onClick={() => window.open(resolvedSrc, '_blank', 'noopener,noreferrer')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(resolvedSrc, '_blank', 'noopener,noreferrer'); } }} className={`block relative ${className} cursor-pointer`}>
      <img src={resolvedSrc} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </span>
  )
}
