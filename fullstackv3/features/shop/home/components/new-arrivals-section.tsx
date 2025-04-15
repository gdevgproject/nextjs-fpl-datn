["products", "new-arrivals"],
"products",
{
  columns: `
id, 
name, 
slug, 
brands!inner(name),
genders(name),
concentrations(name),
perfume_types(name),
product_variants!inner(
id, 
price, 
sale_price,
stock_quantity
),
product_images(
image_url,
is_main
)
`,


filters: (query) => {
  // Sử dụng is thay vì eq để xử lý giá trị null đúng cách
  return query
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
},
pagination: { page: 1, pageSize: 8 },
},