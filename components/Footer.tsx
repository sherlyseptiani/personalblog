import IdeaWidget from './IdeaWidget'

type Props = {
  sourcePage: string
  postSlug?: string
  showDescription?: boolean
  showRecent?: boolean
  initialIdeas?: { content: string }[]
  compact?: boolean
}

export default function Footer({
  sourcePage,
  postSlug,
  showDescription = false,
  showRecent = false,
  initialIdeas = [],
  compact = false,
}: Props) {
  return (
    <footer className="footer-section" data-screen-label="footer">
      <div className={compact ? 'wrap' : undefined}>
        <div className="footer-grid glass">
          <div className="identity">
            <div className="logo">
              <span className="mark"></span>
              {compact
                ? 'A Curious Note'
                : <span style={{ fontFamily: 'var(--font-serif)' }}>A Curious Note</span>}
            </div>
            <p>A quiet personal corner. Written and tended by hand &mdash; no analytics chasing, no algorithm whispering.</p>
            <div className="meta-stat" style={{ fontSize: '12px' }}>
              {compact ? 'Made in Brooklyn' : 'Made in Brooklyn · Updated recently'}
            </div>
          </div>

          <div className="socials-col">
            <div className="col-title">Elsewhere</div>
            <div className="socials">
              <a href="#">
                <span className="label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.57.67.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
                  </svg>
                  GitHub
                </span>
                <span className="handle">@curiousnote</span>
              </a>
              <a href="#">
                <span className="label">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X · Twitter
                </span>
                <span className="handle">@a_curious_note</span>
              </a>
              <a href="#">
                <span className="label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
                    <circle cx="5" cy="19" r="1.5" fill="currentColor" />
                  </svg>
                  RSS feed
                </span>
                <span className="handle">/feed.xml</span>
              </a>
              {!compact && (
                <>
                  <a href="#">
                    <span className="label">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.5 12c-1.93 0-3.5-1.57-3.5-3.5S17.57 5 19.5 5 23 6.57 23 8.5 21.43 12 19.5 12zm-7-1c-3.31 0-6 2.69-6 6v6h12v-6c0-3.31-2.69-6-6-6zm-7-2C3.57 9 2 7.43 2 5.5S3.57 2 5.5 2 9 3.57 9 5.5 7.43 9 5.5 9z" />
                      </svg>
                      Mastodon
                    </span>
                    <span className="handle">@sherly@mastodon.social</span>
                  </a>
                  <a href="#">
                    <span className="label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                      Newsletter
                    </span>
                    <span className="handle">tinyletter</span>
                  </a>
                </>
              )}
            </div>
          </div>

          <IdeaWidget
            sourcePage={sourcePage}
            postSlug={postSlug}
            title={compact ? 'Liked this? Tell me what\'s next' : 'Submit an idea'}
            placeholder={compact
              ? 'A thought, a counter-argument, a thing I missed...'
              : 'e.g. why tuna dies when it stops swimming, or how eating polar bear can kill you...'}
            sendLabel={compact ? 'Send' : 'Send it'}
            showCount={!compact}
            showRecent={showRecent}
            initialIdeas={initialIdeas}
            description={!compact ? 'What should I write about next? Leave a prompt — the best ones become essays.' : undefined}
          />
        </div>

        <div className="copyline">
          <span>© 2026 A Curious Note · Written by hand · Liquid ink</span>
          <div className="links">
            <a href="#">Privacy</a>
            <a href="#">Colophon</a>
            {compact ? <a href="/">Home</a> : <a href="#">Sitemap</a>}
            {!compact && <a href="#">/uses</a>}
          </div>
        </div>
      </div>
    </footer>
  )
}
