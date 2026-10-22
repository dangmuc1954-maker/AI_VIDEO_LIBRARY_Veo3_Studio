function cleanAndPolishVietnameseTranscript(text) {
  if (!text || typeof text !== 'string') return '';
  let s = text.trim();

  // 1. Lời chào mở đầu (Greetings)
  s = s.replace(/\b(?:trong\s+mình|chong\s+mình|choang\s+mình|cho\s+mình|chúng\s+mình)\s+các\s+bạn\b/gi, 'Chào mừng các bạn')
       .replace(/\b(?:trong\s+mình|chong\s+mình)\s+mọi\s+người\b/gi, 'Chào mừng mọi người')
       .replace(/\bxin\s+chào\s+các\s+bạn\s+đã\s+quay\s+trở\s+lại\b/gi, 'Chào mừng các bạn đã quay trở lại');

  // 2. Chủ ngữ & Tên sản phẩm / Đồ vật
  s = s.replace(/\bchia\s+sẻ\s+này\b/gi, 'chiếc xe này')
       .replace(/\bchia\s+sẻ\b(?=\s+(?:này|đạp|chạy|đi|có|rất|được))/gi, 'chiếc xe')
       .replace(/\b3\s*lo\b|\bbà\s*lôn\b|\bba\s*lo\b|\bbalon\b/gi, 'balo')
       .replace(/\bxem\s+trước\s+([0-9a-zà-ỹ]+)\s+mới/gi, 'xem chiếc $1 mới')
       .replace(/\b(?:xem|review|riview)\s+trước\s+([0-9a-zà-ỹ]+)/gi, 'review chiếc $1')
       .replace(/\bxem\s+trước\b/gi, 'xem chiếc')
       .replace(/\briview\b|\breviu\b/gi, 'review')
       .replace(/\bchứt\s+kế\b|\bchức\s+kế\b|\bchất\s+kế\b/gi, 'thiết kế')
       .replace(/\bkhung\s+sửa\b|\bkhung\s+sữa\b|\bkhung\s+sưa\b/gi, 'khung sườn')
       .replace(/\bcác\s+bòn\b|\bcác\s+bon\b|\bcacbon\b|\bkhung\s+các\s+bòn\b/gi, 'carbon')
       .replace(/\bsiêu\s+bên\b/gi, 'siêu bền')
       .replace(/\bmưỡi\b|\bmỡi\b/gi, 'mới')
       .replace(/\brút\s+đổi\s+trạy\b|\brút\s+đổi\s+chạy\b|\brút\s+đổi\b/gi, 'tốc độ chạy')
       .replace(/\btrạy\b/gi, 'chạy')
       .replace(/\bchất\s+vài\b|\bchất\s+liệu\s+vài\b/gi, 'chất vải')
       .replace(/\bchúng\s+nước\b|\bxíu\s+trống\s+nước\b|\btrống\s+nước\b/gi, 'chống nước')
       .replace(/\bxíu\b(?=\s+(?:chống|đẹp|nhẹ|bền|nhanh|mượt|êm))/gi, 'siêu')
       .replace(/\bđ[eé]o\s+thử\b/gi, 'đeo thử')
       .replace(/\bđ[eé]o\s+(thử|lên|vào|chiếc|balo|tai\s+nghe)\b/gi, 'đeo $1')
       .replace(/\b(?:lên|trên)\s+vài\b/gi, 'lên vai')
       .replace(/\bem\s+ai\b|\bem\s+ài\b/gi, 'êm ái')
       .replace(/\b(?:ưu|u)\s+đại\b/gi, 'ưu đãi')
       .replace(/\blinh\s+mua\s+hàng\b/gi, 'link mua hàng')
       .replace(/\blinh\s+bên\s+dưới\b/gi, 'link bên dưới')
       .replace(/\bdộng\s+giải\b|\brộng\s+giải\b/gi, 'rộng rãi')
       .replace(/\bnhân\s+viên\s+vài\b/gi, 'nhân vật')
       .replace(/\btai\s+nghé\b/gi, 'tai nghe')
       .replace(/\bđiện\s+thoai\b/gi, 'điện thoại')
       .replace(/\bxe\s+đập\b/gi, 'xe đạp')
       .replace(/\bkết\s+l\s*nối\b/gi, 'kết nối')
       .replace(/\bbảo\s+hanh\b/gi, 'bảo hành')
       .replace(/\bkhuyên\s+mãi\b|\bkhuyễn\s+mãi\b/gi, 'khuyến mãi')
       .replace(/\bchính\s+hang\b/gi, 'chính hãng');

  // 3. Lời kết video & Kêu gọi hành động (Call To Action)
  s = s.replace(/\bnhớ\s+bấm\s+follow\s+mình\s+nhá\b/gi, 'nhớ bấm follow mình nhé')
       .replace(/\bnhớ\s+follow\s+kênh\s+để\s+xem\s+thêm\s+nhá\b/gi, 'nhớ follow kênh để xem thêm nhé')
       .replace(/\bđăng\s+kí\b/gi, 'đăng ký')
       .replace(/\bnhá([,\.!\?]|$)/gi, 'nhé$1')
       .replace(/\bnhà([,\.!\?]|$)/gi, 'nha$1');

  // 4. Định dạng câu, viết hoa chữ cái đầu và sau dấu chấm
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/(\.|\?|\!)\s*([a-zà-ỹ])/g, (_, p1, p2) => p1 + ' ' + p2.toUpperCase());
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.!?]$/.test(s)) {
      s += '.';
    }
  }

  return s;
}

// Test against all 3 user videos
const test1 = 'Trong mình các bạn đã quay trở lại, chia sẻ này có khung sửa rất nhẹ, trải nghiệm đạp xe cực kì mượt mà rất phù hợp cho việc tập thể thao, nhớ bấm follow mình nhá.';
const test2 = 'Chào các bạn, hôm nay mình sẽ review chứt kế rất là thể thao và nhẹ. Rút đổi trạy rất mượt mà, khung sườn các bòn siêu bên luôn, nhớ follow kênh để xem thêm nhá.';
const test3 = 'Chào cả nhà, xem trước 3 lo mưỡi này chất vải siêu chống nước nhiều ngăn cực kỳ. Đéo thử lên vài nhá, em ai vô cùng bấm vào link bên dưới để nhận ưu đại nhà.';

console.log('--- TEST 1 (Video vừa test lúc 14:44) ---');
console.log('Before:', test1);
console.log('After: ', cleanAndPolishVietnameseTranscript(test1));

console.log('\n--- TEST 2 (Video xe đạp trước) ---');
console.log('Before:', test2);
console.log('After: ', cleanAndPolishVietnameseTranscript(test2));

console.log('\n--- TEST 3 (Video balo) ---');
console.log('Before:', test3);
console.log('After: ', cleanAndPolishVietnameseTranscript(test3));
