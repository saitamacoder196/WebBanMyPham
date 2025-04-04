
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopping_cart.db');


const products = [
  {
    name: "Urban Sleek",
    price: 499000,
    original_price: null,
    image: "img/balodulich1.jpg",
    category: "travel-backpack",
    description: "Balo du lịch phong cách đô thị hiện đại",
    is_new: 1,
    discount_percent: 0
  },
  {
    name: "Active Flex",
    price: 499000,
    original_price: 669000,
    image: "img/balodulich2.jpg",
    category: "travel-backpack",
    description: "Balo thể thao đa năng, linh hoạt",
    is_new: 1,
    discount_percent: 25
  },
  {
    name: "Elegance Pack",
    price: 559000,
    original_price: 699000,
    image: "img/balodulich3.jpg",
    category: "travel-backpack",
    description: "Balo thanh lịch, phù hợp mọi dịp",
    is_new: 1,
    discount_percent: 20
  },
  {
    name: "Voyager Max",
    price: 28000,
    original_price: 299000,
    image: "img/balodulich4.jpg",
    category: "travel-backpack",
    description: "Balo du lịch tối đa tiện ích",
    is_new: 1,
    discount_percent: 91
  },
  {
    name: "Youth Vibe",
    price: 679000,
    original_price: 749000,
    image: "img/balodulich5.jpg",
    category: "travel-backpack",
    description: "Balo trẻ trung, năng động",
    is_new: 1,
    discount_percent: 9
  },
  {
    name: "Enduro Shield",
    price: 743000,
    original_price: 929000,
    image: "img/balodulich6.jpg",
    category: "travel-backpack",
    description: "Balo bền bỉ, chống chịu tốt",
    is_new: 1,
    discount_percent: 20
  },
  {
    name: "Classic Charm",
    price: 329000,
    original_price: 399000,
    image: "img/balodulich7.jpg",
    category: "travel-backpack",
    description: "Balo cổ điển, quyến rũ",
    is_new: 1,
    discount_percent: 18
  },
  {
    name: "Tech Pioneer",
    price: 399000,
    original_price: 499000,
    image: "img/balodulich8.jpg",
    category: "travel-backpack",
    description: "Balo công nghệ tiên phong",
    is_new: 1,
    discount_percent: 20
  },
  {
    name: "BB FOCALLURE",
    price: 521000,
    original_price: null,
    image: "img/sp1.webp",
    category: "makeup",
    description: "Kem nền BB Focallure chất lượng cao",
    is_new: 1,
    discount_percent: 0
  },
  {
    name: "EGLIPS BARBIE LIMITED EDITION",
    price: 160000,
    original_price: 299000,
    image: "img/sp2.webp",
    category: "makeup",
    description: "Phấn má phiên bản giới hạn Barbie",
    is_new: 1,
    discount_percent: 46
  },
  {
    name: "MAYBELLINE NEW YORK FIT ME",
    price: 238000,
    original_price: 399000,
    image: "img/sp3.webp",
    category: "makeup",
    description: "Kem nền Maybelline Fit Me",
    is_new: 1,
    discount_percent: 40
  },
  {
    name: "KEM NỀN DẠNG LỎNG CARSLAN",
    price: 179000,
    original_price: 350000,
    image: "img/sp4.webp",
    category: "makeup",
    description: "Kem nền dạng lỏng Carslan",
    is_new: 1,
    discount_percent: 49
  },
  {
    name: "PHẤN PHỦ TRANG ĐIỂM MINIMELI",
    price: 360000,
    original_price: null,
    image: "img/sp5.webp",
    category: "makeup",
    description: "Phấn phủ trang điểm Minimeli",
    is_new: 1,
    discount_percent: 0
  },
  {
    name: "PHẤN PHỦ ZEESEA",
    price: 743000,
    original_price: 929000,
    image: "img/sp6.webp",
    category: "makeup",
    description: "Phấn phủ Zeesea cao cấp",
    is_new: 1,
    discount_percent: 20
  },
  {
    name: "PHẤN PHỦ DẠNG NÉN QIBEST",
    price: 175000,
    original_price: 299000,
    image: "img/sp7.webp",
    category: "makeup",
    description: "Phấn phủ dạng nén Qibest",
    is_new: 1,
    discount_percent: 41
  },
  {
    name: "SANIYE K2021",
    price: 275000,
    original_price: 300000,
    image: "img/sp8.webp",
    category: "makeup",
    description: "Sản phẩm trang điểm Saniye K2021",
    is_new: 1,
    discount_percent: 8
  },
  {
    name: "TINH CHẤT THE ORDINARY",
    price: 447000,
    original_price: 500000,
    image: "img/t3 sp1.webp",
    category: "skincare",
    description: "Tinh chất dưỡng da The Ordinary",
    is_new: 0,
    discount_percent: 11
  },
  {
    name: "Toner dành cho da dầu DermaDS 180ml",
    price: 499000,
    original_price: 669000,
    image: "img/nuoccanbang.jpg",
    category: "skincare",
    description: "Nước cân bằng cho da dầu DermaDS",
    is_new: 0,
    discount_percent: 25
  },
  {
    name: "Essance Britening Foam Cleanser SPF50+ PA+++",
    price: 375000,
    original_price: 800000,
    image: "img/t3 sp8.webp",
    category: "skincare",
    description: "Sữa rửa mặt làm sáng da SPF50+",
    is_new: 0,
    discount_percent: 53
  },
  {
    name: "Son Dưỡng Có Màu Glow Tint Lip Balm 3.5g",
    price: 180000,
    original_price: 950000,
    image: "img/t3sp9.webp",
    category: "skincare",
    description: "Son dưỡng có màu Glow Tint",
    is_new: 0,
    discount_percent: 81
  },
  {
    name: "BỘ SẢN PHẨM CHĂM SÓC DA NHẠY CẢM VÀ DA KHÔ",
    price: 590000,
    original_price: 690000,
    image: "img/t3 sp4.webp",
    category: "skincare",
    description: "Bộ chăm sóc da nhạy cảm và khô",
    is_new: 0,
    discount_percent: 14
  },
  {
    name: "BỘ SẢN PHẨM CHĂM SÓC DA THƯỜNG VÀ DA HỖN HỢP",
    price: 600000,
    original_price: 1000000,
    image: "img/t3 sp5.webp",
    category: "skincare",
    description: "Bộ chăm sóc da thường và hỗn hợp",
    is_new: 0,
    discount_percent: 40
  },
  {
    name: "Kem Dưỡng Da Mặt Trẻ Hóa Da Image The MAX Stem Cell Crème",
    price: 3220000,
    original_price: 3705000,
    image: "img/t3 sp6.webp",
    category: "skincare",
    description: "Kem dưỡng trẻ hóa da Image",
    is_new: 0,
    discount_percent: 13
  },
  {
    name: "SỮA RỬA MẶT NGĂN NGỪA LÃO HÓA NARIS URUOI",
    price: 320000,
    original_price: 400000,
    image: "img/t3 sp7.webp",
    category: "skincare",
    description: "Sữa rửa mặt chống lão hóa Naris",
    is_new: 0,
    discount_percent: 20
  },
  {
    name: "Tomtoc Versatile Women's Handbag",
    price: 75000,
    original_price: 130000,
    image: "img/b7 (1).jpg",
    category: "women-handbag",
    description: "Túi xách nữ đa năng Tomtoc",
    is_new: 1,
    discount_percent: 42
  },
  {
    name: "Tomtoc Versatile Women's Handbag",
    price: 59000,
    original_price: 70000,
    image: "img/b8.jpg",
    category: "women-handbag",
    description: "Túi xách nữ đa năng Tomtoc",
    is_new: 1,
    discount_percent: 16
  }
];

db.run('DELETE FROM products', function (err) {
  if (err) {
    console.error('Error deleting old products:', err.message);
    return;
  }

  console.log('Old products deleted');

  const stmt = db.prepare(`
    INSERT INTO products (name, price, original_price, image, category, description, is_new, discount_percent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  products.forEach((product) => {
    stmt.run(
      product.name,
      product.price,
      product.original_price || null,
      product.image,
      product.category,
      product.description || null,
      product.is_new || 1,
      product.discount_percent || null
    );
  });

  stmt.finalize();

  console.log('Products seeded successfully');


  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      return;
    }

    console.log(`${rows.length} products in database`);
    db.close();
  });
});