export const mockOrder = {
  id: "order_1",
  order_code: "DH123456",
  userId: "user_1",
  status: "processing",
  products: [
    {
      product: {
        id: "prod_1",
        name: "Chanel Coco Mademoiselle",
        price: 3200000,
        images: ["https://via.placeholder.com/96"],
        volume: 100,
        brand: "Chanel",
        concentration: "Eau de Parfum",
      },
      quantity: 1,
    },
    {
      product: {
        id: "prod_2",
        name: "Dior Sauvage",
        price: 2800000,
        images: ["https://via.placeholder.com/96"],
        volume: 100,
        brand: "Dior",
        concentration: "Eau de Toilette",
      },
      quantity: 2,
    },
  ],
  totalAmount: 8800000,
  created_at: "2024-03-01T08:00:00Z",
  updated_at: "2024-03-01T08:00:00Z",
};
