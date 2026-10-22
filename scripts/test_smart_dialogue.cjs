const fs = require('fs');
const path = require('path');

console.log('Testing generateSmartVietnameseDialogue directly:');
// Let's test smart dialogue logic
function generateSmartVietnameseDialogue(rawPrompt, vidDuration, voiceName) {
  const p = (rawPrompt || "").toLowerCase();
  const v = (voiceName || "").toLowerCase();
  let selfRef = "mình";

  if (/review|đánh giá|trải nghiệm|balo|ba lô|túi|sách|điện thoại|áo|quần|giày|mỹ phẩm|son|đồng hồ|unboxing|đập hộp|mở hộp/i.test(p)) {
    let item = "ba lô";
    if (/balo|ba lô/i.test(p)) item = "ba lô";
    else if (/túi/i.test(p)) item = "túi xách";
    else if (/điện thoại|phone/i.test(p)) item = "điện thoại";
    else if (/mỹ phẩm|son|kem/i.test(p)) item = "sản phẩm làm đẹp";
    else if (/áo|quần|váy|đầm/i.test(p)) item = "mẫu trang phục";
    else if (/giày|dép/i.test(p)) item = "đôi giày";
    else if (/đồng hồ/i.test(p)) item = "chiếc đồng hồ";
    else item = "sản phẩm";

    if (vidDuration <= 5) {
      return "Xin chào các bạn, chiếc " + item + " này thực sự rất xinh và tiện lợi nhé!";
    } else if (vidDuration <= 7) {
      return "Xin chào mọi người! Hôm nay " + selfRef + " sẽ review cho các bạn xem chiếc " + item + " siêu xinh và tiện lợi này nhé!";
    } else {
      return "Xin chào tất cả các bạn! Hôm nay " + selfRef + " rất vui được giới thiệu và review chi tiết chiếc " + item + " cực kỳ xinh xắn và tiện lợi này cho mọi người cùng xem nhé!";
    }
  }

  if (vidDuration <= 5) {
    return "Xin chào tất cả các bạn, chào mừng các bạn đã đến với video ngày hôm nay!";
  } else if (vidDuration <= 7) {
    return "Xin chào mọi người! Rất vui được gặp lại các bạn trong video hôm nay, chúc mọi người một ngày tràn đầy năng lượng!";
  } else {
    return "Xin chào tất cả các bạn! Chào mừng các bạn đã quay trở lại với video hôm nay, hãy cùng mình theo dõi những nội dung hấp dẫn ngay sau đây nhé!";
  }
}

console.log('Sample 1 (balo 5s):', generateSmartVietnameseDialogue("Review balo chống nước đi học", 5, "Nữ"));
console.log('Sample 2 (điện thoại 8s):', generateSmartVietnameseDialogue("Đánh giá điện thoại mới", 8, "Nữ"));
console.log('Sample 3 (chung 6s):', generateSmartVietnameseDialogue("Video nhảy sôi động", 6, "Nữ"));
