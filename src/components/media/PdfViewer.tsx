import { memo } from 'react'

type PdfViewerProps = {
  url?: string
  width?: string
  height?: string
}

function PdfViewerComponent({
  url,
  width = '100%',
  height = '70dvh',
}: PdfViewerProps) {
  const src = url
    ? `/pdfjs/web/viewer.html?file=${encodeURIComponent(url)}`
    : '/pdfjs/web/viewer.html'

  return (
    <iframe
      title="PDF viewer"
      src={src}
      style={{ width, height, border: 'none' }}
    />
  )
}

export const PdfViewer = memo(PdfViewerComponent)
