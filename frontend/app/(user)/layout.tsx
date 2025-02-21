import type React from "react"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="user-layout">
      {/* Add common user layout components here (e.g., header, footer) */}
      <main>{children}</main>
    </div>
  )
}

