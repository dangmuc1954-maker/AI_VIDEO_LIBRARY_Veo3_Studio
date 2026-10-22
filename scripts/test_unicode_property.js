const s = 'review chứt kế rất, chào cả nhà, chia sẻ này có khung sửa rất nhẹ.';

const reChutKe = /(?<![\p{L}\p{N}])chứt\s+kế(?![\p{L}\p{N}])/giu;
console.log('Unicode boundary match:', reChutKe.test(s));
console.log('Replaced:', s.replace(reChutKe, 'thiết kế'));

const reChiaSe = /(?<![\p{L}\p{N}])chia\s+sẻ\s+này(?![\p{L}\p{N}])/giu;
console.log('Chia se replaced:', s.replace(reChiaSe, 'chiếc xe này'));

const reKhungSua = /(?<![\p{L}\p{N}])khung\s+sửa(?![\p{L}\p{N}])/giu;
console.log('Khung sua replaced:', s.replace(reKhungSua, 'khung sườn'));
