export default function SplitBillLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--bg, #faf8f7)'
    }}>
      {children}
    </div>
  )
}
