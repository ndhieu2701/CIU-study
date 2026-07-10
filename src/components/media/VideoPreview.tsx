import { memo } from 'react'
import { buildYouTubeEmbedUrl } from '../../lib/video'

type VideoPreviewProps = {
  url: string
  title: string
}

function VideoPreviewComponent({ url, title }: VideoPreviewProps) {
  return (
    <div className="media-frame media-frame-video">
      <iframe
        title={title}
        src={buildYouTubeEmbedUrl(url)}
        allowFullScreen
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}

export const VideoPreview = memo(VideoPreviewComponent)
