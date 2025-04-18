interface ProductDescriptionProps {
  product: {
    short_description: string | null
    long_description: string | null
    origin_country: string | null
    style: string | null
    longevity: string | null
    sillage: string | null
    release_year: number | null
  }
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  return (
    <div className="space-y-6">
      {/* Main Description */}
      {product.long_description ? (
        <div className="prose max-w-none dark:prose-invert">
          {product.long_description.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
      )}

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {product.origin_country && (
          <div>
            <h3 className="text-sm font-medium">Xuất xứ</h3>
            <p className="text-sm text-muted-foreground">{product.origin_country}</p>
          </div>
        )}

        {product.style && (
          <div>
            <h3 className="text-sm font-medium">Phong cách</h3>
            <p className="text-sm text-muted-foreground">{product.style}</p>
          </div>
        )}

        {product.longevity && (
          <div>
            <h3 className="text-sm font-medium">Độ lưu hương</h3>
            <p className="text-sm text-muted-foreground">{product.longevity}</p>
          </div>
        )}

        {product.sillage && (
          <div>
            <h3 className="text-sm font-medium">Độ tỏa hương</h3>
            <p className="text-sm text-muted-foreground">{product.sillage}</p>
          </div>
        )}

        {product.release_year && (
          <div>
            <h3 className="text-sm font-medium">Năm ra mắt</h3>
            <p className="text-sm text-muted-foreground">{product.release_year}</p>
          </div>
        )}
      </div>
    </div>
  )
}
