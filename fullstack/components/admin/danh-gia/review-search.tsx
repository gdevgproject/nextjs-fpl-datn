import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function ReviewSearch() {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="search" placeholder="Tìm kiếm đánh giá..." className="w-full pl-8" />
    </div>
  )
}

