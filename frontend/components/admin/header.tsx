import Link from "next/link"
import { Bell, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onLogout: () => void
  onMenuToggle: () => void
}

export function Header({ onLogout, onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-5 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onMenuToggle}>
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/admin" className="text-2xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

