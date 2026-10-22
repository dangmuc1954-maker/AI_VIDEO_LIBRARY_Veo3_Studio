function cleanAndPolishVietnameseTranscript(text) {
  if (!text || typeof text !== 'string') return '';
  let s = text.trim();

  // Protect idioms like "cả nhà" from ending particle "nha"
  s = s.replace(/(?<![\p{L}\p{N}])cả\s+nhà(?![\\p{L}\\p{N}])/giu, '__CA_NHA__');

  // Helper using Unicode boundary
  const rep = (pattern, replacement) => {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, 'giu');
    s = s.replace(re, replacement);
  };

  // 1. Lời chào mở đầu (Greetings)
  rep('(?:trong|chong|choang|cho|chúng)\\s+mình\\s+các\\s+bạn', 'Chào mừng các bạn');
  rep('(?:trong|chong|choang|cho|chúng)\\s+mình\\s+mọi\\s+người', 'Chào mừng mọi người');
  rep('xin\\s+chào\\s+các\\s+bạn\\s+đã\\s+quay\\s+trở\\s+lại', 'Chào mừng các bạn đã quay trở lại');

  // 2. Chủ ngữ & Đối tượng (Subjects & Product Names)
  rep('chia\\s+sẻ\\s+này', 'chiếc xe này');
  rep('chia\\s+sẻ(?=\\s+(?:này|đạp|chạy|đi|có|rất|được))', 'chiếc xe');
  rep('3\\s*lo|bà\\s*lôn|ba\\s*lo|balon', 'balo');
  rep('xem\\s+trước\\s+([0-9a-zà-ỹ]+)\\s+mới', 'xem chiếc $1 mới');
  rep('(?:xem|review|riview)\\s+trước\\s+([0-9a-zà-ỹ]+)', 'review chiếc $1');
  rep('xem\\s+trước', 'xem chiếc');
  rep('riview|reviu', 'review');
  rep('chứt\\s+kế|chức\\s+kế|chất\\s+kế', 'thiết kế');
  rep('khung\\s+sửa|khung\\s+sữa|khung\\s+sưa', 'khung sườn');
  rep('các\\s+bòn|các\\s+bon|cacbon|khung\\s+các\\s+bòn', 'carbon');
  rep('siêu\\s+bên', 'siêu bền');
  rep('mưỡi|mỡi', 'mới');
  rep('rút\\s+đổi\\s+trạy|rút\\s+đổi\\s+chạy', 'tốc độ chạy');
  rep('rút\\s+đổi', 'tốc độ');
  rep('trạy', 'chạy');
  rep('chất\\s+vài|chất\\s+liệu\\s+vài', 'chất liệu vải');
  rep('chúng\\s+nước|xíu\\s+trống\\s+nước|trống\\s+nước', 'chống nước');
  rep('xíu(?=\\s+(?:chống|đẹp|nhẹ|bền|nhanh|mượt|êm))', 'siêu');
  rep('đ[eé]o\\s+thử', 'đeo thử');
  rep('đ[eé]o(?=\\s+(?:thử|lên|vào|chiếc|balo|tai|vai))', 'đeo');
  rep('(?:lên|trên)\\s+vài', 'lên vai');
  rep('em\\s+ai|em\\s+ài', 'êm ái');
  rep('ưu\\s+đại|u\\s+đại', 'ưu đãi');
  rep('linh\\s+mua\\s+hàng', 'link mua hàng');
  rep('linh\\s+bên\\s+dưới', 'link bên dưới');
  rep('dộng\\s+giải|rộng\\s+giải', 'rộng rãi');
  rep('nhân\\s+viên\\s+vài', 'nhân vật');
  rep('tai\\s+nghé', 'tai nghe');
  rep('điện\\s+thoai', 'điện thoại');
  rep('xe\\s+đập', 'xe đạp');
  rep('kết\\s+l\\s*nối', 'kết nối');
  rep('bảo\\s+hanh', 'bảo hành');
  rep('khuyên\\s+mãi|khuyễn\\s+mãi', 'khuyến mãi');
  rep('chính\\s+hang', 'chính hãng');

  // 3. Lời kết video & Kêu gọi hành động (Call To Action)
  rep('nhớ\\s+bấm\\s+follow\\s+mình\\s+nhá', 'nhớ bấm follow mình nhé');
  rep('nhớ\\s+follow\\s+kênh\\s+để\\s+xem\\s+thêm\\s+nhá', 'nhớ follow kênh để xem thêm nhé');
  rep('đăng\\s+kí', 'đăng ký');
  rep('nhá(?=[,.!?]|$)', 'nhé');
  rep('nhà(?=[,.!?]|$)', 'nha');

  // Restore protected idioms
  s = s.replace(/__CA_NHA__/g, 'cả nhà');

  // 4. Định dạng câu, viết hoa chữ cái đầu và sau dấu chấm
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/([.?!])\s*(\p{L})/gu, (_, p1, p2) => p1 + ' ' + p2.toUpperCase());
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.!?]$/.test(s)) {
      s += '.';
    }
  }

  return s;
}

const test1 = 'Trong mình các bạn đã quay trở lại, chia sẻ này có khung sửa rất nhẹ, trải nghiệm đạp xe cực kì mượt mà rất phù hợp cho việc tập thể thao, nhớ bấm follow mình nhá.';
const test2 = 'Chào các bạn, hôm nay mình sẽ review chứt kế rất là thể thao và nhẹ. Rút đổi trạy rất mượt mà, khung sườn các bòn siêu bên luôn, nhớ follow kênh để xem thêm nhá.';
const test3 = 'Chào cả nhà, xem trước 3 lo mưỡi này chất vải siêu chống nước nhiều ngăn cực kỳ. Đéo thử lên vài nhá, em ai vô cùng bấm vào link bên dưới để nhận ưu đại nhà.';

console.log('Test 1:', cleanAndPolishVietnameseTranscript(test1));
console.log('Test 2:', cleanAndPolishVietnameseTranscript(test2));
console.log('Test 3:', cleanAndPolishVietnameseTranscript(test3));
