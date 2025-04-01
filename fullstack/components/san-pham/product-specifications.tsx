interface ProductSpecificationsProps {
  specifications: {
    concentration: string
    releaseYear: number
    gender: string
    style: string
    sillage: string
    longevity: string
    topNotes: string[]
    middleNotes: string[]
    baseNotes: string[]
  }
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Nồng độ</div>
              <div>{specifications.concentration}</div>

              <div className="text-muted-foreground">Năm phát hành</div>
              <div>{specifications.releaseYear}</div>

              <div className="text-muted-foreground">Giới tính</div>
              <div>{specifications.gender}</div>

              <div className="text-muted-foreground">Phong cách</div>
              <div>{specifications.style}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Hiệu suất</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Độ tỏa hương</div>
              <div>{specifications.sillage}</div>

              <div className="text-muted-foreground">Độ lưu hương</div>
              <div>{specifications.longevity}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Mùi hương</h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Hương đầu (Top Notes)</h4>
                <p className="text-sm text-muted-foreground">{specifications.topNotes.join(", ")}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Hương giữa (Middle Notes)</h4>
                <p className="text-sm text-muted-foreground">{specifications.middleNotes.join(", ")}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Hương cuối (Base Notes)</h4>
                <p className="text-sm text-muted-foreground">{specifications.baseNotes.join(", ")}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Hướng dẫn sử dụng</h3>
            <p className="text-sm text-muted-foreground">
              Xịt nước hoa lên các vùng mạch đập như cổ tay, cổ, sau tai để tối ưu độ tỏa hương. Nước hoa sẽ phát huy
              tốt nhất khi da sạch và ẩm, vì vậy nên dùng sau khi tắm. Xịt cách da 15-20cm để hương thơm lan tỏa đều.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

