import { v4 as uuidv4 } from 'uuid'

export interface Address {
  id: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface Product {
  id: string
  perfume_code: string
  name: string
  description: string
  price: number // Giá bán (sale_price)
  import_price: number // Giá nhập
  listed_price: number
  category: string // ID của category
  fragrance_category_id: string
  fragrance_brand_id: string
  gender: 'male' | 'female' | 'unisex'
  ingredients: string[]
  origin: string
  volume: number[] // Mảng các dung tích
  stock: number
  images: string[]
  status: 'active' | 'hidden'
  concentration:
    | 'Parfum'
    | 'Eau de Parfum'
    | 'Eau de Toilette'
    | 'Eau de Cologne'
    | 'Eau Fraiche'
  top_notes: string[]
  middle_notes: string[]
  base_notes: string[]
  longevity: 'Very Weak' | 'Weak' | 'Moderate' | 'Long Lasting' | 'Eternal'
  sillage: 'Intimate' | 'Moderate' | 'Strong' | 'Enormous'
  created_at: string
  updated_at: string
  view: number
  is_hot: 'yes' | 'no'
}

export interface Order {
  id: string
  order_code: string
  userId: string
  products: {
    product: Product // Tham chiếu đầy đủ đến Product
    quantity: number
  }[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

// Thêm OrderHistory
export interface OrderHistory {
  id: string
  order_id: string // ID của đơn hàng
  status: Order['status'] // Trạng thái mới
  updated_by: string // ID của người cập nhật (admin/user)
  updated_at: string
  note?: string // Ghi chú (tùy chọn)
}

export interface User {
  id: string
  user_code: string
  name: string
  email: string
  password?: string // Optional, chỉ dùng khi cần thiết (login, register)
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'blocked'
  phone: string
  registered_at: string
  defaultAddressId?: string // ID của địa chỉ mặc định
  addresses: Address[]
  totalOrders: number
  totalSpent: number
  birthday?: string
  gender?: 'male' | 'female' | 'other'
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Category {
  id: string
  name: string
  parentId: string | null
  level: number // Cấp độ của danh mục
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  description: string
  logo: string
  created_at: string
  updated_at: string
}

export interface Slide {
  id: string
  name: string
  arrow: 'on' | 'off'
  dots: 'on' | 'off'
  auto_play: 'on' | 'off'
  fade: 'off' | 'on'
  speed: number
  active: 'on' | 'off'
  created_at: string
  updated_at: string
}

export interface SlideGallery {
  id: string
  path: string
  order: number
  type: 'image' | 'video'
  slide_id: string
}

export interface PerfumeGallery {
  id: string
  path: string
  type: 'image' | 'video'
  product_id: string
}

export interface Discount {
  id: string
  discount_code: string
  permanent: boolean | null // Đổi thành boolean | null
  percent: number
  minimum_spend: number | null
  maximum_spend: number | null
  limit: number
  product_ids: string // Có thể để dạng chuỗi, hoặc tạo mảng discount_products
  created_at: string
  updated_at: string
}

// Thêm interface cho discount_products (nếu muốn)
export interface DiscountProduct {
  id: string
  discount_id: string
  product_id: string
}

export interface Review {
  id: string
  star: number
  content: string
  user_id: string
  product_id: string
  order_id: string // Đổi thành order_id, bỏ order_detail_id
  created_at: string
  updated_at: string
}

export interface FavoriteProduct {
  id: string
  user_id: string
  product_id: string
}

// Mock data

const now = new Date().toISOString()

// Thêm dữ liệu mẫu cho các mảng
const sampleFragranceCategories = [
  'Fresh',
  'Floral',
  'Woody',
  'Oriental',
  'Fruity',
  'Citrus',
  'Gourmand',
  'Chypre'
]
const sampleFragranceBrands = [
  'Chanel',
  'Dior',
  'Tom Ford',
  'Creed',
  'Jo Malone',
  'Byredo',
  'Le Labo',
  'Diptyque'
]
const sampleTopNotes = [
  'Bergamot',
  'Lemon',
  'Orange',
  'Grapefruit',
  'Lime',
  'Mandarin',
  'Neroli',
  'Petitgrain',
  'Pink Pepper',
  'Black Pepper'
]
const sampleMiddleNotes = [
  'Jasmine',
  'Rose',
  'Ylang-Ylang',
  'Lily of the Valley',
  'Tuberose',
  'Lavender',
  'Geranium',
  'Violet',
  'Orris Root',
  'Clary Sage'
]
const sampleBaseNotes = [
  'Sandalwood',
  'Cedarwood',
  'Patchouli',
  'Vetiver',
  'Oakmoss',
  'Vanilla',
  'Tonka Bean',
  'Musk',
  'Amber',
  'Benzoin'
]

// Tạo nhiều sản phẩm hơn
export const products: Product[] = Array.from({ length: 20 }, (_, i) => ({
  id: uuidv4(),
  perfume_code: `PERFUME${i + 1}`,
  name: `Perfume ${i + 1} ${['A', 'B', 'C', 'D', 'E'][i % 5]}`,
  description: `A captivating fragrance with a unique blend of notes. ${
    i % 2 === 0 ? 'Perfect for daytime wear.' : 'Ideal for evening occasions.'
  }`,
  price: parseFloat((Math.random() * (150 - 50) + 50).toFixed(2)), // Giá từ 50 đến 150
  import_price: parseFloat((Math.random() * (70 - 20) + 20).toFixed(2)),
  listed_price: parseFloat((Math.random() * (200 - 100) + 100).toFixed(2)),
  category: `c${(i % 3) + 1}`, // ID của category
  fragrance_category_id: `c${(i % 7) + 1}`, //7 categories
  fragrance_brand_id: `b${(i % 5) + 1}`, // 5 brands
  gender: ['male', 'female', 'unisex'][i % 3] as 'male' | 'female' | 'unisex',
  ingredients: [
    'Alcohol',
    'Aqua',
    'Parfum',
    sampleTopNotes[i % sampleTopNotes.length],
    sampleMiddleNotes[i % sampleMiddleNotes.length],
    sampleBaseNotes[i % sampleBaseNotes.length]
  ],
  origin: ['France', 'Italy', 'USA', 'UK'][i % 4],
  volume: [30, 50, 75, 100, 125].slice(0, (i % 3) + 1), // Ngẫu nhiên 1-3 dung tích
  stock: Math.floor(Math.random() * 100), // Số lượng từ 0 đến 99
  images: [`/placeholder.svg?height=200&width=200&text=Product${i + 1}`],
  status: i % 5 === 0 ? 'hidden' : 'active',
  concentration: [
    'Parfum',
    'Eau de Parfum',
    'Eau de Toilette',
    'Eau de Cologne',
    'Eau Fraiche'
  ][i % 5] as
    | 'Parfum'
    | 'Eau de Parfum'
    | 'Eau de Toilette'
    | 'Eau de Cologne'
    | 'Eau Fraiche',
  top_notes: [sampleTopNotes[i % sampleTopNotes.length]],
  middle_notes: [sampleMiddleNotes[i % sampleMiddleNotes.length]],
  base_notes: [sampleBaseNotes[i % sampleBaseNotes.length]],
  longevity: ['Very Weak', 'Weak', 'Moderate', 'Long Lasting', 'Eternal'][
    i % 5
  ] as 'Very Weak' | 'Weak' | 'Moderate' | 'Long Lasting' | 'Eternal',
  sillage: ['Intimate', 'Moderate', 'Strong', 'Enormous'][i % 4] as
    | 'Intimate'
    | 'Moderate'
    | 'Strong'
    | 'Enormous',
  created_at: now,
  updated_at: now,
  view: Math.floor(Math.random() * 1000),
  is_hot: i % 3 === 0 ? 'yes' : 'no'
}))
// Đảm bảo tạo users trước
export const users: User[] = [
  {
    id: 'user1', // Thêm id cố định
    user_code: `USER-ADMIN`,
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123', // Sẽ hash khi tích hợp thực tế
    role: 'admin',
    status: 'active',
    phone: '+1234567890',
    registered_at: now,
    defaultAddressId: 'address1',
    addresses: [
      {
        id: 'address1',
        street: '123 Admin St',
        city: 'Admin City',
        state: 'Admin State',
        country: 'Admin Country',
        zipCode: '12345'
      }
    ],
    totalOrders: 0,
    totalSpent: 0,
    created_at: now,
    updated_at: now,
    deleted_at: null
  },
  {
    id: 'user2',
    user_code: `USER-CUSTOMER`,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'userpassword',
    role: 'user',
    status: 'active',
    phone: '+1987654321',
    registered_at: now,
    defaultAddressId: 'address2',
    addresses: [
      {
        id: 'address2',
        street: '456 User St',
        city: 'User City',
        state: 'User State',
        country: 'User Country',
        zipCode: '67890'
      }
    ],
    totalOrders: 5,
    totalSpent: 500.0,
    created_at: now,
    updated_at: now,
    deleted_at: null
  }
  // ... thêm các user khác
]

// Sau đó tạo orders với userId trỏ đến users có thật
export const orders: Order[] = Array.from({ length: 15 }, (_, i) => {
  const numProducts = Math.floor(Math.random() * 3) + 1 // 1-3 sản phẩm mỗi đơn
  const selectedProducts = Array.from({ length: numProducts }, () => ({
    product: products[Math.floor(Math.random() * products.length)],
    quantity: Math.floor(Math.random() * 5) + 1 // Số lượng từ 1 đến 5
  }))

  const totalAmount = selectedProducts.reduce(
    (acc, { product, quantity }) => acc + product.price * quantity,
    0
  )

  return {
    id: uuidv4(),
    order_code: `ORDER-${uuidv4()}`,
    userId: i % 2 === 0 ? 'user1' : 'user2', // Sử dụng ID cố định của users
    products: selectedProducts,
    totalAmount,
    status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][
      Math.floor(Math.random() * 5)
    ] as Order['status'],
    created_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 30)
    ).toISOString(), // Trong vòng 30 ngày trở lại
    updated_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 30)
    ).toISOString()
  }
})

// Mock order history
export const order_histories: OrderHistory[] = []

orders.forEach((order) => {
  // Initial order creation
  order_histories.push({
    id: uuidv4(),
    order_id: order.id,
    status: 'pending', // Initial status
    updated_by: 'system', // Or a specific admin user ID
    updated_at: order.created_at,
    note: 'Order created'
  })

  // Simulate status changes
  if (order.status !== 'pending') {
    const allStatus: Order['status'][] = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ]
    const statusChanges = allStatus.slice(allStatus.indexOf(order.status) + 1)

    let lastUpdate = order.created_at

    statusChanges.forEach((status, index) => {
      const updateTime = new Date(
        new Date(lastUpdate).getTime() + 1000 * 60 * 60 * (index + 1) // + 1 hour for each status change
      ).toISOString()

      order_histories.push({
        id: uuidv4(),
        order_id: order.id,
        status: status,
        updated_by: 'admin', // Or a specific admin user ID
        updated_at: updateTime,
        note: `Order status changed to ${status}`
      })
      lastUpdate = updateTime
    })
  }
})

export const categories: Category[] = [
  {
    id: 'c1',
    name: 'Fresh Perfumes',
    parentId: null,
    level: 0, // Cấp độ cao nhất
    created_at: now,
    updated_at: now
  },
  {
    id: 'c2',
    name: 'Floral Perfumes',
    parentId: null,
    level: 0,
    created_at: now,
    updated_at: now
  },
  {
    id: 'c3',
    name: "Men's Fresh Perfumes",
    parentId: 'c1', // Danh mục con của "Fresh Perfumes"
    level: 1,
    created_at: now,
    updated_at: now
  },
  {
    id: 'c4',
    name: 'Woody Perfumes',
    parentId: null,
    level: 0,
    created_at: now,
    updated_at: now
  },
  {
    id: 'c5',
    name: 'Oriental Perfumes',
    parentId: null,
    level: 0,
    created_at: now,
    updated_at: now
  },
  {
    id: 'c6',
    name: "Women's Floral Perfumes",
    parentId: 'c2',
    level: 1,
    created_at: now,
    updated_at: now
  },
  {
    id: 'c7',
    name: 'Unisex Woody Perfumes',
    parentId: 'c4',
    level: 1,
    created_at: now,
    updated_at: now
  }
  // ... thêm các category khác
]

export const brands: Brand[] = [
  {
    id: 'b1',
    name: 'Chanel',
    description: 'Luxury French fashion house',
    logo: '/placeholder.svg?height=100&width=100',
    created_at: now,
    updated_at: now
  },
  {
    id: 'b2',
    name: 'Dior',
    description: 'French luxury goods company',
    logo: '/placeholder.svg?height=100&width=100',
    created_at: now,
    updated_at: now
  },
  {
    id: 'b3',
    name: 'Gucci',
    description: 'Italian luxury fashion brand',
    logo: '/placeholder.svg?height=100&width=100',
    created_at: now,
    updated_at: now
  },
  {
    id: 'b4',
    name: 'Tom Ford',
    description: 'American luxury fashion house',
    logo: '/placeholder.svg?height=100&width=100',
    created_at: now,
    updated_at: now
  },
  {
    id: 'b5',
    name: 'Creed',
    description: 'Anglo-French perfume house',
    logo: '/placeholder.svg?height=100&width=100',
    created_at: now,
    updated_at: now
  }
]

//Mocks data slides
export const slides: Slide[] = [
  {
    id: uuidv4(),
    name: 'Slide 1',
    arrow: 'on',
    dots: 'on',
    auto_play: 'on',
    fade: 'off',
    speed: 3000,
    active: 'on',
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    name: 'Slide 2',
    arrow: 'on',
    dots: 'on',
    auto_play: 'off',
    fade: 'on',
    speed: 4000,
    active: 'off',
    created_at: now,
    updated_at: now
  }
]

// Mock data for Slide Galleries
export const slide_galleries: SlideGallery[] = [
  {
    id: uuidv4(),
    path: '/placeholder.svg?height=400&width=800',
    order: 1,
    type: 'image',
    slide_id: slides[0].id
  },
  {
    id: uuidv4(),
    path: '/placeholder.svg?height=400&width=800',
    order: 2,
    type: 'image',
    slide_id: slides[0].id
  }
]

// Mock data for Perfume Galleries
export const perfume_galleries: PerfumeGallery[] = [
  {
    id: uuidv4(),
    path: '/placeholder.svg?height=200&width=200',
    type: 'image',
    product_id: products[0].id
  },
  {
    id: uuidv4(),
    path: '/placeholder.svg?height=200&width=200',
    type: 'image',
    product_id: products[0].id
  }
]

// Mock data for Discounts
export const discounts: Discount[] = [
  {
    id: uuidv4(),
    discount_code: 'SUMMER20',
    permanent: false, // Sử dụng boolean
    percent: 20,
    minimum_spend: 50,
    maximum_spend: null,
    limit: 100,
    product_ids: '', // Để trống, hoặc có thể tạo mảng discount_products
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    discount_code: 'FALL15',
    permanent: true,
    percent: 15,
    minimum_spend: null,
    maximum_spend: 200,
    limit: 50,
    product_ids: '', // Để trống, hoặc có thể tạo mảng discount_products
    created_at: now,
    updated_at: now
  }
]

// Mock data for Discount Products (nếu bạn muốn)
export const discount_products: DiscountProduct[] = [
  //   {
  //     id: uuidv4(),
  //     discount_id: discounts[0].id,
  //     product_id: products[0].id,
  //   },
  //   {
  //     id: uuidv4(),
  //     discount_id: discounts[0].id,
  //     product_id: products[1].id,
  //   },
]

// Mock data Reviews
export const reviews: Review[] = [
  {
    id: uuidv4(),
    star: 5,
    content: 'Great fragrance, love it!',
    user_id: users[1].id,
    product_id: products[0].id,
    order_id: orders[0].id, // Liên kết với order
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    star: 4,
    content: "Nice scent, but it doesn't last very long.",
    user_id: users[1].id, // Cùng một user
    product_id: products[1].id,
    order_id: orders[0].id, // Liên kết với order
    created_at: now,
    updated_at: now
  }
]

// Mock data for Favorite Products
export const favorite_products: FavoriteProduct[] = [
  {
    id: uuidv4(),
    user_id: users[1].id,
    product_id: products[0].id
  },
  {
    id: uuidv4(),
    user_id: users[1].id,
    product_id: products[2].id
  }
]

// Các hàm API (có điều chỉnh)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const DELAY_SHORT = 500
const DELAY_MEDIUM = 1000
const DELAY_LONG = 2000

// Product API
export async function fetchProducts(): Promise<Product[]> {
  await delay(DELAY_MEDIUM)
  return products
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  await delay(DELAY_SHORT)
  return products.find((p) => p.id === id)
}

export async function createProduct(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'perfume_code'>
): Promise<Product> {
  await delay(DELAY_LONG)
  const newProduct: Product = {
    ...product,
    id: uuidv4(),
    perfume_code: `PERFUME-${uuidv4()}`, // Tạo perfume_code
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  products.push(newProduct)
  return newProduct
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  await delay(DELAY_LONG)
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Product not found')

  // Cập nhật updated_at
  updates.updated_at = new Date().toISOString()

  products[index] = { ...products[index], ...updates }
  return products[index]
}

export async function deleteProduct(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Product not found')
  products.splice(index, 1)
}

// Order API
export async function fetchOrders(): Promise<Order[]> {
  await delay(DELAY_MEDIUM)
  return orders
}

export async function fetchOrder(id: string): Promise<Order | undefined> {
  await delay(DELAY_SHORT)
  return orders.find((o) => o.id === id)
}

export async function fetchOrdersByUserId(userId: string): Promise<Order[]> {
  await delay(DELAY_MEDIUM)
  return orders.filter((order) => order.userId === userId)
}

// Order History API
export async function fetchOrderHistory(
  orderId: string
): Promise<OrderHistory[]> {
  await delay(DELAY_MEDIUM)
  return order_histories.filter((history) => history.order_id === orderId)
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  updatedBy: string = 'admin' // Thêm người cập nhật
): Promise<Order> {
  await delay(DELAY_LONG)
  const order = orders.find((o) => o.id === id)
  if (!order) throw new Error('Order not found')

  // Tạo bản ghi lịch sử
  const newHistoryEntry: OrderHistory = {
    id: uuidv4(),
    order_id: order.id,
    status: status,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
    note: `Order status changed to ${status}` // Ghi chú
  }
  order_histories.push(newHistoryEntry)

  order.status = status
  order.updated_at = new Date().toISOString()
  return order
}

// User API (loại bỏ password khỏi các hàm fetch)
export async function fetchUsers(): Promise<Omit<User, 'password'>[]> {
  await delay(DELAY_MEDIUM)
  return users.map(({ password, ...user }) => user)
}

export async function fetchUser(
  id: string
): Promise<Omit<User, 'password'> | null> {
  await delay(DELAY_SHORT)
  const user = users.find((u) => u.id === id)
  if (user) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return null
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'password'>>
): Promise<Omit<User, 'password'> | null> {
  await delay(DELAY_LONG)
  const user = users.find((u) => u.id === id)
  if (user) {
    // Cập nhật updated_at
    updates.updated_at = new Date().toISOString()
    Object.assign(user, updates)
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return null
}

export async function deleteUser(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) throw new Error('User not found')
  users.splice(index, 1)
}

// Login, Register, Reset Password, Change Role, Change Password
export async function login(
  email: string,
  password: string
): Promise<User | null> {
  await delay(DELAY_LONG)
  const user = users.find((u) => u.email === email && u.password === password)
  return user || null
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<User> {
  await delay(DELAY_LONG)
  const newUser: User = {
    id: uuidv4(),
    user_code: `USER-${uuidv4()}`,
    name,
    email,
    password, // In a real app, this would be hashed
    role: 'user',
    status: 'active',
    phone: '',
    registered_at: new Date().toISOString(),
    defaultAddressId: undefined,
    addresses: [],
    totalOrders: 0,
    totalSpent: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
  users.push(newUser)
  return newUser
}

export async function resetPassword(email: string): Promise<boolean> {
  await delay(DELAY_LONG)
  const user = users.find((u) => u.email === email)
  if (user) {
    // In a real app, this would send an email with a reset link
    console.log(`Password reset requested for ${email}`)
    return true
  }
  return false
}

export async function changeUserRole(
  userId: string,
  newRole: 'admin' | 'user'
): Promise<User | null> {
  await delay(DELAY_LONG)
  const user = users.find((u) => u.id === userId)
  if (user) {
    user.role = newRole
    return user
  }
  return null
}

export async function changeUserPassword(
  id: string,
  newPassword: string
): Promise<void> {
  await delay(DELAY_LONG)
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('User not found')
  user.password = newPassword // In a real app, this would be hashed
}

// Category API
export async function fetchCategories(): Promise<Category[]> {
  await delay(DELAY_MEDIUM)
  return categories
}

export async function fetchCategory(id: string): Promise<Category | undefined> {
  await delay(DELAY_SHORT)
  return categories.find((c) => c.id === id)
}

export async function createCategory(
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<Category> {
  await delay(DELAY_LONG)
  const newCategory = {
    ...category,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  categories.push(newCategory)
  return newCategory
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  await delay(DELAY_LONG)
  const category = categories.find((c) => c.id === id)
  if (!category) throw new Error('Category not found')
  // Cập nhật updated_at
  updates.updated_at = new Date().toISOString()
  Object.assign(category, updates)
  return category
}

export async function deleteCategory(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) throw new Error('Category not found')
  categories.splice(index, 1)
}

// Brand API
export async function fetchBrands(): Promise<Brand[]> {
  await delay(DELAY_MEDIUM)
  return brands
}
export async function fetchBrand(id: string): Promise<Brand | undefined> {
  await delay(DELAY_SHORT)
  return brands.find((b) => b.id === id)
}

export async function createBrand(
  brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>
): Promise<Brand> {
  await delay(DELAY_LONG)
  const newBrand: Brand = {
    ...brand,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  brands.push(newBrand)
  return newBrand
}

export async function updateBrand(
  id: string,
  updates: Partial<Brand>
): Promise<Brand> {
  await delay(DELAY_LONG)
  const index = brands.findIndex((b) => b.id === id)
  if (index === -1) throw new Error('Brand not found')
  updates.updated_at = new Date().toISOString()
  brands[index] = { ...brands[index], ...updates }
  return brands[index]
}
export async function deleteBrand(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = brands.findIndex((b) => b.id === id)
  if (index === -1) throw new Error('Brand not found')
  brands.splice(index, 1)
}

// Slides
export async function fetchSlides(): Promise<Slide[]> {
  await delay(DELAY_MEDIUM)
  return slides
}
export async function createSlide(
  slide: Omit<Slide, 'id' | 'created_at' | 'updated_at'>
): Promise<Slide> {
  await delay(DELAY_LONG)
  const newSlide = {
    ...slide,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  slides.push(newSlide)
  return newSlide
}
export async function updateSlide(
  id: string,
  updates: Partial<Slide>
): Promise<Slide> {
  await delay(DELAY_LONG)
  const slide = slides.find((s) => s.id === id)
  if (!slide) throw new Error('Slide not found')
  updates.updated_at = new Date().toISOString()
  Object.assign(slide, updates)
  return slide
}
export async function deleteSlide(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = slides.findIndex((s) => s.id === id)
  if (index === -1) throw new Error('Slide not found')
  slides.splice(index, 1)
}

// Slide Galleries
export async function fetchSlideGalleries(): Promise<SlideGallery[]> {
  await delay(DELAY_MEDIUM)
  return slide_galleries
}

export async function createSlideGallery(
  gallery: Omit<SlideGallery, 'id'>
): Promise<SlideGallery> {
  await delay(DELAY_LONG)
  const newGallery = { ...gallery, id: uuidv4() }
  slide_galleries.push(newGallery)
  return newGallery
}

export async function updateSlideGallery(
  id: string,
  updates: Partial<SlideGallery>
): Promise<SlideGallery> {
  await delay(DELAY_LONG)
  const gallery = slide_galleries.find((g) => g.id === id)
  if (!gallery) throw new Error('Slide gallery not found')
  Object.assign(gallery, updates)
  return gallery
}

export async function deleteSlideGallery(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = slide_galleries.findIndex((g) => g.id === id)
  if (index === -1) throw new Error('Slide gallery not found')
  slide_galleries.splice(index, 1)
}

// Perfume Galleries (tương tự Slide Galleries)
export async function fetchPerfumeGalleries(): Promise<PerfumeGallery[]> {
  await delay(DELAY_MEDIUM)
  return perfume_galleries
}

export async function createPerfumeGallery(
  gallery: Omit<PerfumeGallery, 'id'>
): Promise<PerfumeGallery> {
  await delay(DELAY_LONG)
  const newGallery = { ...gallery, id: uuidv4() }
  perfume_galleries.push(newGallery)
  return newGallery
}
export async function updatePerfumeGallery(
  id: string,
  updates: Partial<PerfumeGallery>
): Promise<PerfumeGallery> {
  await delay(DELAY_LONG)
  const index = perfume_galleries.findIndex((b) => b.id === id)
  if (index === -1) throw new Error('Perfume Gallery not found')
  perfume_galleries[index] = { ...perfume_galleries[index], ...updates }
  return perfume_galleries[index]
}

export async function deletePerfumeGallery(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = perfume_galleries.findIndex((b) => b.id === id)
  if (index === -1) throw new Error('Perfume Gallery not found')
  perfume_galleries.splice(index, 1)
}

// Discounts
export async function fetchDiscounts(): Promise<Discount[]> {
  await delay(DELAY_MEDIUM)
  return discounts
}

export async function createDiscount(
  discount: Omit<Discount, 'id' | 'created_at' | 'updated_at'>
): Promise<Discount> {
  await delay(DELAY_LONG)
  const newDiscount = {
    ...discount,
    id: uuidv4(),
    created_at: now,
    updated_at: now
  }
  discounts.push(newDiscount)
  return newDiscount
}

export async function updateDiscount(
  id: string,
  updates: Partial<Discount>
): Promise<Discount> {
  await delay(DELAY_LONG)
  const index = discounts.findIndex((b) => b.id === id)
  if (index === -1) throw new Error('Discount not found')
  updates.updated_at = new Date().toISOString()
  discounts[index] = { ...discounts[index], ...updates }
  return discounts[index]
}

export async function deleteDiscount(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = discounts.findIndex((b) => b.id === id)
  if (index === -1) throw new Error('Discount not found')
  discounts.splice(index, 1)
}

// Reviews
export async function fetchReviews(): Promise<Review[]> {
  await delay(DELAY_MEDIUM)
  return reviews
}
export async function createReview(
  review: Omit<Review, 'id' | 'created_at' | 'updated_at'>
): Promise<Review> {
  await delay(DELAY_LONG)
  const newReview = {
    ...review,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  reviews.push(newReview)
  return newReview
}
export async function updateReview(
  id: string,
  updates: Partial<Review>
): Promise<Review> {
  await delay(DELAY_LONG)
  const review = reviews.find((r) => r.id === id)
  if (!review) throw new Error('Review not found')
  updates.updated_at = new Date().toISOString()
  Object.assign(review, updates)
  return review
}

export async function deleteReview(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = reviews.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Review not found')
  reviews.splice(index, 1)
}

// Favorites
export async function fetchFavorites(): Promise<FavoriteProduct[]> {
  await delay(DELAY_MEDIUM)
  return favorite_products
}

export async function createFavorite(
  favorite: Omit<FavoriteProduct, 'id'>
): Promise<FavoriteProduct> {
  await delay(DELAY_LONG)
  const newFavorite = { ...favorite, id: uuidv4() }
  favorite_products.push(newFavorite)
  return newFavorite
}

export async function deleteFavorite(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = favorite_products.findIndex((f) => f.id === id)
  if (index === -1) throw new Error('Favorite not found')
  favorite_products.splice(index, 1)
}

// Settings API
export const settings = {
  general: {
    siteName: 'My Perfume Store',
    siteUrl: 'https://myperfumestore.com',
    adminEmail: 'admin@myperfumestore.com'
  },
  emailTemplates: {
    welcome: 'Welcome to our store, {{name}}!',
    orderConfirmation: 'Your order #{{order_code}} has been confirmed.', // Sửa thành order_code
    passwordReset: 'Click here to reset your password: {{resetLink}}'
  }
}
export async function fetchSettings(): Promise<typeof settings> {
  await delay(DELAY_MEDIUM)
  return settings
}

export async function updateSettings(
  updates: Partial<typeof settings>
): Promise<typeof settings> {
  await delay(DELAY_LONG)
  Object.assign(settings, updates)
  return settings
}

// Orders in Date Range
export async function fetchOrdersInDateRange(
  startDate: Date,
  endDate: Date
): Promise<Order[]> {
  await delay(DELAY_MEDIUM)
  return orders.filter((order) => {
    const orderDate = new Date(order.created_at)
    return orderDate >= startDate && orderDate <= endDate
  })
}

// Discount Products (nếu bạn muốn)
export async function fetchDiscountProducts(): Promise<DiscountProduct[]> {
  await delay(DELAY_MEDIUM)
  return discount_products
}
export async function createDiscountProduct(
  discountProduct: Omit<DiscountProduct, 'id'>
): Promise<DiscountProduct> {
  await delay(DELAY_LONG)
  const newDiscountProduct = { ...discountProduct, id: uuidv4() }
  discount_products.push(newDiscountProduct)
  return newDiscountProduct
}

export async function updateDiscountProduct(
  id: string,
  updates: Partial<DiscountProduct>
): Promise<DiscountProduct> {
  await delay(DELAY_LONG)
  const discountProduct = discount_products.find((dp) => dp.id === id)
  if (!discountProduct) throw new Error('Discount product not found')
  Object.assign(discountProduct, updates)
  return discountProduct
}

export async function deleteDiscountProduct(id: string): Promise<void> {
  await delay(DELAY_MEDIUM)
  const index = discount_products.findIndex((dp) => dp.id === id)
  if (index === -1) throw new Error('Discount product not found')
  discount_products.splice(index, 1)
}
