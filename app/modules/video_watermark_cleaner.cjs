const MediaWatermarkCleaner = require('./media_watermark_cleaner.cjs');

// Thêm alias cho tương thích ngược
MediaWatermarkCleaner.prototype.cleanVideoWatermark = function(inputPath, outputPath, options) {
  return this.cleanMediaWatermark(inputPath, outputPath, options);
};

module.exports = MediaWatermarkCleaner;
