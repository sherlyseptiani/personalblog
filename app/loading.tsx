export default function HomeLoading() {
  return (
    <main className="wrap">
      {/* Hero skeleton */}
      <section className="hero hero-skeleton" data-screen-label="hero">
        <div className="hero-video-bg" aria-hidden="true">
          <div className="tint" style={{ background: 'var(--bg)' }} />
          <div className="scrim" />
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="eyebrow">
              <span className="dot" style={{ background: 'var(--video-tint)' }} />
              <span className="skeleton-text" style={{ width: '140px' }} />
            </div>
            <div className="skeleton-title" style={{ width: '90%', height: '1.2em', marginBottom: '18px' }} />
            <div className="skeleton-text" style={{ width: '85%', marginBottom: '8px' }} />
            <div className="skeleton-text" style={{ width: '70%' }} />
            <div className="hero-meta" style={{ marginTop: '24px', display: 'flex', gap: '14px' }}>
              <span className="skeleton-button" style={{ width: '120px', height: '40px', borderRadius: '999px' }} />
              <span className="skeleton-button" style={{ width: '160px', height: '40px', borderRadius: '999px' }} />
            </div>
          </div>
          <div className="hero-side" />
        </div>
      </section>

      {/* Posts section skeleton */}
      <section className="posts-section" id="latest" data-screen-label="posts">
        <div className="dotgrid" aria-hidden="true" />

        <header className="section-head" style={{ position: 'relative', zIndex: 1 }}>
          <div className="titles">
            <span className="eyebrow">The archive</span>
            <div className="skeleton-title" style={{ width: '220px', height: '1.5em' }} />
            <span className="skeleton-text" style={{ width: '380px', marginTop: '8px' }} />
          </div>
          <div className="filters glass" style={{ '--glass-bg': 'var(--glass-bg-strong)' } as React.CSSProperties}>
            <span className="filter-skeleton" style={{ width: '40px' }} />
            <span className="filter-skeleton" style={{ width: '70px' }} />
            <span className="filter-skeleton" style={{ width: '80px' }} />
            <span className="filter-skeleton" style={{ width: '60px' }} />
            <span className="filter-skeleton" style={{ width: '75px' }} />
          </div>
        </header>

        {/* Posts grid - responsive like real page */}
        <div className="posts skeleton-posts" style={{ position: 'relative', zIndex: 1 }}>
          {/* Desktop: 4 columns */}
          <div className="skeleton-col skeleton-col-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="post-skeleton glass" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="skeleton-thumb" style={{ aspectRatio: '3/4' }} />
                <div style={{ padding: '16px' }}>
                  <span className="skeleton-text" style={{ width: '60px' }} />
                  <div className="skeleton-title" style={{ width: '95%', height: '1.4em', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '100%', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '75%', marginTop: '4px' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton-col skeleton-col-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="post-skeleton glass" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="skeleton-thumb" style={{ aspectRatio: '4/3' }} />
                <div style={{ padding: '16px' }}>
                  <span className="skeleton-text" style={{ width: '60px' }} />
                  <div className="skeleton-title" style={{ width: '95%', height: '1.4em', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '100%', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '75%', marginTop: '4px' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton-col skeleton-col-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="post-skeleton glass" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="skeleton-thumb" style={{ aspectRatio: '3/4' }} />
                <div style={{ padding: '16px' }}>
                  <span className="skeleton-text" style={{ width: '60px' }} />
                  <div className="skeleton-title" style={{ width: '95%', height: '1.4em', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '100%', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '75%', marginTop: '4px' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton-col skeleton-col-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="post-skeleton glass" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="skeleton-thumb" style={{ aspectRatio: '4/3' }} />
                <div style={{ padding: '16px' }}>
                  <span className="skeleton-text" style={{ width: '60px' }} />
                  <div className="skeleton-title" style={{ width: '95%', height: '1.4em', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '100%', marginTop: '10px' }} />
                  <span className="skeleton-text" style={{ width: '75%', marginTop: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load more section */}
        <div className="load-more-wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="count">
            <span className="skeleton-text" style={{ width: '120px' }} />
          </div>
          <span className="skeleton-button" style={{ width: '140px', height: '40px', borderRadius: '999px', margin: '0 auto', display: 'block' }} />
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="footer">
        <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '320px' }}>
            <div className="skeleton-title" style={{ width: '140px', height: '1.2em', marginBottom: '12px' }} />
            <span className="skeleton-text" style={{ width: '100%' }} />
            <span className="skeleton-text" style={{ width: '80%', marginTop: '4px' }} />
          </div>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <span className="skeleton-text" style={{ width: '80px', marginBottom: '8px', display: 'block' }} />
              <span className="skeleton-text" style={{ width: '60px' }} />
            </div>
            <div>
              <span className="skeleton-text" style={{ width: '100px', marginBottom: '8px', display: 'block' }} />
              <span className="skeleton-text" style={{ width: '80px' }} />
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}
