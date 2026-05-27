'use client'

export default function NotifyButton() {
  const handleClick = () => {
    const btn = document.getElementById('notifyBtn')
    ;(window as any).toggleNotify?.(btn)
  }

  return (
    <button
      type="button"
      className="btn btn-ghost-bordered notify-btn"
      id="notifyBtn"
      aria-pressed="false"
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      <span className="notify-label">Notify me on new posts</span>
    </button>
  )
}
