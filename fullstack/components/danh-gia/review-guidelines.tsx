import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"

export function ReviewGuidelines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hướng dẫn viết đánh giá</CardTitle>
        <CardDescription>
          Để đánh giá của bạn hữu ích và được duyệt nhanh chóng, vui lòng tuân thủ các hướng dẫn sau
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 font-medium">Nên làm:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Chia sẻ trải nghiệm thực tế của bạn với sản phẩm</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Mô tả chi tiết về mùi hương, độ lưu hương, và cảm nhận khi sử dụng</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Đề cập đến chất lượng sản phẩm, bao bì, và giá trị so với giá tiền</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Đính kèm hình ảnh thực tế của sản phẩm (nếu có)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Viết rõ ràng, mạch lạc và không có lỗi chính tả</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Không nên làm:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Sử dụng ngôn từ thô tục, xúc phạm hoặc phân biệt đối xử</span>
            </li>
            <li className="flex items-start">
              <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Đề cập đến thông tin cá nhân của bạn hoặc người khác</span>
            </li>
            <li className="flex items-start">
              <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Đánh giá về dịch vụ vận chuyển hoặc giao hàng (thay vì sản phẩm)</span>
            </li>
            <li className="flex items-start">
              <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Quảng cáo hoặc liên kết đến các trang web khác</span>
            </li>
            <li className="flex items-start">
              <XCircle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Viết đánh giá quá ngắn hoặc không có thông tin hữu ích</span>
            </li>
          </ul>
        </div>

        <div className="rounded-md bg-muted p-4">
          <p className="font-medium">Quy trình kiểm duyệt:</p>
          <p className="mt-1 text-sm">
            Tất cả đánh giá sẽ được kiểm duyệt trong vòng 24-48 giờ trước khi hiển thị công khai. Đánh giá không tuân
            thủ hướng dẫn có thể bị từ chối.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

