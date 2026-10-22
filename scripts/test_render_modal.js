const fs = require('fs');

// Create mock DOM for Node
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  aiforge: {
    assets: {
      updateAssetDuration: () => {},
      openPath: async () => {},
      editAndMergeVideos: async () => {},
      selectExportDirectory: async () => 'C:/test',
      exportMedia: async () => ({ path: 'C:/test.mp4' }),
      showPathInFolder: () => {}
    }
  }
};
global.document = {
  createElement: () => ({
    preload: '',
    muted: false,
    onloadedmetadata: null,
    onerror: null,
    src: '',
    load: () => {}
  })
};

const mockReact = {
  useState: (init) => {
    const val = typeof init === 'function' ? init() : init;
    return [val, () => {}];
  },
  useEffect: (fn, deps) => {
    try { fn(); } catch (e) { console.error('useEffect error:', e.message); }
  },
  useMemo: (fn, deps) => fn(),
  useCallback: (fn, deps) => fn,
  useRef: (init) => ({ current: init }),
  Fragment: 'Fragment'
};

const mockJsx = {
  jsx: (tag, props) => ({ tag, props }),
  jsxs: (tag, props) => ({ tag, props })
};

const mockToast = {
  success: console.log,
  error: console.error,
  info: console.log,
  warning: console.warn
};

const mockAssetStore = (selector) => {
  return selector({
    assets: [
      { id: 'v1', name: 'clip1.mp4', url: 'http://localhost/v1.mp4', duration: 5, localPath: 'C:/clip1.mp4', type: 'video' }
    ],
    sync: async () => {}
  });
};

// Read VideoStudio-BZY_1pM8.js and extract AiforgeVideoStudioModal
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const start = code.indexOf('const AiforgeVideoStudioModal = (() => {');
const end = code.indexOf('function Qn(){');
const modalCode = code.slice(start, end);

const testRunner = `
const h = mockReact;
const e = mockJsx;
const B = mockToast;
const bs = mockAssetStore;

${modalCode}

console.log('Testing AiforgeVideoStudioModal execution...');
try {
  const rendered = AiforgeVideoStudioModal({ isOpen: true, onClose: () => {}, initialAssetIds: [] });
  console.log('Successfully rendered modal! Type:', typeof rendered, 'Root tag:', rendered?.tag);
} catch (err) {
  console.error('RENDER ERROR:', err);
}
`;

eval(testRunner);
