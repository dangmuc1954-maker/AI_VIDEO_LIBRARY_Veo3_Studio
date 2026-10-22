let s = " Chào các bạn, hôm nay mình sẽ giữ thiệu trước Balomodot tuyệt đẹp này nó có rất nhiều ngăn tiện lợi và chất liệu rất bền, mình rất thích nó";

console.log("Raw from Whisper:", s);

s = s.replace(/(?<![\p{L}\p{N}])cả\s+nhà(?![\p{L}\p{N}])/giu, '__CA_NHA__');
const rep = (pat, repl) => {
  const re = new RegExp("(?<![\\p{L}\\p{N}])" + pat + "(?![\\p{L}\\p{N}])", "giu");
  s = s.replace(re, repl);
};

// 1. Sửa ngọng phát âm thông dụng
rep("giữ\\s+thiệu|dữ\\s+thiệu|rữ\\s+thiệu", "giới thiệu");
rep("trước(?=\\s+(?:ba\\s*lo|balo|chiếc|xe|máy|điện|sản))", "chiếc");
rep("3\\s*lo|bà\\s*lôn|ba\\s*lo|balon|ban\\s+lo|ban\\s*lo|balomodot|balomod|balomo", "balo");
rep("chia\\s+sẻ\\s+này", "chiếc xe này");
rep("chia\\s+sẻ(?=\\s+(?:này|đạp|chạy|đi|có|rất|được))", "chiếc xe");
rep("riview|reviu", "review");
rep("chứt\\s+kế|chức\\s+kế|chất\\s+kế", "thiết kế");
rep("khung\\s+sửa|khung\\s+sữa|khung\\s+sưa", "khung sườn");
rep("các\\s+bòn|các\\s+bon|cacbon|khung\\s+các\\s+bòn", "carbon");
rep("siêu\\s+bên", "siêu bền");
rep("mưỡi|mỡi", "mới");
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
rep("tai\\s+nghé", "tai nghe");
rep("điện\\s+thoai", "điện thoại");
rep("xe\\s+đập", "xe đạp");
rep("kết\\s+l\\s*nối", "kết nối");
rep("bảo\\s+hanh", "bảo hành");
rep("khuyên\\s+mãi|khuyễn\\s+mãi", "khuyến mãi");
rep("chính\\s+hang", "chính hãng");
rep("nhá(?=[,.!?]|$)", "nhé");
rep("nhà(?=[,.!?]|$)", "nha");

s = s.replace(/__CA_NHA__/g, "cả nhà");
s = s.replace(/\s+/g, " ").trim();
s = s.replace(/([.?!])\s*(\p{L})/gu, (_, p1, p2) => p1 + " " + p2.toUpperCase());
if (s.length > 0) {
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?]$/.test(s)) s += ".";
}

console.log("Cleaned:", s);
