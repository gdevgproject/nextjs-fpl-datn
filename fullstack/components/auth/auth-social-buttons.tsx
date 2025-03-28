import { Button } from "@/components/ui/button"
import { Facebook, Github } from "lucide-react"

export function AuthSocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" className="w-full">
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      <Button variant="outline" className="w-full">
        <Github className="mr-2 h-4 w-4" />
        Github
      </Button>
    </div>
  )
}

