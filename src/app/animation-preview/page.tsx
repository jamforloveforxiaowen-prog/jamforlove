"use client";

import { useState } from "react";
import "./animations.css";

/* ─── 模擬訂單卡片 ──────────────────────── */
function FakeCard({ selected, onSelect, label, delay, style: extraStyle }: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  delay?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-lg p-3 transition-all cursor-pointer"
      style={{
        border: selected ? "2px dashed var(--color-rose)" : "2px dashed rgba(30,15,8,0.1)",
        background: selected ? "rgba(196,80,106,0.04)" : "rgba(255,255,255,0.5)",
        animationDelay: delay,
        ...extraStyle,
      }}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <span className="text-espresso font-medium text-sm">{label}</span>
        <span className={`text-xs font-bold ${selected ? "text-rose" : "text-espresso-light/40"}`}>
          {selected ? "已選" : "選擇"}
        </span>
      </div>
    </div>
  );
}

/* ─── 各風格的 Demo ──────────────────────── */

function Style1({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 s1-success">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl s1-check" style={{ background: "var(--color-rose)" }}>✓</div>
        <p className="font-serif text-lg font-bold text-espresso s1-text">收到你的心意了！</p>
        <p className="text-espresso-light/50 text-xs s1-text2">你的每一份支持，都是我們繼續做下去的動力</p>
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3 s1-enter">
      <div className="s1-step"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" />
      <div className="s1-step" style={{ animationDelay: "0.3s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">填寫資料</span></div>
      <div className="h-8 rounded-lg" style={{ border: "2px dashed rgba(30,15,8,0.08)", background: "rgba(255,255,255,0.3)" }} />
    </div>
  );
}

function Style2({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="s2-envelope">
          <div className="w-16 h-12 rounded-md flex items-center justify-center" style={{ background: "var(--color-linen-dark)", border: "2px dashed var(--color-rose)" }}>
            <span className="text-rose text-lg">♥</span>
          </div>
          <div className="s2-flap" />
        </div>
        <p className="font-serif text-lg font-bold text-espresso s2-msg">收到你的心意了！</p>
        <div className="s2-petals">
          {[0,1,2,3,4].map(i => (
            <span key={i} className="s2-petal" style={{ animationDelay: `${0.5 + i * 0.2}s`, left: `${15 + i * 15}%` }}>❀</span>
          ))}
        </div>
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s2-underline-step"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" style={sel ? { transform: "rotate(-0.5deg)" } : undefined} />
      <div className="s2-underline-step" style={{ animationDelay: "0.4s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">填寫資料</span></div>
    </div>
  );
}

function Style3({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="s3-jar">
          <div className="w-10 h-14 rounded-b-xl" style={{ background: "linear-gradient(to top, var(--color-rose), var(--color-honey))", border: "2px solid rgba(30,15,8,0.15)" }} />
          <div className="w-8 h-3 -mt-0.5 rounded-t-sm mx-auto" style={{ background: "var(--color-espresso)", border: "2px solid rgba(30,15,8,0.2)" }} />
        </div>
        <div className="s3-heart-bubble">♥</div>
        <p className="font-serif text-lg font-bold text-espresso s3-text">收到你的心意了！</p>
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s3-bubble"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" style={{ transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
      <div className="s3-bubble" style={{ animationDelay: "0.3s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">加購好物</span></div>
    </div>
  );
}

function Style4({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="s4-flower">
          {[0,1,2,3,4,5].map(i => (
            <span key={i} className="s4-petal-piece" style={{ transform: `rotate(${i * 60}deg)`, animationDelay: `${i * 0.1}s` }}>❤</span>
          ))}
          <span className="s4-center">✓</span>
        </div>
        <p className="font-serif text-lg font-bold text-espresso s4-text">收到你的心意了！</p>
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s4-vine-grow">
        <div className="s4-node"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      </div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" />
      <div className="s4-vine-grow" style={{ animationDelay: "0.4s" }}>
        <div className="s4-node"><StepDot n={2} color="sage" /><span className="text-sm font-bold text-espresso">填寫資料</span></div>
      </div>
    </div>
  );
}

function Style5({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 relative">
        <div className="s5-glow-ring" />
        <div className="s5-check-center">✓</div>
        <p className="font-serif text-lg font-bold text-espresso s5-text">收到你的心意了！</p>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="s5-bokeh" style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.3}s`, width: `${6 + i * 2}px`, height: `${6 + i * 2}px` }} />
        ))}
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3 s5-sunbeam">
      <div className="s5-step"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" style={sel ? { boxShadow: "0 0 20px rgba(200,149,48,0.3)" } : undefined} />
      <div className="s5-step" style={{ animationDelay: "0.3s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">填寫資料</span></div>
    </div>
  );
}

function Style6({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 relative">
        <div className="s6-album">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl s6-stamp" style={{ background: "var(--color-rose)" }}>✓</div>
        </div>
        <p className="font-serif text-lg font-bold text-espresso s6-text" style={{ transform: "rotate(-1deg)" }}>收到你的心意了！</p>
        {[0,1,2].map(i => (
          <div key={i} className="s6-tape" style={{ top: `${15 + i * 30}%`, left: `${i % 2 === 0 ? 5 : 65}%`, transform: `rotate(${i % 2 === 0 ? -15 : 12}deg)`, animationDelay: `${0.5 + i * 0.2}s` }} />
        ))}
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s6-sticker"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" style={{ transform: sel ? "rotate(-1deg) scale(1.02)" : undefined, transition: "all 0.3s" }} />
      <div className="s6-sticker" style={{ animationDelay: "0.2s", transform: "rotate(0.5deg)" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">加購好物</span></div>
    </div>
  );
}

function Style7({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 relative">
        <div className="s7-cake">
          <div className="w-12 h-8 rounded-t-lg" style={{ background: "var(--color-honey)" }} />
          <div className="w-14 h-4 rounded-b-lg" style={{ background: "var(--color-rose)" }} />
          <div className="s7-flame">🔥</div>
        </div>
        <div className="s7-sparks">
          {[0,1,2,3,4].map(i => (
            <span key={i} className="s7-spark" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>♥</span>
          ))}
        </div>
        <p className="font-serif text-lg font-bold text-espresso s7-text">收到你的心意了！</p>
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s7-oven"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" />
      <div className="s7-oven" style={{ animationDelay: "0.2s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">加購好物</span></div>
    </div>
  );
}

function Style8({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 relative">
        <div className="s8-gift-box">
          <div className="s8-lid" />
          <div className="s8-box-body">
            <span className="text-white text-xl">✓</span>
          </div>
          <div className="s8-ribbon-h" />
          <div className="s8-ribbon-v" />
        </div>
        <p className="font-serif text-lg font-bold text-espresso s8-text">收到你的心意了！</p>
        {[0,1,2,3,4,5,6,7].map(i => (
          <span key={i} className="s8-confetti" style={{ left: `${5 + i * 12}%`, animationDelay: `${0.3 + i * 0.1}s`, color: ["var(--color-rose)", "var(--color-honey)", "var(--color-sage)"][i % 3] }}>■</span>
        ))}
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s8-ribbon-enter"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" />
      <div className="s8-ribbon-enter" style={{ animationDelay: "0.3s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">填寫資料</span></div>
    </div>
  );
}

function Style9({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 relative overflow-hidden">
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="s9-bubble-float" style={{
            left: `${5 + i * 10}%`,
            bottom: "-10%",
            width: `${10 + (i % 4) * 6}px`,
            height: `${10 + (i % 4) * 6}px`,
            animationDelay: `${i * 0.15}s`,
            background: ["var(--color-rose)", "var(--color-honey)", "var(--color-sage)"][i % 3],
          }} />
        ))}
        <div className="s9-main-bubble">
          <span className="text-white text-xl">✓</span>
        </div>
        <p className="font-serif text-lg font-bold text-espresso s9-text">收到你的心意了！</p>
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s9-pop"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" />
      <div className="s9-pop" style={{ animationDelay: "0.15s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">加購好物</span></div>
    </div>
  );
}

function Style10({ phase }: { phase: string }) {
  if (phase === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 relative overflow-hidden">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="s10-firework" style={{
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 20}%`,
            animationDelay: `${0.2 + i * 0.3}s`,
          }}>
            {[0,1,2,3,4,5].map(j => (
              <span key={j} className="s10-spark" style={{
                transform: `rotate(${j * 60}deg)`,
                background: ["var(--color-rose)", "var(--color-honey)", "var(--color-sage)"][j % 3],
              }} />
            ))}
          </div>
        ))}
        <div className="s10-check">✓</div>
        <p className="font-serif text-lg font-bold text-espresso s10-text">收到你的心意了！</p>
      </div>
    );
  }
  const [sel, setSel] = useState(false);
  return (
    <div className="space-y-3">
      <div className="s10-rocket"><StepDot n={1} color="rose" /><span className="text-sm font-bold text-espresso">選擇組合</span></div>
      <FakeCard selected={sel} onSelect={() => setSel(!sel)} label="組合 1 — 香辣香菇醬 + 手工皂" />
      <div className="s10-rocket" style={{ animationDelay: "0.1s" }}><StepDot n={2} color="honey" /><span className="text-sm font-bold text-espresso">加購好物</span></div>
    </div>
  );
}

/* ─── 共用元件 ──────────────────────────── */
function StepDot({ n, color }: { n: number; color: string }) {
  const bg = color === "rose" ? "var(--color-rose)" : color === "honey" ? "var(--color-honey)" : color === "sage" ? "var(--color-sage)" : "var(--color-espresso)";
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: bg }}>
      {n}
    </div>
  );
}

const STYLES = [
  { id: 1, name: "晨露輕綻", desc: "極致溫柔 — 純淡入淡出，如清晨霧氣散去", Component: Style1 },
  { id: 2, name: "手寫信箋", desc: "書寫感 — 底線描繪、紙張翻動、信封展開", Component: Style2 },
  { id: 3, name: "果醬熬煮", desc: "品牌敘事 — 冒泡上浮、黏稠回彈、果醬瓶", Component: Style3 },
  { id: 4, name: "花園小徑", desc: "自然生長 — 藤蔓延伸、花朵綻放", Component: Style4 },
  { id: 5, name: "暖陽灑落", desc: "光影溫暖 — 光暈掃過、金色光粒子、散景", Component: Style5 },
  { id: 6, name: "手作拼貼", desc: "雜誌剪貼 — 貼紙飛入、膠帶裝飾、蓋章效果", Component: Style6 },
  { id: 7, name: "烘焙時光", desc: "歡快溫馨 — 搖擺出場、烤箱端出、蛋糕慶祝", Component: Style7 },
  { id: 8, name: "絲帶飛舞", desc: "優雅慶典 — 絲帶纏繞、禮物盒拆開、碎紙灑落", Component: Style8 },
  { id: 9, name: "氣泡派對", desc: "活力歡快 — Q彈氣泡、彈簧回彈、彩色冒泡", Component: Style9 },
  { id: 10, name: "煙火慶典", desc: "最大慶祝 — 煙火升空、粒子爆炸、璀璨綻放", Component: Style10 },
];

/* ─── 主頁面 ────────────────────────────── */
export default function AnimationPreviewPage() {
  const [phases, setPhases] = useState<Record<number, string>>({});
  const [replayKey, setReplayKey] = useState<Record<number, number>>({});

  function togglePhase(id: number) {
    setPhases(prev => ({ ...prev, [id]: prev[id] === "success" ? "order" : "success" }));
    setReplayKey(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function replay(id: number) {
    setReplayKey(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso" style={{ fontStyle: "italic" }}>
          動畫風格預覽
        </h1>
        <p className="text-espresso-light/50 text-base mt-2">點擊「切換成功頁」查看訂單送出效果，「重播」重新播放動畫</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STYLES.map(({ id, name, desc, Component }) => (
          <div key={`${id}-${replayKey[id] || 0}`} className="rounded-2xl overflow-hidden" style={{ border: "2px dashed rgba(30,15,8,0.12)", background: "rgba(255,255,255,0.3)" }}>
            {/* 標題列 */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px dashed rgba(30,15,8,0.08)" }}>
              <div>
                <span className="font-serif font-bold text-espresso text-lg">{id}. {name}</span>
                <p className="text-espresso-light/40 text-xs mt-0.5">{desc}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => replay(id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-espresso-light hover:text-espresso hover:bg-linen-dark/30 transition-all"
                  style={{ border: "1.5px dashed rgba(30,15,8,0.1)" }}
                >
                  重播
                </button>
                <button
                  onClick={() => togglePhase(id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose hover:bg-rose/10 transition-all"
                  style={{ border: "1.5px dashed rgba(196,80,106,0.3)" }}
                >
                  {phases[id] === "success" ? "返回訂單" : "切換成功頁"}
                </button>
              </div>
            </div>
            {/* 動畫區域 */}
            <div className="p-5 h-[280px] relative overflow-hidden" style={{ background: "var(--color-linen)" }}>
              <Component phase={phases[id] || "order"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
