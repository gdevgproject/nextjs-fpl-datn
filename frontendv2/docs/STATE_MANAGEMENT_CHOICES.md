# STATE_MANAGEMENT_CHOICES.md

# Giải Thích Lựa Chọn Công Nghệ State Management Cho Dự Án Elena Pharmacy

## Mục Đích Tài Liệu

Tài liệu này giải thích chi tiết lý do lựa chọn các công nghệ state management cho dự án frontend Elena Pharmacy. Mục tiêu là cung cấp thông tin rõ ràng và dễ hiểu cho các lập trình viên mới hoặc người đi sau dự án, giúp nắm bắt được quyết định lựa chọn công nghệ và rationale đằng sau.

## Tổng Quan State Management Trong Dự Án Elena Pharmacy

Trong dự án Elena Pharmacy, chúng ta phân loại state management thành 4 loại chính:

1.  **Global State Management (UI & Application-Wide State):** State dùng chung cho toàn bộ ứng dụng (ví dụ: authentication, cart, theme).
2.  **UI State Management (Component-Specific UI State):** State chỉ liên quan đến UI của một component (ví dụ: modal visibility, form input values).
3.  **Remote State Management (Server State, Data Fetching & Caching):** State lấy từ backend API (ví dụ: dữ liệu sản phẩm, bài viết).
4.  **Local State Management (Component-Local State):** State cục bộ chỉ dùng trong một component (ví dụ: temporary UI state).

## Lựa Chọn Công Nghệ Cho Từng Loại State

Dưới đây là giải thích chi tiết lý do lựa chọn công nghệ state management cho từng loại state, kèm theo so sánh và lý do loại trừ các công nghệ khác:

### 1. Global State Management: React Context API (kết hợp `useReducer` nếu state phức tạp)

**Lý do lựa chọn React Context API:**

*   **Built-in React:** Tận dụng sức mạnh sẵn có của React, không cần thêm dependency ngoài.
*   **Đơn giản và Nhẹ Nhàng:** Phù hợp cho global state không quá phức tạp của MVP Elena (authentication, theme, giỏ hàng).
*   **Hiệu Suất Tốt:** Đã được tối ưu trong React 16.6+ và Next.js 14+ App Router.
*   **Dễ Học & Sử Dụng:** Lập trình viên React quen thuộc với Context API.
*   **Phù Hợp Feature-Based Architecture:** Context Providers có thể đặt trong feature modules, quản lý state theo tính năng.

**Lý do không chọn Zustand/Redux Toolkit:**

*   **Overkill cho MVP:** Các thư viện này quá mạnh mẽ và phức tạp cho global state đơn giản của MVP Elena.
*   **Thêm Dependency Không Cần Thiết:** Context API đã đủ tốt cho giai đoạn đầu.

### 2. UI State Management: `useState` & `useReducer` Hooks (Built-in React)

**Lý do lựa chọn `useState` & `useReducer` Hooks:**

*   **Built-in React:** Tận dụng sức mạnh sẵn có của React, không cần thêm dependency ngoài.
*   **Đơn Giản, Nhẹ Nhàng, Hiệu Quả:** Đủ khả năng quản lý UI state component-specific.
*   **Tối Ưu Hiệu Suất React:** React Hooks được tối ưu bởi React team.
*   **Dễ Học & Sử Dụng:** Lập trình viên React quen thuộc với Hooks.
*   **Phù Hợp Component-Based Architecture:** Quản lý state cục bộ trong component.

**Lý do không chọn thư viện ngoài:**

*   **Không Cần Thiết:** `useState` & `useReducer` đã đủ tốt cho UI state, không cần thêm thư viện phức tạp.

### 3. Remote State Management: React Query (TanStack Query)

**Lý do lựa chọn React Query:**

*   **Thư Viện Chuyên Dụng Mạnh Mẽ:** Thiết kế tối ưu cho data fetching, caching, server state trong React.
*   **Caching Tự Động & Thông Minh:** Tăng hiệu suất, giảm request, cải thiện trải nghiệm người dùng.
*   **Xử Lý Loading, Error, Retry, Pagination, ... Built-in:** Code data fetching gọn gàng, dễ quản lý.
*   **Hooks API Dễ Sử Dụng:** `useQuery`, `useMutation`, `useInfiniteQuery` dễ dùng, declarative.
*   **Tối Ưu Hiệu Suất & Tối Ưu Cho React/Next.js:** Hoạt động tốt trong React và Next.js App Router.
*   **Cộng Đồng Lớn & Hỗ Trợ Tốt:** Thư viện phổ biến, tài liệu đầy đủ.
*   **Phù Hợp Dự Án Ecommerce Lớn:** Quản lý data fetching và server state hiệu quả, scale tốt.

**Lý do không chọn Fetch API/Axios thủ công + `useState`/`useReducer`:**

*   **Thiếu Caching & Quản Lý Cache:** Tự code caching rất phức tạp và dễ sai sót.
*   **Code Boilerplate & Khó Maintain:** Code data fetching thủ công nhiều boilerplate, khó maintain.
*   **Hiệu Suất Kém Hơn:** Không có caching tự động, request API nhiều lần không cần thiết.
*   **Không Phù Hợp Dự Án Lớn:** Quản lý data fetching thủ công không scale được cho dự án lớn.

**Lý do không chọn SWR (mặc dù tốt, nhưng React Query ưu việt hơn):**

*   **Ít Features Hơn React Query:** SWR ít features hơn, không mạnh mẽ bằng React Query trong quản lý server state phức tạp.
*   **Caching Ít Tùy Biến Hơn:** Caching của SWR ít tùy biến hơn React Query.
*   **Cộng Đồng Nhỏ Hơn:** Cộng đồng SWR nhỏ hơn React Query.

### 4. Local State Management: `useState` & `useReducer` Hooks (Built-in React)

**Lý do lựa chọn `useState` & `useReducer` Hooks (tương tự UI State Management):**

*   **Built-in React:** Tận dụng sức mạnh sẵn có của React, không cần thêm dependency ngoài.
*   **Đơn Giản, Nhẹ Nhàng, Hiệu Quả:** Đủ khả năng quản lý local state component-specific.
*   **Tối Ưu Hiệu Suất React:** React Hooks được tối ưu bởi React team.
*   **Dễ Học & Sử Dụng:** Lập trình viên React quen thuộc với Hooks.
*   **Phù Hợp Component-Based Architecture:** Quản lý state cục bộ trong component.

**Lý do không chọn thư viện ngoài:**

*   **Không Cần Thiết:** `useState` & `useReducer` đã đủ tốt cho local state, không cần thêm thư viện phức tạp.

## Kết Luận Chung

Lựa chọn công nghệ state management cho dự án Elena Pharmacy được đưa ra dựa trên các tiêu chí:

*   **Hiệu Suất & Khả Năng Scale:** Ưu tiên công nghệ hiệu suất cao, scale tốt cho dự án lớn.
*   **Đơn Giản & Dễ Sử Dụng:** Ưu tiên công nghệ dễ học, dễ sử dụng, phù hợp cho team phát triển.
*   **Tối Ưu Hóa Cho React & Next.js:** Chọn công nghệ tích hợp tốt với React và Next.js App Router.
*   **Đáp Ứng Đầy Đủ Yêu Cầu:** Đảm bảo công nghệ đáp ứng đủ yêu cầu quản lý state của từng loại (global, UI, remote, local).
*   **Giảm Thiểu Dependency Không Cần Thiết:** Hạn chế thêm dependency ngoài khi công nghệ built-in đã đủ tốt.

