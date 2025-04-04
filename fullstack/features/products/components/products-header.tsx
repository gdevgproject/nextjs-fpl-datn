import { Badge } from "@/components/ui/badge";

interface ProductsHeaderProps {
  title: string;
  description: string;
  count: number;
  activeFilters?: {
    type: string;
    value: string;
  }[];
}

export function ProductsHeader({
  title,
  description,
  count,
  activeFilters = [],
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">{title}</h1>

      {/* Display active filters as badges below the title when there are multiple filters */}
      {activeFilters.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="px-2 py-1">
              {filter.type}: {filter.value}
            </Badge>
          ))}
        </div>
      )}

      <p className="text-muted-foreground">{description}</p>
      {count > 0 ? (
        <p className="text-sm text-muted-foreground">
          Tìm thấy {count} sản phẩm
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Không tìm thấy sản phẩm nào
        </p>
      )}
    </div>
  );
}
