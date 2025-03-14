"use client"

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-40 border-t-transparent"></div>
    </div>
  )
}

