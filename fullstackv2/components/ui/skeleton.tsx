<<<<<<< HEAD
import { cn } from "@/shared/lib/utils"
=======
import { cn } from "@/shared/lib/utils";
>>>>>>> feat/v2

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
<<<<<<< HEAD
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
=======
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
>>>>>>> feat/v2
