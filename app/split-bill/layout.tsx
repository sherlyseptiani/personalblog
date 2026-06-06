import '../tools/tools.css'

export default function SplitBillLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'transparent',
      backgroundImage: 'radial-gradient(circle, rgba(var(--video-r), var(--video-g), var(--video-b), 0.12) 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      {children}
    </div>
  )
}
