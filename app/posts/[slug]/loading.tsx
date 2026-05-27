export default function PostLoading() {
  return (
    <div className="post-loading">
      <div className="post-wrap">
        <header className="post-hero">
          <div className="meta">
            <span className="skeleton-text" style={{ width: '80px' }} />
            <span className="sep">·</span>
            <span className="skeleton-text" style={{ width: '60px' }} />
          </div>
          <div className="skeleton-title" />
          <div className="author-row">
            <span className="skeleton-avatar" />
            <div className="info">
              <span className="skeleton-text" style={{ width: '100px' }} />
              <span className="skeleton-text" style={{ width: '150px' }} />
            </div>
          </div>
        </header>

        <div className="article">
          <span className="skeleton-text" style={{ width: '100%', marginBottom: '1em' }} />
          <span className="skeleton-text" style={{ width: '95%', marginBottom: '1em' }} />
          <span className="skeleton-text" style={{ width: '90%', marginBottom: '1em' }} />
          <span className="skeleton-text" style={{ width: '100%', marginBottom: '1em' }} />
          <span className="skeleton-text" style={{ width: '85%', marginBottom: '1em' }} />
        </div>
      </div>
    </div>
  )
}
