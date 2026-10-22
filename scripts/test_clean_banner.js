const fs = require('fs');
const { execSync } = require('child_process');

const topToolbarBannerClean = `e.jsxs("div", {
  className: "flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/30 bg-gradient-to-r from-[#0d1f1a] via-[#101726] to-[#0d1f1a] px-4 py-2.5 shadow-lg",
  children: [
    e.jsxs("div", {
      className: "flex items-center gap-3",
      children: [
        e.jsxs("div", {
          className: "flex items-center gap-2 cursor-pointer select-none",
          onClick: () => {
            if (d) {
              const u = d.tts?.enabled;
              V(d.id, {
                tts: {
                  enabled: !u,
                  voiceId: d.tts?.voiceId || "aN7cv9yXNrfIR87bDmyD",
                  voiceName: d.tts?.voiceName || "Ninh Đôn – Deep & Warm (Tiếng Việt)",
                  script: d.tts?.script || "",
                  modelId: d.tts?.modelId || "eleven_multilingual_v2"
                }
              });
            }
          },
          children: [
            e.jsx("span", { className: "text-base animate-pulse", children: "🎙️" }),
            e.jsxs("div", {
              children: [
                e.jsx("span", {
                  className: "text-xs font-bold text-emerald-300 uppercase tracking-wider block",
                  children: "Lồng Tiếng ElevenLabs (Auto-Dubbing)"
                }),
                e.jsx("span", {
                  className: "text-[10px] text-text-muted block",
                  children: d
                    ? "Phân cảnh #" + d.index + ": " + (d.tts?.enabled ? ("Đang bật: " + (d.tts?.voiceName || "Ninh Đôn – Deep & Warm (Tiếng Việt)")) : "Tắt (Gạt để bật)")
                    : "Tự động nhận diện kịch bản và ghép trực tiếp vào video"
                })
              ]
            })
          ]
        }),
        e.jsxs("div", {
          className: "flex items-center gap-2 cursor-pointer select-none",
          onClick: () => {
            if (d) {
              const u = d.tts?.enabled;
              V(d.id, {
                tts: {
                  enabled: !u,
                  voiceId: d.tts?.voiceId || "aN7cv9yXNrfIR87bDmyD",
                  voiceName: d.tts?.voiceName || "Ninh Đôn – Deep & Warm (Tiếng Việt)",
                  script: d.tts?.script || "",
                  modelId: d.tts?.modelId || "eleven_multilingual_v2"
                }
              });
            }
          },
          children: [
            e.jsx("div", {
              className: "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none shadow-sm " + (d?.tts?.enabled ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-white/20 hover:bg-white/30"),
              children: e.jsx("span", {
                className: "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out " + (d?.tts?.enabled ? "translate-x-4" : "translate-x-0")
              })
            }),
            e.jsx("span", {
              className: "text-xs font-extrabold uppercase tracking-wider " + (d?.tts?.enabled ? "text-emerald-400" : "text-white/40"),
              children: d?.tts?.enabled ? "ON" : "OFF"
            })
          ]
        }),
        e.jsx("button", {
          type: "button",
          title: "Áp dụng giọng đọc hiện tại và bật lồng tiếng cho TẤT CẢ các phân cảnh",
          onClick: () => {
            const curVid = d?.tts?.voiceId || "aN7cv9yXNrfIR87bDmyD";
            const curVname = d?.tts?.voiceName || "Ninh Đôn – Deep & Warm (Tiếng Việt)";
            const curMid = d?.tts?.modelId || "eleven_multilingual_v2";
            G.forEach(rw => {
              V(rw.id, {
                tts: {
                  enabled: !0,
                  voiceId: curVid,
                  voiceName: curVname,
                  script: rw.tts?.script || "",
                  modelId: curMid
                }
              });
            });
            if (typeof window !== "undefined" && window.localStorage) {
              try {
                const raw = window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                const sv = raw ? JSON.parse(raw) : [];
                const updated = [{ voiceId: curVid, voiceName: curVname, source: "shared", savedAt: new Date().toISOString() }, ...sv.filter(x => x && x.voiceId !== curVid)];
                window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1", JSON.stringify(updated));
              } catch (_) {}
            }
          },
          className: "text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1 cursor-pointer bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded",
          children: "Áp dụng tất cả phân cảnh"
        })
      ]
    }),
    d?.tts?.enabled ? e.jsxs("div", {
      className: "flex flex-1 min-w-[320px] max-w-[820px] items-center gap-2 justify-end",
      children: [
        e.jsxs("select", {
          value: d.tts?.voiceId || "aN7cv9yXNrfIR87bDmyD",
          onChange: p => {
            const v = p.target.value, w = p.target.options[p.target.selectedIndex].text;
            V(d.id, { tts: { ...(d.tts || {}), voiceId: v, voiceName: w } });
          },
          className: "h-7 rounded-lg border border-emerald-500/40 bg-[#101726] px-2 text-[11px] font-medium text-emerald-200 outline-none focus:border-emerald-400 shrink-0 max-w-[210px] truncate",
          children: [
            e.jsx("option", { value: "aN7cv9yXNrfIR87bDmyD", children: "Ninh Đôn (Tiếng Việt - Nam Trầm ấm)" }),
            e.jsx("option", { value: "EcENCamMHdzIoMysqdsv", children: "Ethan (Tiếng Việt - Nam Rõ ràng)" }),
            e.jsx("option", { value: "ipTvfDXAg1zowfF1rv9w", children: "Hoàng Đặng (Tiếng Việt - Nam Trầm vang)" }),
            e.jsx("option", { value: "KVzG2JMdZJKi6y7cwERP", children: "Quang Nguyễn (Tiếng Việt - Nam Tự nhiên)" }),
            e.jsx("option", { value: "ThT5KcBeYPX3keUQqHPh", children: "Thu Hà (Tiếng Việt - Nữ Truyền cảm)" }),
            e.jsx("option", { value: "g5CIjZEefAph4nQFvHAz", children: "Mai Linh (Tiếng Việt - Nữ Dịu dàng)" }),
            e.jsx("option", { value: "21m00Tcm4TlvDq8ikWAM", children: "Rachel (Nữ - Truyền cảm)" }),
            e.jsx("option", { value: "pNInz6obpgDQGcFmaJgB", children: "Adam (Nam - Trầm ấm)" }),
            e.jsx("option", { value: "ErXwobaYiN019PkySvjV", children: "Antoni (Nam - Sinh động)" }),
            e.jsx("option", { value: "EXAVITQu4vr4xnSDxMaL", children: "Bella (Nữ - Ngọt ngào)" }),
            e.jsx("option", { value: "VR6AewLTigWG4xSOukaG", children: "Arnold (Nam - Mạnh mẽ)" }),
            e.jsx("option", { value: "AZnzlk1XvdvUeBnXmlld", children: "Domi (Nữ - Lôi cuốn)" }),
            e.jsx("option", { value: "MF3mGyEYCl7XYWbV9V6O", children: "Elli (Nữ - Cảm xúc)" }),
            e.jsx("option", { value: "TxGEqnHWrfWFTfGW9XjX", children: "Josh (Nam - Tự tin)" }),
            ...(typeof window !== "undefined" && window.localStorage ? (() => {
              try {
                const raw = window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                const sv = raw ? JSON.parse(raw) : [];
                const defIds = new Set(["aN7cv9yXNrfIR87bDmyD", "EcENCamMHdzIoMysqdsv", "ipTvfDXAg1zowfF1rv9w", "KVzG2JMdZJKi6y7cwERP", "ThT5KcBeYPX3keUQqHPh", "g5CIjZEefAph4nQFvHAz", "21m00Tcm4TlvDq8ikWAM", "pNInz6obpgDQGcFmaJgB", "ErXwobaYiN019PkySvjV", "EXAVITQu4vr4xnSDxMaL", "VR6AewLTigWG4xSOukaG", "AZnzlk1XvdvUeBnXmlld", "MF3mGyEYCl7XYWbV9V6O", "TxGEqnHWrfWFTfGW9XjX"]);
                return sv.filter(x => x && x.voiceId && !defIds.has(x.voiceId)).map(x => e.jsx("option", { value: x.voiceId, children: "★ " + (x.voiceName || x.voiceId) }, x.voiceId));
              } catch (_) { return []; }
            })() : [])
          ]
        }),
        e.jsxs("div", {
          className: "relative flex items-center shrink-0",
          children: [
            e.jsx("input", {
              type: "text",
              value: d.tts?.voiceId || "",
              onBlur: async p => {
                let v = (p.target.value || "").trim().replace(/^.*voices\\//i, "").replace(/^.*share\\//i, "").replace(/\\?.*$/, "").trim();
                if (!v) return;
                if (window.aiforge?.tts?.lookupSharedVoice) {
                  try {
                    const res = await window.aiforge.tts.lookupSharedVoice(v);
                    if (res && (res.voiceName || res.name)) {
                      const vName = res.voiceName || res.name;
                      V(d.id, { tts: { ...(d.tts || {}), voiceId: v, voiceName: vName } });
                      const raw = window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                      const sv = raw ? JSON.parse(raw) : [];
                      const updated = [{ voiceId: v, voiceName: vName, source: "shared", savedAt: new Date().toISOString() }, ...sv.filter(x => x && x.voiceId !== v)];
                      window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1", JSON.stringify(updated));
                    }
                  } catch (_) {}
                }
              },
              onKeyDown: async p => {
                if (p.key === "Enter") {
                  p.preventDefault();
                  let v = (p.currentTarget.value || "").trim().replace(/^.*voices\\//i, "").replace(/^.*share\\//i, "").replace(/\\?.*$/, "").trim();
                  if (!v) return;
                  if (window.aiforge?.tts?.lookupSharedVoice) {
                    try {
                      const res = await window.aiforge.tts.lookupSharedVoice(v);
                      if (res && (res.voiceName || res.name)) {
                        const vName = res.voiceName || res.name;
                        V(d.id, { tts: { ...(d.tts || {}), voiceId: v, voiceName: vName } });
                        const raw = window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                        const sv = raw ? JSON.parse(raw) : [];
                        const updated = [{ voiceId: v, voiceName: vName, source: "shared", savedAt: new Date().toISOString() }, ...sv.filter(x => x && x.voiceId !== v)];
                        window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1", JSON.stringify(updated));
                      }
                    } catch (_) {}
                  }
                }
              },
              onChange: p => {
                const v = p.target.value.trim().replace(/^.*voices\\//i, "").replace(/^.*share\\//i, "").replace(/\\?.*$/, "");
                V(d.id, { tts: { ...(d.tts || {}), voiceId: v, voiceName: v ? ("Custom (" + v.slice(0, 6) + "...)") : "" } });
              },
              placeholder: "Dán Voice ID...",
              className: "w-28 h-7 rounded-lg border border-white/15 bg-[#101726] pl-2 pr-7 text-[10px] text-text-primary outline-none focus:border-emerald-400 shrink-0"
            }),
            e.jsx("button", {
              type: "button",
              title: "Nhận diện mã giọng đọc và lưu vào bộ nhớ",
              onClick: async () => {
                let v = (d.tts?.voiceId || "").trim().replace(/^.*voices\\//i, "").replace(/^.*share\\//i, "").replace(/\\?.*$/, "").trim();
                if (!v) return;
                if (window.aiforge?.tts?.lookupSharedVoice) {
                  try {
                    const res = await window.aiforge.tts.lookupSharedVoice(v);
                    if (res && (res.voiceName || res.name)) {
                      const vName = res.voiceName || res.name;
                      V(d.id, { tts: { ...(d.tts || {}), voiceId: v, voiceName: vName } });
                      const raw = window.localStorage.getItem("aiforge.ttsStudio.savedVoices.v1");
                      const sv = raw ? JSON.parse(raw) : [];
                      const updated = [{ voiceId: v, voiceName: vName, source: "shared", savedAt: new Date().toISOString() }, ...sv.filter(x => x && x.voiceId !== v)];
                      window.localStorage.setItem("aiforge.ttsStudio.savedVoices.v1", JSON.stringify(updated));
                    }
                  } catch (_) {}
                }
              },
              className: "absolute right-1 top-1 bottom-1 px-1 text-[9px] font-bold text-emerald-400 hover:text-emerald-200 cursor-pointer",
              children: "🔍"
            })
          ]
        }),
        e.jsx("input", {
          type: "text",
          value: d.tts?.script || "",
          onChange: p => V(d.id, { tts: { ...(d.tts || {}), script: p.target.value } }),
          placeholder: "Để trống để TỰ ĐỘNG nhận diện kịch bản video #" + d.index + " (hoặc nhập thoại tùy chỉnh)...",
          className: "flex-1 h-7 rounded-lg border border-emerald-500/50 bg-[#101726] px-2.5 text-xs text-white placeholder:text-text-muted/60 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
        })
      ]
    }) : e.jsx("div", {
      className: "text-[11px] text-text-muted italic",
      children: "Gạt nút [ON] màu xanh ở trên để bật lồng tiếng ElevenLabs cho phân cảnh này"
    })
  ]
})`;

fs.writeFileSync('temp_banner_check.js', 'const e = { jsx: () => ({}), jsxs: () => ({}) }; const d = { tts: {} }; const V = () => {}; const G = []; const banner = (\n' + topToolbarBannerClean + '\n);');

try {
  execSync('node --check temp_banner_check.js', { stdio: 'inherit' });
  console.log('🎉🎉🎉 SUCCESS! topToolbarBannerClean is 100% VALID SYNTAX! 🎉🎉🎉');
} catch (e) {
  console.error('❌ Error in topToolbarBannerClean');
} finally {
  try { fs.unlinkSync('temp_banner_check.js'); } catch (_) {}
}
