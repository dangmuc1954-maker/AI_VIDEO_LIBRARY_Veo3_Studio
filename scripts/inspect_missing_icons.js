const fs = require('fs');

const icons = [
  { name: 'gi', file: 'search-BZNan3xP.js' },
  { name: 'Gs', file: 'plus-HKzPhhnY.js' },
  { name: 'Oo', file: 'chevron-left-BmaCx4Qd.js' },
  { name: 'hs', file: 'play-CvxxyuxN.js' },
  { name: 'fs', file: 'chevron-right-CsYuqhh5.js' },
  { name: 'bi', file: 'hard-drive-CJoDYdEX.js' },
  { name: 'vi', file: 'grip-vertical-CciXSJNh.js' },
  { name: 'ci, ui, mi', file: 'undo-2-CDn4WgmA.js' },
  { name: 'Xt', file: 'trash-2-C1XHoXPF.js' },
  { name: 'Lo', file: 'check-D8ngWijJ.js' },
  { name: '$o', file: 'pause-CVx-Ww-2.js' }
];

icons.forEach(({ name, file }) => {
  const p = 'extracted_aiforge_studio/out/renderer/assets/' + file;
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    console.log(`=== ${file} (${name}) ===`);
    console.log(c.slice(0, 400));
  } else {
    console.log(`File not found: ${file}`);
  }
});
