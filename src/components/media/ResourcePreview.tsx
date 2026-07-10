import { memo } from 'react'
import type { Resource } from '../../types'
import { PdfViewer } from './PdfViewer'
import { VideoPreview } from './VideoPreview'

type ResourcePreviewProps = {
  resource: Resource
}

function ResourcePreviewComponent({ resource }: ResourcePreviewProps) {
  if (resource.type === 'image') {
    return (
      <article className="resource-card">
        <div className="resource-card-header">
          <span>{resource.title}</span>
          <a href={resource.url} target="_blank" rel="noreferrer">
            Open image
          </a>
        </div>
        <img className="resource-image" src={resource.url} alt={resource.title} />
      </article>
    )
  }

  if (resource.type === 'youtube') {
    return (
      <article className="resource-card">
        <div className="resource-card-header">
          <span>Video</span>
          <a href={resource.url} target="_blank" rel="noreferrer">
            Open original
          </a>
        </div>
        <VideoPreview url={resource.url} title={resource.title} />
      </article>
    )
  }

  if (resource.type === 'pdf') {
    return (
      <article className="resource-card resource-card-pdf">
        <div className="resource-card-header">
          <span>{resource.title}</span>
          <a href={resource.url} target="_blank" rel="noreferrer">
            Open PDF
          </a>
        </div>
        <PdfViewer url={resource.url} height="62dvh" />
      </article>
    )
  }

  return (
    <article className="resource-card">
      <div className="resource-card-header">
        <span>{resource.title}</span>
        <a href={resource.url} target="_blank" rel="noreferrer">
          Open link
        </a>
      </div>
      <iframe
        title={resource.title}
        src={resource.url}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
      <p className="iframe-note">
        Some websites block iframe previews. Use the link above if the preview
        is blank.
      </p>
    </article>
  )
}

export const ResourcePreview = memo(ResourcePreviewComponent)
