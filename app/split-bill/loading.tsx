export default function Loading() {
  return (
    <div
      className="wrap"
      style={{
        padding: '40px 0',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="glass"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '48px 64px',
          borderRadius: '26px',
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'var(--video-tint)',
            animation: 'loading-pulse 2s ease-in-out infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            color: 'var(--ink-2)',
            margin: 0,
          }}
        >
          Loading Split Bill…
        </p>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes loading-pulse {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(217, 107, 138, 0.4);
              }
              50% {
                opacity: 0.8;
                transform: scale(0.95);
                box-shadow: 0 0 0 8px rgba(217, 107, 138, 0);
              }
            }
          `,
        }}
      />
    </div>
  )
}
