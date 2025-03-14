export default function ProductDetailInfo({ product }: { product: any }) {
  return (
    <div className="product-detail-info">
      {/* Ingredients Table */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-[#111827]">Thành phần của Hỗn dịch uống Enterogermina Gut Defense</h3>
        <p className="text-sm text-[#6B7280]">Thành phần cho 1 ống</p>

        <div className="mt-4 overflow-hidden rounded-lg">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="bg-[#F8F9FA] px-6 py-3 text-left text-sm font-medium text-[#111827]">
                  Thông tin thành phần
                </th>
                <th className="bg-[#F8F9FA] px-6 py-3 text-right text-sm font-medium text-[#111827]">Hàm lượng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="bg-[#F8F9FA]/50 px-6 py-3 text-sm text-[#111827]">Bacillus clausii</td>
                <td className="bg-[#F8F9FA]/50 px-6 py-3 text-right text-sm text-[#111827]">
                  2×10<sup>9</sup>cfu
                </td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

