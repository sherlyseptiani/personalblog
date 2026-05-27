export default function HomeLoading() {
  return (
    <>
      <section className="hero" style={{ minHeight: '60vh' }}>
        <div className="hero-content" style={{ width: '100%' }}>
          <div className="hero-text">
            <span className="skeleton-text" style={{ width: '200px', marginBottom: '1em' }} />
            <div className="skeleton-title" style={{ width: '80%' }} />
            <div className="skeleton-text" style={{ width: '60%', marginTop: '1em' }} />
          </div>
        </div>
      </section>

      <section className="archive" id="latest">
        <header className="section-head">
          <div className="titles">
            <span className="skeleton-text" style={{ width: '100px' }} />
            <div className="skeleton-title" style={{ width: '200px', height: '1.8em' }} />
          </div>
          <div className="filters">
            <span className="filter-skeleton" style={{ width: '50px' }} />
            <span className="filter-skeleton" style={{ width: '70px' }} />
            <span className="filter-skeleton" style={{ width: '60px' }} />
            <span className="filter-skeleton" style={{ width: '80px' }} />
          </div>
        </header>

        <div className="posts" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="post-skeleton glass" style={{ borderRadius: '12px', padding: '16px' }}>
              <div className="skeleton-thumb" />
              <span className="skeleton-text" style={{ width: '60px', marginTop: '12px' }} />
              <div className="skeleton-title" style={{ width: '90%', height: '1.5em', marginTop: '8px' }} />
              <span className="skeleton-text" style={{ width: '100%', marginTop: '8px' }} />
              <span className="skeleton-text" style={{ width: '70%', marginTop: '4px' }} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
