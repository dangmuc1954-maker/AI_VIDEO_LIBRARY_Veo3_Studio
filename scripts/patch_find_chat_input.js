const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

const oldCodeStart = `function findChatInput() {
            // First check all editable elements
            const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input[type="text"]'));
            const candidates = all.filter(el => {
              if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              if (p.includes('search') || p.includes('tìm kiếm')) return false;
              if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) return false;
              return true;
            });

            // Priority 1: Has 'message' in placeholder or aria-label
            const msgInput = candidates.find(el => {
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return p.includes('message') || p.includes('chat') || p.includes('ask') || p.includes('tell');
            });
            if (msgInput) return msgInput;

            // Priority 2: Lowest candidate vertically on screen (chat input is at the bottom)
            if (candidates.length > 0) {
              candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
              return candidates[0];
            }

            // Priority 3: Search for element with text '+ Message'
            const plusText = Array.from(document.querySelectorAll('*')).find(el => {
              return el.children.length === 0 && (el.innerText || '').trim() === '+ Message';
            });
            if (plusText) {
              plusText.click();
              const parent = plusText.closest('form, div, footer');
              if (parent) {
                const inp = parent.querySelector('textarea, div[contenteditable="true"], input');
                if (inp) return inp;
              }
            }

            return null;
          }`;

const newCode = `function findChatInput() {
            // Priority 1: Check elements with placeholder/aria-label containing 'message', 'chat', 'ask', 'prompt'
            const all = Array.from(document.querySelectorAll('textarea, input[data-slot="input"], div[contenteditable="true"], [role="textbox"], input[type="text"], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])'));
            const candidates = all.filter(el => {
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              if (p.includes('search') || p.includes('tìm kiếm') || p.includes('email') || p.includes('phone') || p.includes('password')) return false;
              if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) return false;
              return true;
            });

            const msgInput = candidates.find(el => {
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return p.includes('message') || p.includes('chat') || p.includes('ask') || p.includes('tell') || p.includes('prompt');
            });
            if (msgInput) return msgInput;

            // Priority 2: Any editable input at the bottom of the page
            if (candidates.length > 0) {
              return candidates[candidates.length - 1];
            }

            // Priority 3: Click '+ Message' button/pill to open input
            const allTextEls = Array.from(document.querySelectorAll('*')).filter(el => {
              const txt = (el.innerText || '').trim();
              return txt.includes('Message') && el.children.length === 0;
            });
            for (const plusText of allTextEls) {
              try {
                plusText.click();
                const parent = plusText.closest('form, div, footer, main');
                if (parent) {
                  const inp = parent.querySelector('textarea, div[contenteditable="true"], input[type="text"], input[data-slot="input"]');
                  if (inp) return inp;
                }
              } catch(e) {}
            }

            return null;
          }`;

if (content.includes(oldCodeStart)) {
  content = content.replace(oldCodeStart, newCode);
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log('Successfully replaced findChatInput with resilient selector!');
} else {
  console.error('Could not find old findChatInput snippet!');
}
