import type {
  ArticleService,
  Article,
  ArticleCategory,
  ArticleListParams,
  ArticleListResponse,
  Author,
  ArticleComment,
} from "../types/articleTypes"

// Update mock data to match the screenshot
const mockCategories: ArticleCategory[] = [
  {
    id: "cat-1",
    name: "Truyền Thông",
    slug: "truyen-thong",
    description: "Tin tức và thông báo chính thức từ Elena Pharmacy",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "cat-2",
    name: "Góc Sức Khỏe",
    slug: "goc-suc-khoe",
    description: "Thông tin và kiến thức về sức khỏe",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "cat-3",
    name: "Dinh dưỡng",
    slug: "dinh-duong",
    description: "Thông tin về dinh dưỡng và chế độ ăn uống lành mạnh",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "cat-4",
    name: "Phòng chữa bệnh",
    slug: "phong-chua-benh",
    description: "Hướng dẫn phòng và chữa các loại bệnh thường gặp",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "cat-5",
    name: "Sức khỏe trẻ em",
    slug: "suc-khoe-tre-em",
    description: "Thông tin về sức khỏe và phát triển của trẻ em",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "cat-6",
    name: "Sức khỏe người cao tuổi",
    slug: "suc-khoe-nguoi-cao-tuoi",
    description: "Hướng dẫn chăm sóc sức khỏe cho người cao tuổi",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "cat-7",
    name: "Mẹ và bé",
    slug: "me-va-be",
    description: "Thông tin về thai kỳ và chăm sóc trẻ sơ sinh",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
  {
    id: "cat-8",
    name: "Sống khỏe",
    slug: "song-khoe",
    description: "Lối sống lành mạnh và cân bằng",
    thumbnailUrl: "/placeholder.svg?height=100&width=200",
  },
]

const mockAuthors: Author[] = [
  {
    id: "author-1",
    name: "Nguyễn Văn A",
    slug: "nguyen-van-a",
    avatarUrl: "/placeholder.svg?height=80&width=80",
    bio: "Biên tập viên",
    experience: "Hơn 5 năm kinh nghiệm trong lĩnh vực quản lý nội dung số",
    verified: true,
    role: "Biên tập viên",
  },
  {
    id: "author-2",
    name: "Trần Thị B",
    slug: "tran-thi-b",
    avatarUrl: "/placeholder.svg?height=80&width=80",
    bio: "Chuyên gia dinh dưỡng",
    experience: "10 năm kinh nghiệm tư vấn dinh dưỡng",
    verified: true,
    role: "Chuyên gia",
  },
  {
    id: "author-3",
    name: "Phạm Văn C",
    slug: "pham-van-c",
    avatarUrl: "/placeholder.svg?height=80&width=80",
    bio: "Bác sĩ nhi khoa",
    experience: "7 năm kinh nghiệm khám và điều trị bệnh cho trẻ em",
    verified: true,
    role: "Bác sĩ",
  },
]

// Add this to the mockArticles array to ensure we have better content for the article
const mockArticles: Article[] = [
  {
    id: "article-1",
    title: "Elena hợp tác chiến lược OMRON Healthcare cung cấp chuỗi thiết bị y tế thế hệ mới hàng đầu Việt Nam",
    slug: "elena-hop-tac-chien-luoc-omron-healthcare",
    excerpt:
      "Ngày 13/6 vừa qua, Elena ký kết hợp tác với OMRON Healthcare cùng mang sản phẩm theo dõi huyết áp thế hệ mới đến với người tiêu dùng gần như đồng thời với các quốc gia tiên tiến trên thế giới. Đây là một sự kiện gây chú ý với ngành dược",
    content: `<p>Sự hợp tác chiến lược giữa VNH và thương hiệu về thiết bị y tế toàn cầu OMRON Healthcare nhằm hướng đến nâng tầm chất lượng chăm sóc y tế tại Việt Nam bằng sự kết hợp giữa phát triển chuỗi các thiết bị y tế thế hệ mới giúp theo dõi đánh giá sức khỏe đồng phòng bệnh và việc nâng cao nhận thức cộng đồng về bảo vệ sức khỏe toàn diện.</p>
    <p>Sự hợp tác chiến lược giữa VNH và thương hiệu về thiết bị y tế toàn cầu OMRON Healthcare nhằm hướng đến nâng tầm chất lượng chăm sóc y tế tại Việt Nam bằng sự kết hợp giữa phát triển chuỗi các thiết bị y tế thế hệ mới giúp theo dõi đánh giá sức khỏe đồng phòng bệnh và việc nâng cao nhận thức cộng đồng về bảo vệ sức khỏe toàn diện.</p>
    <p>Sự hợp tác chiến lược giữa VNH và thương hiệu về thiết bị y tế toàn cầu OMRON Healthcare nhằm hướng đến nâng tầm chất lượng chăm sóc y tế tại Việt Nam bằng sự kết hợp giữa phát triển chuỗi các thiết bị y tế thế hệ mới giúp theo dõi đánh giá sức khỏe đồng phòng bệnh và việc nâng cao nhận thức cộng đồng về bảo vệ sức khỏe toàn diện.</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    categories: [mockCategories[0]],
    tags: ["hợp tác chiến lược", "OMRON", "thiết bị y tế", "Elena", "tiêm vắc xin"],
    author: {
      id: "author-1",
      name: "Nguyễn Văn A",
      slug: "nguyen-van-a",
      avatarUrl: "/placeholder.svg?height=80&width=80",
      bio: "Biên tập viên",
      experience: "Hơn 5 năm kinh nghiệm trong lĩnh vực quản lý nội dung số",
      verified: true,
      role: "Biên tập viên",
    },
    publishedAt: "2025-03-08T08:00:00Z",
    updatedAt: "2025-03-08T10:30:00Z",
    readingTime: 5,
    viewCount: 1250,
    featured: true,
    size: "medium",
    socialShares: 156,
    verified: true,
    source: "Elena Pharmacy",
  },
  {
    id: "article-2",
    title: "Elena Pharmacy ra mắt dịch vụ tư vấn sức khỏe trực tuyến 24/7",
    slug: "elena-pharmacy-ra-mat-dich-vu-tu-van-suc-khoe-truc-tuyen-24-7",
    excerpt:
      "Elena Pharmacy chính thức triển khai dịch vụ tư vấn sức khỏe trực tuyến 24/7, mang đến sự tiện lợi và hỗ trợ kịp thời cho khách hàng mọi lúc, mọi nơi.",
    content: `<p>Với đội ngũ dược sĩ và chuyên gia y tế giàu kinh nghiệm, Elena Pharmacy cam kết cung cấp dịch vụ tư vấn chất lượng cao, đáp ứng mọi nhu cầu về sức khỏe của khách hàng.</p>
    <p>Khách hàng có thể dễ dàng kết nối với chuyên gia thông qua ứng dụng di động hoặc website của Elena Pharmacy, hoàn toàn miễn phí.</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    categories: [mockCategories[0]],
    tags: ["tư vấn sức khỏe", "dịch vụ trực tuyến", "Elena Pharmacy"],
    author: mockAuthors[1],
    publishedAt: "2025-03-05T14:00:00Z",
    updatedAt: "2025-03-06T09:45:00Z",
    readingTime: 4,
    viewCount: 890,
    featured: true,
    size: "small",
    socialShares: 92,
    verified: true,
    source: "Elena Pharmacy",
  },
  {
    id: "article-3",
    title: "5 lời khuyên giúp bạn tăng cường sức đề kháng trong mùa dịch",
    slug: "5-loi-khuyen-giup-ban-tang-cuong-suc-de-khang-trong-mua-dich",
    excerpt:
      "Những lời khuyên đơn giản nhưng hiệu quả giúp bạn tăng cường hệ miễn dịch và phòng ngừa bệnh tật trong mùa dịch bệnh.",
    content: `<p>Để tăng cường sức đề kháng, bạn nên chú ý đến chế độ dinh dưỡng, tập luyện thể thao, ngủ đủ giấc, giữ tinh thần thoải mái và tuân thủ các biện pháp phòng dịch.</p>
    <p>Bổ sung vitamin C, D, kẽm và các chất chống oxy hóa cũng rất quan trọng để hỗ trợ hệ miễn dịch hoạt động tốt hơn.</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    categories: [mockCategories[1], mockCategories[2]],
    tags: ["sức đề kháng", "hệ miễn dịch", "phòng bệnh", "dinh dưỡng"],
    author: mockAuthors[2],
    publishedAt: "2025-03-01T10:30:00Z",
    updatedAt: "2025-03-02T16:20:00Z",
    readingTime: 6,
    viewCount: 1420,
    featured: false,
    size: "medium",
    socialShares: 115,
    verified: true,
    source: "Elena Pharmacy",
  },
  {
    id: "article-4",
    title: "Elena Pharmacy khai trương chi nhánh mới tại TP.HCM",
    slug: "elena-pharmacy-khai-truong-chi-nhanh-moi-tai-tp-hcm",
    excerpt:
      "Elena Pharmacy tiếp tục mở rộng mạng lưới với việc khai trương chi nhánh mới tại TP.HCM, mang đến dịch vụ chăm sóc sức khỏe chất lượng cao cho người dân thành phố.",
    content: `<p>Chi nhánh mới của Elena Pharmacy được trang bị đầy đủ các loại thuốc, thực phẩm chức năng và thiết bị y tế, cùng với đội ngũ dược sĩ tận tâm và chuyên nghiệp.</p>
    <p>Nhân dịp khai trương, Elena Pharmacy có nhiều chương trình khuyến mãi hấp dẫn dành cho khách hàng.</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    categories: [mockCategories[0]],
    tags: ["khai trương", "chi nhánh mới", "Elena Pharmacy", "TP.HCM"],
    author: mockAuthors[0],
    publishedAt: "2025-02-25T09:00:00Z",
    updatedAt: "2025-02-26T11:15:00Z",
    readingTime: 3,
    viewCount: 760,
    featured: false,
    size: "small",
    socialShares: 68,
    verified: true,
    source: "Elena Pharmacy",
  },
  {
    id: "article-5",
    title: "Elena Pharmacy đồng hành cùng chương trình 'Sức khỏe cho mọi nhà'",
    slug: "elena-pharmacy-dong-hanh-cung-chuong-trinh-suc-khoe-cho-moi-nha",
    excerpt:
      "Elena Pharmacy tham gia chương trình 'Sức khỏe cho mọi nhà' nhằm nâng cao nhận thức về sức khỏe cộng đồng và cung cấp các dịch vụ y tế miễn phí cho người dân có hoàn cảnh khó khăn.",
    content: `<p>Elena Pharmacy cam kết đóng góp vào sự phát triển của cộng đồng thông qua các hoạt động xã hội và chương trình chăm sóc sức khỏe ý nghĩa.</p>
    <p>Chương trình 'Sức khỏe cho mọi nhà' sẽ được triển khai tại nhiều tỉnh thành trên cả nước, mang đến cơ hội tiếp cận dịch vụ y tế chất lượng cao cho mọi người.</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    categories: [mockCategories[0]],
    tags: ["chương trình", "sức khỏe cộng đồng", "Elena Pharmacy", "từ thiện"],
    author: mockAuthors[1],
    publishedAt: "2025-02-20T15:45:00Z",
    updatedAt: "2025-02-21T10:00:00Z",
    readingTime: 5,
    viewCount: 910,
    featured: true,
    size: "medium",
    socialShares: 81,
    verified: true,
    source: "Elena Pharmacy",
  },
  {
    id: "article-6",
    title: "Elena Pharmacy nhận giải thưởng 'Thương hiệu chăm sóc sức khỏe uy tín năm 2024'",
    slug: "elena-pharmacy-nhan-giai-thuong-thuong-hieu-cham-soc-suc-khoe-uy-tin-nam-2024",
    excerpt:
      "Elena Pharmacy vinh dự nhận giải thưởng 'Thương hiệu chăm sóc sức khỏe uy tín năm 2024', khẳng định vị thế và chất lượng dịch vụ hàng đầu trong ngành dược phẩm.",
    content: `<p>Giải thưởng là sự ghi nhận cho những nỗ lực không ngừng của Elena Pharmacy trong việc mang đến các sản phẩm và dịch vụ chăm sóc sức khỏe tốt nhất cho khách hàng.</p>
    <p>Elena Pharmacy cam kết tiếp tục đổi mới và phát triển để đáp ứng mọi nhu cầu về sức khỏe của cộng đồng.</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600",
    categories: [mockCategories[0]],
    tags: ["giải thưởng", "thương hiệu uy tín", "Elena Pharmacy", "chăm sóc sức khỏe"],
    author: mockAuthors[0],
    publishedAt: "2025-02-15T11:30:00Z",
    updatedAt: "2025-02-16T14:45:00Z",
    readingTime: 4,
    viewCount: 1050,
    featured: true,
    size: "small",
    socialShares: 102,
    verified: true,
    source: "Elena Pharmacy",
  },
  {
    id: "article-vaccination",
    title:
      "Chính thức: Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em và đánh giá an toàn tiêm chủng cho toàn dân",
    slug: "tiem-chung-elela-thong-tin-ket-qua-kiem-tra",
    excerpt:
      "Elela công bố kết quả kiểm tra và đánh giá an toàn trong chương trình tiêm chủng toàn dân, đặc biệt là đối với trẻ em.",
    content: `<p>Elela vừa công bố kết quả kiểm tra và đánh giá an toàn trong chương trình tiêm chủng toàn dân...</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600", // Replace with actual image
    categories: [
      {
        id: "cat-news",
        name: "Truyền Thông",
        slug: "truyen-thong",
      },
    ],
    tags: ["tiêm chủng", "an toàn", "trẻ em", "y tế"],
    author: {
      id: "author-1",
      name: "Nguyễn Văn A",
      slug: "nguyen-van-a",
      avatarUrl: "/placeholder.svg?height=80&width=80",
      bio: "Biên tập viên",
      experience: "Hơn 5 năm kinh nghiệm trong lĩnh vực quản lý nội dung số",
      verified: true,
      role: "Biên tập viên",
    },
    publishedAt: "2024-03-09T08:00:00Z",
    readingTime: 5,
    viewCount: 1250,
    featured: true,
    size: "medium",
    socialShares: 156,
    verified: true,
    source: "Elena Pharmacy",
  },
  // Add more similar articles for the related section
  {
    id: "article-vaccination-2",
    title:
      "Chính thức: Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em và đánh giá an toàn tiêm chủng cho toàn dân",
    slug: "tiem-chung-elela-thong-tin-ket-qua-kiem-tra-2",
    excerpt:
      "Elela công bố kết quả kiểm tra và đánh giá an toàn trong chương trình tiêm chủng toàn dân, đặc biệt là đối với trẻ em.",
    content: `<p>Elela vừa công bố kết quả kiểm tra và đánh giá an toàn trong chương trình tiêm chủng toàn dân...</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600", // Replace with actual image
    categories: [
      {
        id: "cat-news",
        name: "Truyền Thông",
        slug: "truyen-thong",
      },
    ],
    tags: ["tiêm chủng", "an toàn", "trẻ em", "y tế"],
    author: {
      id: "author-1",
      name: "Nguyễn Văn A",
      slug: "nguyen-van-a",
      avatarUrl: "/placeholder.svg?height=80&width=80",
      bio: "Biên tập viên",
      experience: "Hơn 5 năm kinh nghiệm trong lĩnh vực quản lý nội dung số",
      verified: true,
      role: "Biên tập viên",
    },
    publishedAt: "2024-03-09T08:00:00Z",
    readingTime: 5,
    viewCount: 1250,
    featured: true,
    size: "medium",
    socialShares: 156,
    verified: true,
    source: "Elena Pharmacy",
  },
  {
    id: "article-vaccination-3",
    title:
      "Chính thức: Tiêm chủng Elela thông tin về kết quả kiểm tra của trẻ em và đánh giá an toàn tiêm chủng cho toàn dân",
    slug: "tiem-chung-elela-thong-tin-ket-qua-kiem-tra-3",
    excerpt:
      "Elela công bố kết quả kiểm tra và đánh giá an toàn trong chương trình tiêm chủng toàn dân, đặc biệt là đối với trẻ em.",
    content: `<p>Elela vừa công bố kết quả kiểm tra và đánh giá an toàn trong chương trình tiêm chủng toàn dân...</p>`,
    thumbnailUrl: "/placeholder.svg?height=400&width=600", // Replace with actual image
    categories: [
      {
        id: "cat-news",
        name: "Truyền Thông",
        slug: "truyen-thong",
      },
    ],
    tags: ["tiêm chủng", "an toàn", "trẻ em", "y tế"],
    author: {
      id: "author-1",
      name: "Nguyễn Văn A",
      slug: "nguyen-van-a",
      avatarUrl: "/placeholder.svg?height=80&width=80",
      bio: "Biên tập viên",
      experience: "Hơn 5 năm kinh nghiệm trong lĩnh vực quản lý nội dung số",
      verified: true,
      role: "Biên tập viên",
    },
    publishedAt: "2024-03-09T08:00:00Z",
    readingTime: 5,
    viewCount: 1250,
    featured: true,
    size: "medium",
    socialShares: 156,
    verified: true,
    source: "Elena Pharmacy",
  },
]

// Update the mock service implementation with the new data
export class ArticleMockService implements ArticleService {
  async getArticles(params?: ArticleListParams): Promise<ArticleListResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredArticles = [...mockArticles]

    // Filter by category if provided
    if (params?.categorySlug) {
      filteredArticles = filteredArticles.filter((article) =>
        article.categories.some((category) => category.slug === params.categorySlug),
      )
    }

    // Filter by search term if provided
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredArticles = filteredArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower),
      )
    }

    // Filter by featured if provided
    if (params?.featured !== undefined) {
      filteredArticles = filteredArticles.filter((article) => article.featured === params.featured)
    }

    // Sort articles if sort param provided
    if (params?.sort) {
      switch (params.sort) {
        case "latest":
          filteredArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          break
        case "oldest":
          filteredArticles.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
          break
        case "popular":
          filteredArticles.sort((a, b) => b.viewCount - a.viewCount)
          break
      }
    } else {
      // Default sort by latest
      filteredArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    }

    // Pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

    return {
      articles: paginatedArticles,
      total: filteredArticles.length,
      page,
      limit,
      totalPages: Math.ceil(filteredArticles.length / limit),
    }
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const article = mockArticles.find((article) => article.slug === slug)

    if (!article) {
      throw new Error(`Article with slug "${slug}" not found`)
    }

    return article
  }

  async getArticleCategories(): Promise<ArticleCategory[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockCategories
  }

  async getRelatedArticles(articleSlug: string, limit = 3): Promise<Article[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const article = mockArticles.find((article) => article.slug === articleSlug)

    if (!article) {
      return []
    }

    // Find articles in the same categories
    const relatedArticles = mockArticles
      .filter((a) => a.id !== article.id && a.categories.some((c1) => article.categories.some((c2) => c1.id === c2.id)))
      .sort((a, b) => b.viewCount - a.viewCount) // Sort by popularity
      .slice(0, limit)

    return relatedArticles
  }

  async getFeaturedArticles(limit = 5): Promise<Article[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return mockArticles
      .filter((article) => article.featured)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit)
  }

  async getPopularArticles(limit = 5): Promise<Article[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return mockArticles.sort((a, b) => b.viewCount - a.viewCount).slice(0, limit)
  }

  async getArticleComments(articleId: string): Promise<ArticleComment[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [] // Empty array for now, can add mock comments later
  }

  async addArticleComment(
    articleId: string,
    comment: Omit<ArticleComment, "id" | "createdAt">,
  ): Promise<ArticleComment> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      id: `comment-${Date.now()}`,
      articleId,
      ...comment,
      createdAt: new Date().toISOString(),
      likes: 0,
      verified: false,
    }
  }

  async likeArticle(articleId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // In a real implementation, this would update the article's like count
  }

  async shareArticle(articleId: string, platform: "facebook" | "twitter" | "linkedin"): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // In a real implementation, this would update the article's share count
  }
}

// Export a singleton instance
export const articleMockService = new ArticleMockService()

