const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const vsBackupPath = path.join(__dirname, '../app/out_backup_v1/renderer/assets/VideoStudio-BZY_1pM8.js');
const vsTargetPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');

function testCode(label, modifiedCode) {
  fs.writeFileSync(vsTargetPath, modifiedCode, 'utf8');
  try {
    execSync('node --check app/out/renderer/assets/VideoStudio-BZY_1pM8.js', { stdio: 'pipe' });
    console.log(`[PASS] ${label}`);
    return true;
  } catch (err) {
    console.log(`[FAIL] ${label}`);
    const msg = err.stderr ? err.stderr.toString() : err.message;
    console.log(msg.slice(-400));
    return false;
  }
}

let code = fs.readFileSync(vsBackupPath, 'utf8');

// 1. MiniEditor Modal
const miniEditorModalCode = `
function MiniVideoEditorModal({ onClose, videos }) {
  const completedList = h.useMemo(() => {
    return (videos || []).filter(v => v && (v.status === 'completed' || v.videoAssetId || v.asset?.assetId)).map((v, idx) => ({
      id: v.id || ("clip_" + idx),
      assetId: v.videoAssetId || v.asset?.assetId,
      prompt: v.prompt || ("Cảnh " + (idx + 1)),
      startTime: 0,
      endTime: ""
    }));
  }, [videos]);

  const [clips, setClips] = h.useState(completedList);
  const [transition, setTransition] = h.useState("none");
  const [aspectRatio, setAspectRatio] = h.useState("original");
  const [isMerging, setIsMerging] = h.useState(false);
  const [statusMsg, setStatusMsg] = h.useState("");
  const [statusType, setStatusType] = h.useState("info");

  const moveClip = (index, dir) => {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= clips.length) return;
    const newClips = [...clips];
    const temp = newClips[index];
    newClips[index] = newClips[targetIdx];
    newClips[targetIdx] = temp;
    setClips(newClips);
  };

  const removeClip = (index) => {
    setClips(clips.filter((_, i) => i !== index));
  };

  const updateClipTime = (index, field, val) => {
    const newClips = [...clips];
    newClips[index] = { ...newClips[index], [field]: val };
    setClips(newClips);
  };

  const handleExport = async () => {
    if (clips.length === 0) {
      setStatusMsg("Vui lòng giữ lại ít nhất 1 clip để xuất video!");
      setStatusType("error");
      return;
    }
    setIsMerging(true);
    setStatusMsg("Đang xử lý cắt ghép video bằng FFmpeg...");
    setStatusType("info");
    try {
      const payload = clips.map(c => ({
        assetId: c.assetId,
        startTime: Number(c.startTime) || 0,
        endTime: c.endTime !== "" && c.endTime !== null && c.endTime !== void 0 ? Number(c.endTime) : null
      }));
      await window.aiforge.assets.editAndMergeVideos(payload, transition, {
        aspectRatio: aspectRatio === "original" ? null : aspectRatio
      });
      setStatusMsg("✅ Ghép & Xuất video thành công! Video đã lưu vào thư viện Assets.");
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Lỗi: " + (err.message || String(err)));
      setStatusType("error");
    } finally {
      setIsMerging(false);
    }
  };

  return e.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4",
    children: e.jsxs("div", {
      className: "relative flex flex-col w-full max-w-2xl max-h-[88vh] rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-purple-950/30 overflow-hidden text-slate-100",
      children: [
        e.jsxs("div", {
          className: "flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                e.jsx("div", {
                  className: "flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20",
                  children: e.jsx("svg", {
                    viewBox: "0 0 24 24",
                    width: 16,
                    height: 16,
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      e.jsx("polygon", { points: "23 7 16 12 23 17 23 7" }),
                      e.jsx("rect", { x: 1, y: 5, width: 15, height: 14, rx: 2, ry: 2 })
                    ]
                  })
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h3", {
                      className: "text-sm font-bold text-slate-100 tracking-wide",
                      children: "BIÊN TẬP & GHÉP VIDEO HOÀN CHỈNH"
                    }),
                    e.jsx("p", {
                      className: "text-[11px] text-slate-400",
                      children: "Tùy chỉnh thời gian cắt xén, sắp xếp thứ tự và chọn hiệu ứng chuyển cảnh"
                    })
                  ]
                })
              ]
            }),
            e.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors",
              children: e.jsx("svg", {
                viewBox: "0 0 24 24",
                width: 18,
                height: 18,
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2,
                strokeLinecap: "round",
                strokeLinejoin: "round",
                children: [
                  e.jsx("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
                  e.jsx("line", { x1: 6, y1: 6, x2: 18, y2: 18 })
                ]
              })
            })
          ]
        }),
        e.jsxs("div", {
          className: "flex-1 overflow-y-auto p-5 space-y-4 [scrollbar-gutter:stable]",
          children: [
            clips.length === 0
              ? e.jsx("div", {
                  className: "py-10 text-center text-slate-400 text-xs",
                  children: "Chưa có clip video nào hoàn thành để biên tập."
                })
              : e.jsx("div", {
                  className: "space-y-2.5",
                  children: clips.map((c, idx) =>
                    e.jsxs("div", {
                      key: c.id,
                      className: "flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700/80 transition-all",
                      children: [
                        e.jsxs("div", {
                          className: "flex items-center justify-center w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 font-bold text-xs shrink-0",
                          children: ["#", idx + 1]
                        }),
                        e.jsxs("div", {
                          className: "flex-1 min-w-0",
                          children: [
                            e.jsx("div", {
                              className: "text-xs font-semibold text-slate-200 truncate",
                              children: c.prompt
                            }),
                            e.jsxs("div", {
                              className: "text-[10px] text-slate-500 truncate font-mono",
                              children: ["ID: ", c.assetId]
                            })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex items-center gap-2 shrink-0 text-xs",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center gap-1",
                              children: [
                                e.jsx("span", { className: "text-[11px] text-slate-400", children: "Đầu:" }),
                                e.jsx("input", {
                                  type: "number",
                                  min: "0",
                                  step: "0.1",
                                  value: c.startTime,
                                  onChange: ev => updateClipTime(idx, "startTime", ev.target.value),
                                  className: "w-14 px-1.5 py-1 text-xs text-center bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-purple-500"
                                }),
                                e.jsx("span", { className: "text-[10px] text-slate-500", children: "s" })
                              ]
                            }),
                            e.jsxs("div", {
                              className: "flex items-center gap-1",
                              children: [
                                e.jsx("span", { className: "text-[11px] text-slate-400", children: "Cuối:" }),
                                e.jsx("input", {
                                  type: "number",
                                  min: "0",
                                  step: "0.1",
                                  placeholder: "Hết",
                                  value: c.endTime,
                                  onChange: ev => updateClipTime(idx, "endTime", ev.target.value),
                                  className: "w-14 px-1.5 py-1 text-xs text-center bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-purple-500"
                                }),
                                e.jsx("span", { className: "text-[10px] text-slate-500", children: "s" })
                              ]
                            })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex items-center gap-1 shrink-0",
                          children: [
                            e.jsx("button", {
                              type: "button",
                              disabled: idx === 0,
                              onClick: () => moveClip(idx, -1),
                              title: "Di chuyển lên",
                              className: "p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed",
                              children: "↑"
                            }),
                            e.jsx("button", {
                              type: "button",
                              disabled: idx === clips.length - 1,
                              onClick: () => moveClip(idx, 1),
                              title: "Di chuyển xuống",
                              className: "p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed",
                              children: "↓"
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => removeClip(idx),
                              title: "Loại bỏ khỏi danh sách ghép",
                              className: "p-1 rounded bg-red-500/15 hover:bg-red-500/30 text-red-300 text-xs ml-1",
                              children: "✕"
                            })
                          ]
                        })
                      ]
                    })
                  )
                }),
            e.jsxs("div", {
              className: "grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", {
                      className: "text-[11px] font-medium text-slate-400",
                      children: "Hiệu ứng chuyển cảnh (Transition):"
                    }),
                    e.jsxs("select", {
                      value: transition,
                      onChange: ev => setTransition(ev.target.value),
                      className: "w-full px-3 py-2 text-xs bg-slate-800/90 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500",
                      children: [
                        e.jsx("option", { value: "none", children: "Cắt nối liền (None)" }),
                        e.jsx("option", { value: "fade", children: "Làm mờ mượt mà (Fade)" }),
                        e.jsx("option", { value: "wipeleft", children: "Quét sang trái (Wipe Left)" }),
                        e.jsx("option", { value: "wiperight", children: "Quét sang phải (Wipe Right)" }),
                        e.jsx("option", { value: "dissolve", children: "Hòa tan mượt mà (Dissolve)" })
                      ]
                    })
                  ]
                }),
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", {
                      className: "text-[11px] font-medium text-slate-400",
                      children: "Tỉ lệ khung hình (Aspect Ratio):"
                    }),
                    e.jsxs("select", {
                      value: aspectRatio,
                      onChange: ev => setAspectRatio(ev.target.value),
                      className: "w-full px-3 py-2 text-xs bg-slate-800/90 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500",
                      children: [
                        e.jsx("option", { value: "original", children: "Giữ tỉ lệ gốc" }),
                        e.jsx("option", { value: "16:9", children: "16:9 Ngang (YouTube / TV)" }),
                        e.jsx("option", { value: "9:16", children: "9:16 Dọc (TikTok / Reels / Shorts)" }),
                        e.jsx("option", { value: "1:1", children: "1:1 Vuông (Instagram)" })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        }),
        e.jsxs("div", {
          className: "flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60",
          children: [
            e.jsx("div", {
              className: "flex-1 mr-4",
              children: statusMsg && e.jsx("p", {
                className: "text-xs " + (statusType === "error" ? "text-red-400" : statusType === "success" ? "text-emerald-400" : "text-purple-300"),
                children: statusMsg
              })
            }),
            e.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                e.jsx("button", {
                  type: "button",
                  onClick: onClose,
                  className: "px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all",
                  children: "Đóng"
                }),
                e.jsx("button", {
                  type: "button",
                  disabled: isMerging || clips.length === 0,
                  onClick: handleExport,
                  className: "px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                  children: isMerging ? "Đang xuất video..." : "⚡ Ghép & Xuất Video"
                })
              ]
            })
          ]
        })
      ]
    })
  });
}
`;

code = code.replace('function Qn(', miniEditorModalCode + '\nfunction Qn(');

// 2. State & Hook
const hookAnchor = 'h.useEffect(()=>{const r=window.aiforge?.assets;if(r)return Q(),r.onChanged(ee)},[Q,ee]);';
const stateAndHookCode = `h.useEffect(()=>{const r=window.aiforge?.assets;if(r)return Q(),r.onChanged(ee)},[Q,ee]);
const [autoMergeOn, setAutoMergeOn] = h.useState(false);
const [isMiniEditorOpen, setIsMiniEditorOpen] = h.useState(false);
const prevPendingRef = h.useRef(0);
h.useEffect(() => {
  const pendingCount = (pe || []).filter(x => x.status === 'pending' || x.status === 'running').length;
  const completedClips = (pe || []).filter(x => x.status === 'completed' && (x.videoAssetId || x.asset?.assetId));
  if (autoMergeOn && prevPendingRef.current > 0 && pendingCount === 0 && completedClips.length > 1) {
    const assetIds = completedClips.map(x => x.videoAssetId || x.asset?.assetId).filter(Boolean);
    if (assetIds.length > 1) {
      (async () => {
        try {
          await window.aiforge.assets.editAndMergeVideos(assetIds, "none", {});
          alert("✅ Đã tự động ghép xong " + assetIds.length + " cảnh video thành công!");
        } catch (err) {
          console.error("Auto merge failed:", err);
        }
      })();
    }
  }
  prevPendingRef.current = pendingCount;
}, [pe, autoMergeOn]);
`;
code = code.replace(hookAnchor, stateAndHookCode);

// 3. Buttons: We keep the anchor completely intact and just append commas and new elements
const genBtnAnchor = 'ce.length===0||Fe>0?"Resolve Issue":`Generate ${Gr}`]})';
const newButtonsCode = genBtnAnchor + `,
e.jsx("button", {
  type: "button",
  onClick: () => setAutoMergeOn(!autoMergeOn),
  title: autoMergeOn ? "Đang bật: Tự động ghép nối tiếp khi tạo xong tất cả cảnh" : "Bấm để bật tự động ghép video khi tạo xong",
  className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all " + (autoMergeOn ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20" : "bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200"),
  children: [
    e.jsx("span", {
      className: "w-2 h-2 rounded-full transition-all " + (autoMergeOn ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-slate-500")
    }),
    autoMergeOn ? "Tự động ghép: BẬT" : "Tự động ghép: TẮT"
  ]
}),
e.jsx("button", {
  type: "button",
  onClick: () => setIsMiniEditorOpen(true),
  title: "Mở trình biên tập và ghép video chuyên nghiệp",
  className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 hover:border-purple-500/60 text-xs font-semibold transition-all shadow-sm shadow-purple-500/10",
  children: [
    e.jsx("svg", {
      viewBox: "0 0 24 24",
      width: 14,
      height: 14,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        e.jsx("circle", { cx: 6, cy: 6, r: 3 }),
        e.jsx("circle", { cx: 6, cy: 18, r: 3 }),
        e.jsx("line", { x1: 20, y1: 4, x2: 8.12, y2: 15.88 }),
        e.jsx("line", { x1: 14.47, y1: 14.48, x2: 20, y2: 20 }),
        e.jsx("line", { x1: 8.12, y1: 8.12, x2: 12, y2: 12 })
      ]
    }),
    "Biên tập video"
  ]
})`;

code = code.replace(genBtnAnchor, newButtonsCode);

// 4. Modal insertion
const modalAnchor = 'e.jsx(ys,{request:v,onClose:()=>M(null)}),';
const modalInsertion = 'e.jsx(ys,{request:v,onClose:()=>M(null)}),isMiniEditorOpen&&e.jsx(MiniVideoEditorModal,{videos:pe,onClose:()=>setIsMiniEditorOpen(false)}),';
code = code.replace(modalAnchor, modalInsertion);

testCode('ALL 4 STEPS COMBINED', code);
