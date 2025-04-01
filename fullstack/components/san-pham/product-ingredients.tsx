interface ProductIngredientsProps {
  ingredients: string[]
}

export function ProductIngredients({ ingredients }: ProductIngredientsProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Thành phần nước hoa có thể thay đổi theo thời gian. Vui lòng tham khảo thông tin trên bao bì sản phẩm để biết
        danh sách thành phần chính xác nhất.
      </p>

      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="bg-muted px-3 py-1.5 rounded-md text-sm">
            {ingredient}
          </div>
        ))}
      </div>
    </div>
  )
}

