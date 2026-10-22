const fs = require('fs');

let s = " Chào mọi người, đây là trước 3Los 6 mà mình muốn giới thiệu. Hoa kéo này rất tiện lợi và phần định vai thì cực kỳ M.A. Khi đau.";

console.log("Original text from Whisper:", s);

s = s.replace(/(?<![\p{L}\p{N}])cả\s+nhà(?![\p{L}\p{N}])/giu, '__CA_NHA__');
const rep = (pat, repl) => {
  const re = new RegExp("(?<![\\p{L}\\p{N}])" + pat + "(?![\\p{L}\\p{N}])", "giu");
  s = s.replace(re, repl);
};

// 1. Lời chào & mở đầu
rep("(?:trong|chong|choang|cho|chúng)\\s+mình\\s+các\\s+bạn", "Chào mừng các bạn");
rep("(?:trong|chong|choang|cho|chúng)\\s+mình\\s+mọi\\s+người", "Chào mừng mọi người");
rep("xin\\s+chào\\s+các\\s+bạn\\s+đã\\s+quay\\s+trở\\s+lại", "Chào mừng các bạn đã quay trở lại");

// 2. Chủ ngữ & danh từ sản phẩm
rep("chia\\s+sẻ\\s+này", "chiếc xe này");
rep("chia\\s+sẻ(?=\\s+(?:này|đạp|chạy|đi|có|rất|được))", "chiếc xe");
rep("3\\s*lo|bà\\s*lôn|ba\\s*lo|balon|ban\\s+lo|ban\\s*lo", "balo");
rep("xem\\s+trước\\s+([0-9a-zà-ỹ]+)\\s+mới", "xem chiếc $1 mới");
rep("(?:xem|review|riview)\\s+trước\\s+([0-9a-zà-ỹ]+)", "review chiếc $1");
rep("xem\\s+trước", "xem chiếc");
rep("riview|reviu", "review");
rep("chứt\\s+kế|chức\\s+kế|chất\\s+kế", "thiết kế");
rep("khung\\s+sửa|khung\\s+sữa|khung\\s+sưa", "khung sườn");
rep("các\\s+bòn|các\\s+bon|cacbon|khung\\s+các\\s+bòn", "carbon");
rep("siêu\\s+bên", "siêu bền");
rep("mưỡi|mỡi", "mới");
rep("rút\\s+đổi\\s+trạy|rút\\s+đổi\\s+chạy", "tốc độ chạy");
rep("rút\\s+đổi", "tốc độ");
rep("trạy", "chạy");
rep("chất\\s+vài|chất\\s+liệu\\s+vài", "chất liệu vải");
rep("chúng\\s+nước|xíu\\s+trống\\s+nước|trống\\s+nước", "chống nước");
rep("xíu(?=\\s+(?:chống|đẹp|nhẹ|bền|nhanh|mượt|êm))", "siêu");
rep("đ[eé]o\\s+thử", "đeo thử");
rep("đ[eé]o(?=\\s+(?:thử|lên|vào|chiếc|balo|tai|vai))", "đeo");
rep("(?:lên|trên)\\s+vài", "lên vai");
rep("em\\s+ai|em\\s+ài", "êm ái");
rep("ưu\\s+đại|u\\s+đại", "ưu đãi");
rep("linh\\s+mua\\s+hàng", "link mua hàng");
rep("linh\\s+bên\\s+dưới", "link bên dưới");
rep("dộng\\s+giải|rộng\\s+giải", "rộng rãi");
rep("nhân\\s+viên\\s+vài", "nhân vật");
rep("tai\\s+nghé", "tai nghe");
rep("điện\\s+thoai", "điện thoại");
rep("xe\\s+đập", "xe đạp");
rep("kết\\s+l\\s*nối", "kết nối");
rep("bảo\\s+hanh", "bảo hành");
rep("khuyên\\s+mãi|khuyễn\\s+mãi", "khuyến mãi");
rep("chính\\s+hang", "chính hãng");

// 3. Lời kết
rep("nhớ\\s+bấm\\s+follow\\s+mình\\s+nhá", "nhớ bấm follow mình nhé");
rep("nhớ\\s+follow\\s+kênh\\s+để\\s+xem\\s+thêm\\s+nhá", "nhớ follow kênh để xem thêm nhé");
rep("đăng\\s+kí", "đăng ký");
rep("nhá(?=[,.!?]|$)", "nhé");
rep("nhà(?=[,.!?]|$)", "nha");

s = s.replace(/__CA_NHA__/g, "cả nhà");
s = s.replace(/\s+/g, " ").trim();
s = s.replace(/([.?!])\s*(\p{L})/gu, (_, p1, p2) => p1 + " " + p2.toUpperCase());
if (s.length > 0) {
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?]$/.test(s)) s += ".";
}

console.log("Processed text:", s);
