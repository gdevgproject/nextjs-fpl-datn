"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// Định nghĩa các loại dữ liệu
interface ProductImage {
  id: string
  url: string
  alt_text?: string
  is_main?: boolean
  display_order: number
}

interface ProductVariant {
  id: string
  volume_ml: number
  price: number
  sale_price?: number
  sku: string
  stock_quantity: number
}

interface ProductScent {
  id: string
  scent_id: string
  name: string
  type: "top" | "middle" | "base"
}

interface ProductIngredient {
  id: string
  ingredient_id: string
  name: string
}

interface ProductFormData {
  id?: string
  name: string
  product_code: string
  short_description: string
  long_description: string
  brand_id: string
  gender_id: string
  perfume_type_id: string
  concentration_id: string
  origin_country: string
  release_year: number | null
  style: string
  sillage: string
  longevity: string
  status: "active" | "out_of_stock" | "deleted"
  categories: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  scents: ProductScent[]
  ingredients: ProductIngredient[]
}

interface ValidationError {
  field: string
  message: string
  severity: "error" | "warning"
  tab?: string
}

interface ValidationSummary {
  errors: number
  warnings: number
  completionPercentage: number
}

interface ProductFormContextType {
  formData: ProductFormData
  updateFormData: (data: Partial<ProductFormData>) => void
  updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void
  errors: ValidationError[]
  summary: ValidationSummary
  isDirty: boolean
  isSubmitting: boolean
  lastSaved: Date | null
  resetForm: () => void
  validateForm: () => boolean
  submitForm: () => Promise<boolean>
  generateProductCode: () => void
}

// Giá trị mặc định cho form
const defaultFormData: ProductFormData = {
  name: "",
  product_code: "",
  short_description: "",
  long_description: "",
  brand_id: "",
  gender_id: "",
  perfume_type_id: "",
  concentration_id: "",
  origin_country: "",
  release_year: null,
  style: "",
  sillage: "",
  longevity: "",
  status: "active",
  categories: [],
  images: [],
  variants: [],
  scents: [],
  ingredients: [],
}

// Tạo context
const ProductFormContext = createContext<ProductFormContextType | undefined>(undefined)

// Provider component
export function ProductFormProvider({
  children,
  initialData,
}: { children: ReactNode; initialData?: Partial<ProductFormData> }) {
  const [formData, setFormData] = useState<ProductFormData>({
    ...defaultFormData,
    ...initialData,
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [summary, setSummary] = useState<ValidationSummary>({
    errors: 0,
    warnings: 0,
    completionPercentage: 0,
  })
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Cập nhật toàn bộ form data
  const updateFormData = useCallback((data: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setIsDirty(true)
  }, [])

  // Cập nhật một trường cụ thể
  const updateField = useCallback(<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }, [])

  // Reset form về giá trị ban đầu
  const resetForm = useCallback(() => {
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setIsDirty(false)
    setErrors([])
  }, [initialData])

  // Tự động tạo mã sản phẩm
  const generateProductCode = useCallback(() => {
    if (formData.name) {
      // Tạo mã từ tên sản phẩm
      const nameCode = formData.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .substring(0, 3)

      // Thêm timestamp để đảm bảo duy nhất
      const timestamp = Date.now().toString().substring(9, 13)

      // Tạo mã sản phẩm
      const productCode = `${nameCode}${timestamp}`

      updateField("product_code", productCode)
    }
  }, [formData.name, updateField])

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: ValidationError[] = []

    // Validate các trường bắt buộc
    if (!formData.name) {
      newErrors.push({
        field: "Tên sản phẩm",
        message: "Tên sản phẩm không được để trống",
        severity: "error",
        tab: "Thông tin cơ bản",
      })
    }

    if (!formData.product_code) {
      newErrors.push({
        field: "Mã sản phẩm",
        message: "Mã sản phẩm không được để trống",
        severity: "error",
        tab: "Thông tin cơ bản",
      })
    }

    if (!formData.brand_id) {
      newErrors.push({
        field: "Thương hiệu",
        message: "Vui lòng chọn thương hiệu",
        severity: "error",
        tab: "Thông tin cơ bản",
      })
    }

    if (!formData.gender_id) {
      newErrors.push({
        field: "Giới tính",
        message: "Vui lòng chọn giới tính",
        severity: "error",
        tab: "Thông tin cơ bản",
      })
    }

    if (!formData.perfume_type_id) {
      newErrors.push({
        field: "Loại nước hoa",
        message: "Vui lòng chọn loại nước hoa",
        severity: "error",
        tab: "Thông tin cơ bản",
      })
    }

    if (!formData.concentration_id) {
      newErrors.push({
        field: "Nồng độ",
        message: "Vui lòng chọn nồng độ",
        severity: "error",
        tab: "Thông tin cơ bản",
      })
    }

    // Validate mô tả
    if (!formData.short_description) {
      newErrors.push({
        field: "Mô tả ngắn",
        message: "Mô tả ngắn không được để trống",
        severity: "warning",
        tab: "Thông tin cơ bản",
      })
    }

    // Validate hình ảnh
    if (formData.images.length === 0) {
      newErrors.push({
        field: "Hình ảnh",
        message: "Vui lòng thêm ít nhất một hình ảnh",
        severity: "error",
        tab: "Hình ảnh",
      })
    } else if (!formData.images.some((img) => img.is_main)) {
      newErrors.push({
        field: "Hình ảnh chính",
        message: "Vui lòng chọn một hình ảnh chính",
        severity: "error",
        tab: "Hình ảnh",
      })
    }

    // Validate biến thể
    if (formData.variants.length === 0) {
      newErrors.push({
        field: "Biến thể",
        message: "Vui lòng thêm ít nhất một biến thể",
        severity: "error",
        tab: "Biến thể",
      })
    }

    // Validate danh mục
    if (formData.categories.length === 0) {
      newErrors.push({
        field: "Danh mục",
        message: "Vui lòng chọn ít nhất một danh mục",
        severity: "warning",
        tab: "Danh mục",
      })
    }

    // Validate hương thơm
    if (formData.scents.length === 0) {
      newErrors.push({
        field: "Hương thơm",
        message: "Nên thêm thông tin hương thơm",
        severity: "warning",
        tab: "Hương thơm",
      })
    }

    // Cập nhật errors và summary
    setErrors(newErrors)

    const errorCount = newErrors.filter((e) => e.severity === "error").length
    const warningCount = newErrors.filter((e) => e.severity === "warning").length

    // Tính toán phần trăm hoàn thành
    const requiredFields = 10 // Số trường bắt buộc
    const optionalFields = 8 // Số trường tùy chọn

    const completedRequired = requiredFields - errorCount
    const completedOptional = optionalFields - warningCount

    const completionPercentage = Math.round(
      ((completedRequired / requiredFields) * 0.7 + (completedOptional / optionalFields) * 0.3) * 100,
    )

    setSummary({
      errors: errorCount,
      warnings: warningCount,
      completionPercentage: Math.min(100, Math.max(0, completionPercentage)),
    })

    return errorCount === 0
  }, [formData])

  // Submit form
  const submitForm = useCallback(async () => {
    const isValid = validateForm()

    if (!isValid) {
      return false
    }

    setIsSubmitting(true)

    try {
      // Giả lập gửi dữ liệu lên server
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Cập nhật trạng thái
      setIsDirty(false)
      setLastSaved(new Date())

      return true
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm])

  // Tự động validate khi form thay đổi
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        validateForm()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [formData, isDirty, validateForm])

  // Tự động lưu nháp
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        // Lưu vào localStorage
        localStorage.setItem("product_form_draft", JSON.stringify(formData))
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [formData, isDirty])

  return (
    <ProductFormContext.Provider
      value={{
        formData,
        updateFormData,
        updateField,
        errors,
        summary,
        isDirty,
        isSubmitting,
        lastSaved,
        resetForm,
        validateForm,
        submitForm,
        generateProductCode,
      }}
    >
      {children}
    </ProductFormContext.Provider>
  )
}

// Hook để sử dụng context
export function useProductForm() {
  const context = useContext(ProductFormContext)

  if (context === undefined) {
    throw new Error("useProductForm must be used within a ProductFormProvider")
  }

  return context
}

