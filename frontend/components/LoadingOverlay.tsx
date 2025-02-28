export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-xl animate-slide-up">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
        <p className="mt-4 text-center">Đang xử lý đơn hàng của bạn...</p>
      </div>
    </div>
  );
}
