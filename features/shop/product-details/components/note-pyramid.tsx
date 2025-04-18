import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NotePyramidProps {
  notePyramid: {
    top: Array<{
      id: number
      name: string
      description?: string | null
    }>
    middle: Array<{
      id: number
      name: string
      description?: string | null
    }>
    base: Array<{
      id: number
      name: string
      description?: string | null
    }>
  }
}

export default function NotePyramid({ notePyramid }: NotePyramidProps) {
  return (
    <div className="space-y-8">
      {/* Top Notes */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-medium">Hương đầu (Top Notes)</h3>
          <p className="text-sm text-muted-foreground">Ấn tượng đầu tiên, thoáng qua nhưng mạnh mẽ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {notePyramid.top.length > 0 ? (
            notePyramid.top.map((ingredient) => (
              <TooltipProvider key={ingredient.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-help">
                      {ingredient.name}
                    </Badge>
                  </TooltipTrigger>
                  {ingredient.description && (
                    <TooltipContent>
                      <p className="max-w-xs">{ingredient.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">Không có thông tin</span>
          )}
        </div>
      </div>

      {/* Middle Notes */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-medium">Hương giữa (Middle Notes)</h3>
          <p className="text-sm text-muted-foreground">Trái tim của mùi hương, xuất hiện khi hương đầu tan biến</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {notePyramid.middle.length > 0 ? (
            notePyramid.middle.map((ingredient) => (
              <TooltipProvider key={ingredient.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-help">
                      {ingredient.name}
                    </Badge>
                  </TooltipTrigger>
                  {ingredient.description && (
                    <TooltipContent>
                      <p className="max-w-xs">{ingredient.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">Không có thông tin</span>
          )}
        </div>
      </div>

      {/* Base Notes */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-medium">Hương cuối (Base Notes)</h3>
          <p className="text-sm text-muted-foreground">Nền tảng của mùi hương, lưu lại lâu nhất trên da</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {notePyramid.base.length > 0 ? (
            notePyramid.base.map((ingredient) => (
              <TooltipProvider key={ingredient.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-help">
                      {ingredient.name}
                    </Badge>
                  </TooltipTrigger>
                  {ingredient.description && (
                    <TooltipContent>
                      <p className="max-w-xs">{ingredient.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">Không có thông tin</span>
          )}
        </div>
      </div>
    </div>
  )
}
