import type React from "react"
export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  return <div className="protected-template">{children}</div>
}

