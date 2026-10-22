const fs = require('fs');
const path = require('path');

const orig1 = JSON.parse(fs.readFileSync('scripts/original_cmtv9z12500qznx01eyewy9i2.json', 'utf-8'));
const orig2 = JSON.parse(fs.readFileSync('scripts/original_cmtcbvpbp000gms01hcoqwwug.json', 'utf-8'));

const groups = [
  {
    id: "grp-fashion",
    name: "Thời Trang & Lookbook AI",
    slug: "thoi-trang-lookbook",
    description: "Workflow tự động hóa biến hình và chụp lookbook thời trang cho người mẫu.",
    sortOrder: 10
  },
  {
    id: "grp-affiliate",
    name: "Affiliate & Bán Hàng Tự Động",
    slug: "affiliate-ban-hang",
    description: "Quy trình sản xuất video ngắn bán hàng và review triệu view chuẩn TikTok Shop, Reels.",
    sortOrder: 20
  }
];

const p1 = {
  ...orig1.product,
  groupId: "grp-fashion",
  pricingType: "paid",
  priceVnd: 189000,
  originalPriceVnd: 299000,
  discountPercent: 37,
  currency: "VND",
  tags: ["Premium", "Workflow", "TikTok", "Thời Trang AI", "Lookbook"],
  salesCount: 38,
  owned: false,
  installed: false
};

const p2 = {
  ...orig2.product,
  groupId: "grp-affiliate",
  pricingType: "paid",
  priceVnd: 249000,
  originalPriceVnd: 499000,
  discountPercent: 50,
  currency: "VND",
  tags: ["Premium", "Workflow", "TikTok", "Reels Viral", "Video AI", "Affiliate"],
  salesCount: 65,
  owned: false,
  installed: false
};

const definitions = {
  [p1.id]: orig1.definition,
  [p2.id]: orig2.definition
};

const finalData = {
  groups,
  products: [p1, p2],
  definitions
};

const dest = path.join(__dirname, '..', 'vercel_server', 'api', 'workflowsData.json');
fs.writeFileSync(dest, JSON.stringify(finalData, null, 2), 'utf-8');
console.log('Successfully wrote commercial workflowsData.json with 2 genuine products!');
