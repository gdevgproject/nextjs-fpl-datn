import type React from "react"
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="public-template">{children}</div>
}

