import type { Product, ProductReview, ProductQuestion } from "../types/productTypes"

// Mock product data matching the screenshot
export const mockProduct: Product = {
  id: "enterogermina-gut-defense",
  slug: "enterogermina-gut-defense",
  name: "Viên uống men vi sinh Enterogermina Gut Defense Sanofi tăng cường tiêu hóa",
  code: "00047402",
  registrationNumber: "2085/2024/ĐKSP",
  shortDescription: "Enterogermina Gut Defense giúp tăng cường tiêu hóa, hỗ trợ bảo vệ đường ruột trước hại khuẩn.",
  description: `<p>Enterogermina Gut Defense uống trước hoặc trong bữa ăn để giúp tăng cường sức khỏe đường tiêu hóa, giúp bổ sung men vi sinh có lợi cho hệ tiêu hóa và hỗ trợ tăng cường sức đề kháng cho cơ thể.</p>`,
  images: [
    {
      id: "1",
      url: "https://v0.dev/placeholder.svg?height=400&width=400",
      alt: "Enterogermina Gut Defense - Hình chính diện",
    },
    {
      id: "2",
      url: "https://v0.dev/placeholder.svg?height=400&width=400",
      alt: "Enterogermina Gut Defense - Hình mặt sau",
    },
    {
      id: "3",
      url: "https://v0.dev/placeholder.svg?height=400&width=400",
      alt: "Enterogermina Gut Defense - Hình chi tiết",
    },
    {
      id: "4",
      url: "https://v0.dev/placeholder.svg?height=400&width=400",
      alt: "Enterogermina Gut Defense - Hình hộp sản phẩm",
    },
  ],
  variants: [
    {
      id: "hop",
      name: "Hộp",
      price: 100000,
      originalPrice: 150000,
      inStock: true,
      specification: "Hộp 2 Vỉ x 10 Ống",
    },
    {
      id: "ong",
      name: "Ống",
      price: 5000,
      inStock: true,
      specification: "1 Ống x 5ml",
    },
    {
      id: "vi",
      name: "Vỉ",
      price: 50000,
      originalPrice: 75000,
      inStock: true,
      specification: "Vỉ 10 Ống",
    },
  ],
  currentVariant: {
    id: "hop",
    name: "Hộp",
    price: 100000,
    originalPrice: 150000,
    inStock: true,
    specification: "Hộp 2 Vỉ x 10 Ống",
  },
  brand: "Sanofi",
  origin: "Pháp",
  manufacturer: "Opella Healthcare Italy S.R.L.",
  manufacturingCountry: "Ý",
  dosageForm: "Hỗn dịch uống",
  specification: "Hộp 2 Vỉ x 10 Ống",
  categoryId: "da-day-ta-trang",
  category: {
    id: "da-day-ta-trang",
    name: "Dạ dày, tá tràng",
    slug: "da-day-ta-trang",
  },
  ingredients: "Bacillus clausii",
  ingredientsDescription:
    "Enterogermina Gut Defense giúp tăng cường tiêu hóa, hỗ trợ bảo vệ đường ruột trước hại khuẩn.",
  usage: `<p><strong>Cách dùng:</strong></p>
<ul>
<li>Người lớn và trẻ em trên 12 tuổi: Uống 1-2 ống/ngày</li>
<li>Trẻ em từ 6-12 tuổi: Uống 1 ống/ngày</li>
<li>Lắc đều trước khi sử dụng</li>
</ul>`,
  storage: "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C, tránh ánh nắng trực tiếp",
  rating: 5.0,
  reviewCount: 80,
  commentCount: 100,
  rewardPoints: 20,
  inStock: true,
  tags: ["men vi sinh", "tiêu hóa", "đường ruột", "miễn dịch"],
  promotions: [
    {
      id: "promo-1",
      type: "discount",
      title: "Giảm ngay 10%",
      description: "áp dụng đến 31/03",
      discountPercent: 10,
      validUntil: "2024-03-31",
    },
  ],
}

// Mock reviews data
export const mockReviews: ProductReview[] = [
  {
    id: "1",
    rating: 5,
    content: "Sản phẩm rất tốt, dùng được 1 tuần thấy đường ruột khỏe hơn hẳn",
    author: {
      name: "Thảo Hoàng",
    },
    createdAt: "2024-03-01T10:00:00Z",
    likes: 5,
    verified: true,
  },
  {
    id: "2",
    rating: 5,
    content: "Mình dùng sản phẩm này cho bé nhà mình, thấy bé ăn ngon miệng hơn và ít bị táo bón",
    author: {
      name: "Thu Thảo",
    },
    createdAt: "2024-02-28T15:30:00Z",
    likes: 3,
    verified: true,
  },
  {
    id: "3",
    rating: 5,
    content: "Đóng gói cẩn thận, giao hàng nhanh. Sẽ mua lại",
    author: {
      name: "Phú Thịnh",
    },
    createdAt: "2024-02-27T09:15:00Z",
    likes: 2,
    verified: true,
  },
]

// Mock questions data
export const mockQuestions: ProductQuestion[] = [
  {
    id: "1",
    question: "Sản phẩm này có dùng được cho trẻ em không?",
    answer: "Sản phẩm có thể dùng cho trẻ em từ 6 tuổi trở lên, liều dùng 1 ống/ngày.",
    author: {
      name: "Minh Anh",
    },
    createdAt: "2024-02-25T08:00:00Z",
    answered: true,
  },
  {
    id: "2",
    question: "Uống vào thời điểm nào trong ngày là tốt nhất?",
    answer: "Bạn có thể uống vào bất kỳ thời điểm nào trong ngày, tốt nhất là uống trước hoặc trong bữa ăn.",
    author: {
      name: "Thanh Thảo",
    },
    createdAt: "2024-02-24T14:20:00Z",
    answered: true,
  },
]

// Mock related products - Cập nhật với đầy đủ dữ liệu
export const mockRelatedProducts: Product[] = [
  {
    id: "enterogermina-5ml",
    slug: "enterogermina-5ml",
    name: "Enterogermina 5ml",
    shortDescription: "Men vi sinh Enterogermina 5ml hỗ trợ tiêu hóa, phòng ngừa rối loạn tiêu hóa",
    description: "Men vi sinh Enterogermina 5ml giúp cân bằng hệ vi sinh đường ruột, hỗ trợ tiêu hóa tốt",
    images: [
      {
        id: "1",
        url: "https://v0.dev/placeholder.svg?height=200&width=200",
        alt: "Enterogermina 5ml",
      },
    ],
    code: "00047403",
    registrationNumber: "2086/2024/ĐKSP",
    variants: [
      {
        id: "hop",
        name: "Hộp",
        price: 220000,
        originalPrice: 250000,
        inStock: true,
        specification: "Hộp 20 ống",
      },
      {
        id: "ong",
        name: "Ống",
        price: 12000,
        inStock: true,
        specification: "1 Ống x 5ml",
      },
      {
        id: "vi",
        name: "Vỉ",
        price: 110000,
        originalPrice: 125000,
        inStock: true,
        specification: "Vỉ 10 Ống",
      },
    ],
    currentVariant: {
      id: "hop",
      name: "Hộp",
      price: 220000,
      originalPrice: 250000,
      inStock: true,
      specification: "Hộp 20 ống",
    },
    brand: "Sanofi",
    origin: "Pháp",
    manufacturer: "Sanofi-Aventis",
    manufacturingCountry: "Ý",
    dosageForm: "Hỗn dịch uống",
    specification: "Hộp 20 ống",
    categoryId: "men-vi-sinh",
    category: {
      id: "men-vi-sinh",
      name: "Men vi sinh",
      slug: "men-vi-sinh",
    },
    ingredients: "Bacillus clausii",
    ingredientsDescription: "Chứa bào tử vi khuẩn Bacillus clausii có lợi cho đường ruột",
    usage: "Uống 1-2 ống mỗi ngày, lắc đều trước khi sử dụng",
    storage: "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C",
    rating: 4.8,
    reviewCount: 65,
    commentCount: 70,
    rewardPoints: 15,
    inStock: true,
    tags: ["men vi sinh", "tiêu hóa", "đường ruột"],
    promotions: [
      {
        id: "promo-1",
        type: "discount",
        title: "Giảm 12%",
        description: "Đến hết tháng 3",
        discountPercent: 12,
        validUntil: "2024-03-31",
      },
    ],
    unit: "Hộp",
    packageInfo: "Hộp 20 ống x 5ml",
  },
  {
    id: "enterogermina-plus",
    slug: "enterogermina-plus",
    name: "Enterogermina Plus",
    shortDescription: "Enterogermina Plus bổ sung lợi khuẩn, tăng cường hệ miễn dịch đường ruột",
    description: "Enterogermina Plus với công thức cải tiến, bổ sung nhiều chủng lợi khuẩn hơn",
    images: [
      {
        id: "1",
        url: "https://v0.dev/placeholder.svg?height=200&width=200",
        alt: "Enterogermina Plus",
      },
    ],
    code: "00047404",
    registrationNumber: "2087/2024/ĐKSP",
    variants: [
      {
        id: "hop",
        name: "Hộp",
        price: 180000,
        originalPrice: 200000,
        inStock: true,
        specification: "Hộp 10 gói",
      },
      {
        id: "goi",
        name: "Gói",
        price: 20000,
        inStock: true,
        specification: "1 Gói x 5g",
      },
    ],
    currentVariant: {
      id: "hop",
      name: "Hộp",
      price: 180000,
      originalPrice: 200000,
      inStock: true,
      specification: "Hộp 10 gói",
    },
    brand: "Sanofi",
    origin: "Pháp",
    manufacturer: "Sanofi-Aventis",
    manufacturingCountry: "Ý",
    dosageForm: "Bột uống",
    specification: "Hộp 10 gói",
    categoryId: "men-vi-sinh",
    category: {
      id: "men-vi-sinh",
      name: "Men vi sinh",
      slug: "men-vi-sinh",
    },
    ingredients: "Bacillus clausii, Lactobacillus acidophilus",
    ingredientsDescription: "Kết hợp nhiều chủng lợi khuẩn giúp cân bằng hệ vi sinh đường ruột",
    usage: "Uống 1 gói mỗi ngày, hòa với nước ấm",
    storage: "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C",
    rating: 4.7,
    reviewCount: 42,
    commentCount: 45,
    rewardPoints: 12,
    inStock: true,
    tags: ["men vi sinh", "tiêu hóa", "đường ruột", "miễn dịch"],
    promotions: [
      {
        id: "promo-1",
        type: "discount",
        title: "Giảm 10%",
        description: "Đến hết tháng 3",
        discountPercent: 10,
        validUntil: "2024-03-31",
      },
    ],
    unit: "Hộp",
    packageInfo: "Hộp 10 gói x 5g",
  },
  {
    id: "enterogermina-kids",
    slug: "enterogermina-kids",
    name: "Enterogermina Kids",
    shortDescription: "Enterogermina Kids dành riêng cho trẻ em, hương vị dễ uống",
    description: "Enterogermina Kids với công thức đặc biệt phù hợp cho trẻ em từ 3 tuổi trở lên",
    images: [
      {
        id: "1",
        url: "https://v0.dev/placeholder.svg?height=200&width=200",
        alt: "Enterogermina Kids",
      },
    ],
    code: "00047405",
    registrationNumber: "2088/2024/ĐKSP",
    variants: [
      {
        id: "hop",
        name: "Hộp",
        price: 150000,
        originalPrice: 170000,
        inStock: true,
        specification: "Hộp 10 ống",
      },
      {
        id: "ong",
        name: "Ống",
        price: 16000,
        inStock: true,
        specification: "1 Ống x 5ml",
      },
      {
        id: "vi",
        name: "Vỉ",
        price: 75000,
        originalPrice: 85000,
        inStock: true,
        specification: "Vỉ 5 Ống",
      },
    ],
    currentVariant: {
      id: "hop",
      name: "Hộp",
      price: 150000,
      originalPrice: 170000,
      inStock: true,
      specification: "Hộp 10 ống",
    },
    brand: "Sanofi",
    origin: "Pháp",
    manufacturer: "Sanofi-Aventis",
    manufacturingCountry: "Ý",
    dosageForm: "Hỗn dịch uống",
    specification: "Hộp 10 ống",
    categoryId: "men-vi-sinh",
    category: {
      id: "men-vi-sinh",
      name: "Men vi sinh",
      slug: "men-vi-sinh",
    },
    ingredients: "Bacillus clausii, vitamin D",
    ingredientsDescription: "Kết hợp men vi sinh và vitamin D giúp tăng cường miễn dịch cho trẻ",
    usage: "Trẻ từ 3-12 tuổi: uống 1 ống mỗi ngày",
    storage: "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C",
    rating: 4.9,
    reviewCount: 78,
    commentCount: 80,
    rewardPoints: 10,
    inStock: true,
    tags: ["men vi sinh", "trẻ em", "tiêu hóa", "miễn dịch"],
    promotions: [
      {
        id: "promo-1",
        type: "discount",
        title: "Giảm 12%",
        description: "Đến hết tháng 3",
        discountPercent: 12,
        validUntil: "2024-03-31",
      },
    ],
    unit: "Hộp",
    packageInfo: "Hộp 10 ống x 5ml",
  },
  {
    id: "enterogermina-forte",
    slug: "enterogermina-forte",
    name: "Enterogermina Forte",
    shortDescription: "Enterogermina Forte với nồng độ cao hơn, dành cho người lớn",
    description: "Enterogermina Forte chứa nồng độ cao hơn các chủng lợi khuẩn, phù hợp cho người lớn",
    images: [
      {
        id: "1",
        url: "https://v0.dev/placeholder.svg?height=200&width=200",
        alt: "Enterogermina Forte",
      },
    ],
    code: "00047406",
    registrationNumber: "2089/2024/ĐKSP",
    variants: [
      {
        id: "hop",
        name: "Hộp",
        price: 190000,
        originalPrice: 210000,
        inStock: true,
        specification: "Hộp 10 viên",
      },
      {
        id: "vi",
        name: "Vỉ",
        price: 95000,
        originalPrice: 105000,
        inStock: true,
        specification: "Vỉ 5 viên",
      },
      {
        id: "vien",
        name: "Viên",
        price: 20000,
        inStock: true,
        specification: "1 Viên",
      },
    ],
    currentVariant: {
      id: "hop",
      name: "Hộp",
      price: 190000,
      originalPrice: 210000,
      inStock: true,
      specification: "Hộp 10 viên",
    },
    brand: "Sanofi",
    origin: "Pháp",
    manufacturer: "Sanofi-Aventis",
    manufacturingCountry: "Ý",
    dosageForm: "Viên nang",
    specification: "Hộp 10 viên",
    categoryId: "men-vi-sinh",
    category: {
      id: "men-vi-sinh",
      name: "Men vi sinh",
      slug: "men-vi-sinh",
    },
    ingredients: "Bacillus clausii, Lactobacillus acidophilus, Bifidobacterium",
    ingredientsDescription: "Kết hợp nhiều chủng lợi khuẩn với nồng độ cao",
    usage: "Người lớn: uống 1 viên mỗi ngày sau bữa ăn",
    storage: "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C",
    rating: 4.6,
    reviewCount: 55,
    commentCount: 60,
    rewardPoints: 12,
    inStock: true,
    tags: ["men vi sinh", "tiêu hóa", "đường ruột", "miễn dịch"],
    promotions: [
      {
        id: "promo-1",
        type: "discount",
        title: "Giảm 10%",
        description: "Đến hết tháng 3",
        discountPercent: 10,
        validUntil: "2024-03-31",
      },
    ],
    unit: "Hộp",
    packageInfo: "Hộp 10 viên nang",
  },
  {
    id: "enterogermina-daily",
    slug: "enterogermina-daily",
    name: "Enterogermina Daily",
    shortDescription: "Enterogermina Daily sử dụng hàng ngày, duy trì sức khỏe đường ruột",
    description: "Enterogermina Daily với công thức cân bằng, phù hợp sử dụng hàng ngày để duy trì sức khỏe đường ruột",
    images: [
      {
        id: "1",
        url: "https://v0.dev/placeholder.svg?height=200&width=200",
        alt: "Enterogermina Daily",
      },
    ],
    code: "00047407",
    registrationNumber: "2090/2024/ĐKSP",
    variants: [
      {
        id: "hop",
        name: "Hộp",
        price: 250000,
        originalPrice: 280000,
        inStock: true,
        specification: "Hộp 30 viên",
      },
      {
        id: "vi",
        name: "Vỉ",
        price: 85000,
        originalPrice: 95000,
        inStock: true,
        specification: "Vỉ 10 viên",
      },
      {
        id: "vien",
        name: "Viên",
        price: 9000,
        inStock: true,
        specification: "1 Viên",
      },
    ],
    currentVariant: {
      id: "hop",
      name: "Hộp",
      price: 250000,
      originalPrice: 280000,
      inStock: true,
      specification: "Hộp 30 viên",
    },
    brand: "Sanofi",
    origin: "Pháp",
    manufacturer: "Sanofi-Aventis",
    manufacturingCountry: "Ý",
    dosageForm: "Viên nang",
    specification: "Hộp 30 viên",
    categoryId: "men-vi-sinh",
    category: {
      id: "men-vi-sinh",
      name: "Men vi sinh",
      slug: "men-vi-sinh",
    },
    ingredients: "Bacillus clausii, Lactobacillus acidophilus, Bifidobacterium, Prebiotic",
    ingredientsDescription: "Kết hợp lợi khuẩn và prebiotic giúp nuôi dưỡng hệ vi sinh đường ruột",
    usage: "Người lớn: uống 1 viên mỗi ngày sau bữa ăn",
    storage: "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C",
    rating: 4.7,
    reviewCount: 90,
    commentCount: 95,
    rewardPoints: 15,
    inStock: true,
    tags: ["men vi sinh", "tiêu hóa", "đường ruột", "miễn dịch", "hàng ngày"],
    promotions: [
      {
        id: "promo-1",
        type: "discount",
        title: "Giảm 11%",
        description: "Đến hết tháng 3",
        discountPercent: 11,
        validUntil: "2024-03-31",
      },
    ],
    unit: "Hộp",
    packageInfo: "Hộp 30 viên nang",
  },
]

