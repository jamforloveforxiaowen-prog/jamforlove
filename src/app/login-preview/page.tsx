import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login 設計預覽 — Jam For Love",
  robots: "noindex",
};

const previewHTML = `
<style>
  /* 隔離樣式，避免與全站 CSS 衝突 */
  #lp-root {
    --lp-linen: #f8f3eb; --lp-linen-dark: #ebe2d4; --lp-espresso: #1e0f08;
    --lp-espresso-light: #5c3d2e; --lp-rose: #c4506a; --lp-rose-dark: #a03050;
    --lp-rose-muted: #c4506a1a; --lp-sage: #5a7c52; --lp-honey: #c89530; --lp-wine: #4a1828;
    font-family: 'Outfit', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #0a0a0a; color: white;
  }
  #lp-root *, #lp-root *::before, #lp-root *::after { margin: 0; padding: 0; box-sizing: border-box; }

  /* 導覽 */
  #lp-root .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 12px 24px; display: flex; align-items: center; gap: 12px; overflow-x: auto; }
  #lp-root .lp-nav-title { font-weight: 700; font-size: 0.875rem; white-space: nowrap; margin-right: 8px; color: white; }
  #lp-root .lp-nav a { padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; color: rgba(255,255,255,0.5); text-decoration: none; white-space: nowrap; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
  #lp-root .lp-nav a:hover { color: white; border-color: var(--lp-rose); background: rgba(196,80,106,0.1); }

  /* 區塊 */
  #lp-root .lp-section { min-height: 100vh; position: relative; overflow: hidden; }
  #lp-root .lp-tag { position: absolute; top: 20px; left: 20px; z-index: 10; background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; backdrop-filter: blur(8px); }
  #lp-root .lp-tag small { display: block; font-weight: 400; opacity: 0.5; font-size: 0.6875rem; margin-top: 2px; }

  /* 共用 */
  #lp-root .fl { display: block; font-size: 0.8125rem; font-weight: 500; margin-bottom: 8px; }
  #lp-root .fi { width: 100%; padding: 14px 16px; font-size: 0.9375rem; outline: none; transition: all 0.2s; font-family: inherit; }
  #lp-root .ff { margin-bottom: 20px; }
  #lp-root .ffg { text-align: right; margin-top: 6px; }
  #lp-root .ffg a { font-size: 0.75rem; text-decoration: none; }
  #lp-root .fb { text-align: center; font-size: 0.875rem; margin-top: 28px; }
  #lp-root .fb a { font-weight: 500; text-decoration: none; }

  /* #1 極簡 */
  #lp-root .d1 { background: var(--lp-linen); display: flex; align-items: center; justify-content: center; }
  #lp-root .d1 .card { width: 100%; max-width: 400px; padding: 48px 40px; background: white; border-radius: 20px; box-shadow: 0 4px 40px rgba(30,15,8,0.06); }
  #lp-root .d1 .logo { font-weight: 300; font-style: italic; font-size: 2rem; color: var(--lp-rose); text-align: center; margin-bottom: 8px; }
  #lp-root .d1 .tl { text-align: center; font-size: 0.8rem; color: var(--lp-espresso-light); opacity: 0.5; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 40px; }
  #lp-root .d1 h2 { font-family: 'Noto Serif TC', serif; font-size: 1.5rem; font-weight: 700; color: var(--lp-espresso); margin-bottom: 6px; }
  #lp-root .d1 .desc { font-size: 0.875rem; color: var(--lp-espresso-light); opacity: 0.6; margin-bottom: 32px; }
  #lp-root .d1 .fl { color: var(--lp-espresso); }
  #lp-root .d1 .fi { border: 1.5px solid var(--lp-linen-dark); background: var(--lp-linen); border-radius: 10px; color: var(--lp-espresso); }
  #lp-root .d1 .fi:focus { border-color: var(--lp-rose); box-shadow: 0 0 0 3px var(--lp-rose-muted); background: white; }
  #lp-root .d1 .ffg a { color: var(--lp-espresso-light); opacity: 0.5; }
  #lp-root .d1 .btn { width: 100%; padding: 16px; background: var(--lp-rose); color: white; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; } #lp-root .d1 .btn:hover { background: var(--lp-rose-dark); }
  #lp-root .d1 .fb { color: var(--lp-espresso-light); opacity: 0.6; } #lp-root .d1 .fb a { color: var(--lp-rose); }

  /* #2 左圖右表 */
  #lp-root .d2 { display: flex; }
  #lp-root .d2-photo { width: 50%; position: relative; overflow: hidden; background: linear-gradient(135deg, #c4506a 0%, #a03050 50%, #4a1828 100%); }
  #lp-root .d2-photo img { width: 100%; height: 100%; object-fit: cover; opacity: 0.3; mix-blend-mode: multiply; }
  #lp-root .d2-ov { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 60px; }
  #lp-root .d2-ov h2 { font-weight: 300; font-style: italic; font-size: 3.5rem; color: white; line-height: 0.9; margin-bottom: 16px; }
  #lp-root .d2-ov p { color: rgba(255,255,255,0.6); font-size: 0.875rem; letter-spacing: 0.15em; text-transform: uppercase; }
  #lp-root .d2-fm { width: 50%; display: flex; align-items: center; justify-content: center; padding: 40px; background: white; }
  #lp-root .d2-w { width: 100%; max-width: 380px; }
  #lp-root .d2 h2 { font-family: 'Noto Serif TC', serif; font-size: 2rem; font-weight: 700; color: var(--lp-espresso); margin-bottom: 8px; }
  #lp-root .d2 .desc { font-size: 0.875rem; color: var(--lp-espresso-light); opacity: 0.5; margin-bottom: 40px; }
  #lp-root .d2 .fl { color: var(--lp-espresso); } #lp-root .d2 .fi { border: 1.5px solid var(--lp-linen-dark); background: var(--lp-linen); border-radius: 8px; color: var(--lp-espresso); } #lp-root .d2 .fi:focus { border-color: var(--lp-rose); box-shadow: 0 0 0 3px var(--lp-rose-muted); background: white; }
  #lp-root .d2 .ffg a { color: var(--lp-espresso-light); opacity: 0.5; }
  #lp-root .d2 .btn { width: 100%; padding: 16px; background: var(--lp-rose); color: white; border: none; border-radius: 8px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; } #lp-root .d2 .btn:hover { background: var(--lp-rose-dark); }
  #lp-root .d2 .fb { color: var(--lp-espresso-light); opacity: 0.6; } #lp-root .d2 .fb a { color: var(--lp-rose); }

  /* #3 毛玻璃 */
  #lp-root .d3 { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8f3eb 0%, #ebe2d4 30%, #d87a90 60%, #c4506a 100%); position: relative; }
  #lp-root .d3 .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
  #lp-root .d3 .b1 { width: 400px; height: 400px; background: #c4506a; top: -100px; left: -100px; } #lp-root .d3 .b2 { width: 300px; height: 300px; background: #c89530; bottom: -80px; right: -60px; } #lp-root .d3 .b3 { width: 250px; height: 250px; background: #5a7c52; top: 50%; right: 20%; }
  #lp-root .d3 .glass { position: relative; z-index: 1; width: 100%; max-width: 420px; padding: 48px 40px; background: rgba(255,255,255,0.55); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.4); border-radius: 24px; box-shadow: 0 8px 48px rgba(30,15,8,0.08); }
  #lp-root .d3 .logo { font-weight: 300; font-style: italic; font-size: 1.8rem; color: var(--lp-rose); text-align: center; margin-bottom: 4px; }
  #lp-root .d3 .tl { text-align: center; font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--lp-espresso-light); opacity: 0.5; margin-bottom: 36px; }
  #lp-root .d3 h2 { font-family: 'Noto Serif TC', serif; font-size: 1.75rem; font-weight: 700; text-align: center; color: var(--lp-espresso); margin-bottom: 6px; }
  #lp-root .d3 .desc { text-align: center; font-size: 0.8125rem; color: var(--lp-espresso-light); opacity: 0.6; margin-bottom: 32px; }
  #lp-root .d3 .fl { color: var(--lp-espresso); } #lp-root .d3 .fi { border: 1px solid rgba(255,255,255,0.6); background: rgba(255,255,255,0.5); border-radius: 12px; color: var(--lp-espresso); } #lp-root .d3 .fi:focus { border-color: var(--lp-rose); background: rgba(255,255,255,0.8); box-shadow: 0 0 0 3px var(--lp-rose-muted); }
  #lp-root .d3 .ffg a { color: var(--lp-espresso-light); opacity: 0.5; }
  #lp-root .d3 .btn { width: 100%; padding: 16px; background: var(--lp-rose); color: white; border: none; border-radius: 12px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(196,80,106,0.3); } #lp-root .d3 .btn:hover { background: var(--lp-rose-dark); }
  #lp-root .d3 .fb { color: var(--lp-espresso-light); opacity: 0.6; } #lp-root .d3 .fb a { color: var(--lp-rose); }

  /* #4 社論 */
  #lp-root .d4 { background: var(--lp-linen); display: flex; align-items: center; justify-content: center; }
  #lp-root .d4 .wrap { width: 100%; max-width: 480px; padding: 60px 48px; }
  #lp-root .d4 .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; } #lp-root .d4 .brand-line { width: 40px; height: 2px; background: var(--lp-rose); } #lp-root .d4 .brand-name { font-weight: 300; font-style: italic; font-size: 0.875rem; color: var(--lp-rose); letter-spacing: 0.1em; }
  #lp-root .d4 h2 { font-family: 'Noto Serif TC', serif; font-size: 3rem; font-weight: 700; line-height: 1.1; color: var(--lp-espresso); margin-bottom: 12px; }
  #lp-root .d4 .desc { font-size: 0.9375rem; color: var(--lp-espresso-light); opacity: 0.5; margin-bottom: 48px; line-height: 1.6; }
  #lp-root .d4 .divider { display: flex; align-items: center; gap: 16px; margin-bottom: 36px; } #lp-root .d4 .divider::before, #lp-root .d4 .divider::after { content: ''; flex: 1; height: 1px; background: var(--lp-linen-dark); } #lp-root .d4 .divider span { font-size: 0.6875rem; color: var(--lp-espresso-light); opacity: 0.4; letter-spacing: 0.15em; text-transform: uppercase; }
  #lp-root .d4 .fl { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lp-espresso); }
  #lp-root .d4 .fi { border: none; border-bottom: 2px solid var(--lp-linen-dark); background: transparent; border-radius: 0; padding: 12px 0; color: var(--lp-espresso); font-size: 1rem; } #lp-root .d4 .fi:focus { border-bottom-color: var(--lp-rose); }
  #lp-root .d4 .ffg a { color: var(--lp-espresso-light); opacity: 0.4; }
  #lp-root .d4 .btn { width: 100%; padding: 18px; background: var(--lp-espresso); color: var(--lp-linen); border: none; border-radius: 0; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; margin-top: 12px; } #lp-root .d4 .btn:hover { background: var(--lp-rose); }
  #lp-root .d4 .fb { color: var(--lp-espresso-light); opacity: 0.5; } #lp-root .d4 .fb a { color: var(--lp-rose); }

  /* #5 暖色 */
  #lp-root .d5 { display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, var(--lp-linen) 0%, #f2ead8 40%, #ebe2d4 100%); position: relative; }
  #lp-root .d5 .deco { position: absolute; border-radius: 50%; border: 1px solid var(--lp-linen-dark); } #lp-root .d5 .dc1 { width: 500px; height: 500px; top: -200px; right: -100px; } #lp-root .d5 .dc2 { width: 300px; height: 300px; bottom: -100px; left: -80px; }
  #lp-root .d5 .card { position: relative; z-index: 1; width: 100%; max-width: 420px; padding: 52px 44px; background: white; border-radius: 28px; box-shadow: 0 24px 80px rgba(30,15,8,0.08); }
  #lp-root .d5 .emoji { font-size: 2.5rem; margin-bottom: 20px; }
  #lp-root .d5 h2 { font-family: 'Noto Serif TC', serif; font-size: 1.75rem; font-weight: 700; color: var(--lp-espresso); margin-bottom: 6px; }
  #lp-root .d5 .desc { font-size: 0.8125rem; color: var(--lp-espresso-light); opacity: 0.5; margin-bottom: 36px; }
  #lp-root .d5 .iw { position: relative; margin-bottom: 20px; } #lp-root .d5 .iw .ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; opacity: 0.4; }
  #lp-root .d5 .fi { border: 1.5px solid var(--lp-linen-dark); background: var(--lp-linen); border-radius: 14px; padding-left: 42px; color: var(--lp-espresso); } #lp-root .d5 .fi:focus { border-color: var(--lp-rose); box-shadow: 0 0 0 3px var(--lp-rose-muted); background: white; }
  #lp-root .d5 .ffg a { color: var(--lp-espresso-light); opacity: 0.4; }
  #lp-root .d5 .btn { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--lp-rose), var(--lp-rose-dark)); color: white; border: none; border-radius: 14px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(196,80,106,0.3); } #lp-root .d5 .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(196,80,106,0.35); }
  #lp-root .d5 .fb { color: var(--lp-espresso-light); opacity: 0.5; } #lp-root .d5 .fb a { color: var(--lp-rose); }
  #lp-root .d5 .bft { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--lp-linen-dark); font-weight: 300; font-style: italic; font-size: 0.875rem; color: var(--lp-espresso-light); opacity: 0.4; }

  /* #6 深色 */
  #lp-root .d6 { display: flex; align-items: center; justify-content: center; background: var(--lp-wine); background-image: radial-gradient(ellipse at 30% 20%, rgba(196,80,106,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(200,149,48,0.08) 0%, transparent 50%); }
  #lp-root .d6 .card { width: 100%; max-width: 400px; padding: 52px 44px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; backdrop-filter: blur(20px); }
  #lp-root .d6 .logo { font-weight: 300; font-style: italic; font-size: 1.8rem; color: var(--lp-rose); text-align: center; margin-bottom: 4px; }
  #lp-root .d6 .tl { text-align: center; font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 40px; }
  #lp-root .d6 h2 { font-family: 'Noto Serif TC', serif; font-size: 1.75rem; font-weight: 700; color: var(--lp-linen); text-align: center; margin-bottom: 6px; }
  #lp-root .d6 .desc { text-align: center; font-size: 0.8125rem; color: rgba(255,255,255,0.4); margin-bottom: 36px; }
  #lp-root .d6 .fl { color: rgba(255,255,255,0.6); } #lp-root .d6 .fi { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); border-radius: 10px; color: var(--lp-linen); } #lp-root .d6 .fi::placeholder { color: rgba(255,255,255,0.2); } #lp-root .d6 .fi:focus { border-color: var(--lp-rose); background: rgba(255,255,255,0.1); box-shadow: 0 0 0 3px rgba(196,80,106,0.2); }
  #lp-root .d6 .ffg a { color: rgba(255,255,255,0.3); }
  #lp-root .d6 .btn { width: 100%; padding: 16px; background: var(--lp-rose); color: white; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(196,80,106,0.4); } #lp-root .d6 .btn:hover { background: var(--lp-rose-dark); }
  #lp-root .d6 .fb { color: rgba(255,255,255,0.35); } #lp-root .d6 .fb a { color: var(--lp-rose); }

  /* #7 斜切 */
  #lp-root .d7 { position: relative; }
  #lp-root .d7-br { position: absolute; inset: 0; background: var(--lp-rose); clip-path: polygon(0 0, 55% 0, 35% 100%, 0 100%); } #lp-root .d7-br::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 30% 60%, rgba(255,255,255,0.12) 0%, transparent 50%); }
  #lp-root .d7-bl { position: absolute; inset: 0; background: var(--lp-linen); clip-path: polygon(55% 0, 100% 0, 100% 100%, 35% 100%); }
  #lp-root .d7-brand { position: absolute; left: 0; top: 0; bottom: 0; width: 35%; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1; padding: 40px; } #lp-root .d7-brand h2 { font-weight: 300; font-style: italic; font-size: 3rem; color: white; line-height: 0.9; text-align: center; margin-bottom: 12px; } #lp-root .d7-brand p { color: rgba(255,255,255,0.5); font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; }
  #lp-root .d7-fm { position: absolute; right: 0; top: 0; bottom: 0; width: 58%; display: flex; align-items: center; justify-content: center; z-index: 1; padding: 40px; } #lp-root .d7-w { width: 100%; max-width: 380px; }
  #lp-root .d7 h2 { font-family: 'Noto Serif TC', serif; font-size: 2rem; font-weight: 700; color: var(--lp-espresso); margin-bottom: 8px; }
  #lp-root .d7 .desc { font-size: 0.875rem; color: var(--lp-espresso-light); opacity: 0.5; margin-bottom: 40px; }
  #lp-root .d7 .fl { color: var(--lp-espresso); } #lp-root .d7 .fi { border: 1.5px solid var(--lp-linen-dark); background: white; border-radius: 10px; color: var(--lp-espresso); } #lp-root .d7 .fi:focus { border-color: var(--lp-rose); box-shadow: 0 0 0 3px var(--lp-rose-muted); }
  #lp-root .d7 .ffg a { color: var(--lp-espresso-light); opacity: 0.4; }
  #lp-root .d7 .btn { width: 100%; padding: 16px; background: var(--lp-rose); color: white; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; } #lp-root .d7 .btn:hover { background: var(--lp-rose-dark); }
  #lp-root .d7 .fb { color: var(--lp-espresso-light); opacity: 0.5; } #lp-root .d7 .fb a { color: var(--lp-rose); }

  /* #8 水果 */
  #lp-root .d8 { display: flex; align-items: center; justify-content: center; background: var(--lp-rose); position: relative; overflow: hidden; }
  #lp-root .d8 .fruit { position: absolute; font-size: 2rem; opacity: 0.15; animation: lpFloat 6s ease-in-out infinite; } #lp-root .d8 .fr1 { top: 10%; left: 8%; font-size: 3rem; } #lp-root .d8 .fr2 { top: 25%; right: 12%; animation-delay: 1s; } #lp-root .d8 .fr3 { bottom: 20%; left: 15%; font-size: 2.5rem; animation-delay: 2s; } #lp-root .d8 .fr4 { bottom: 10%; right: 8%; animation-delay: 0.5s; } #lp-root .d8 .fr5 { top: 60%; right: 5%; font-size: 2.5rem; animation-delay: 1.5s; }
  @keyframes lpFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } }
  #lp-root .d8 .card { position: relative; z-index: 1; width: 100%; max-width: 400px; padding: 48px 40px; background: white; border-radius: 24px; box-shadow: 0 32px 80px rgba(74,24,40,0.3); }
  #lp-root .d8 .badge { width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, var(--lp-rose), var(--lp-rose-dark)); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 4px 16px rgba(196,80,106,0.3); font-size: 1.8rem; }
  #lp-root .d8 h2 { font-family: 'Noto Serif TC', serif; font-size: 1.75rem; font-weight: 700; color: var(--lp-espresso); text-align: center; margin-bottom: 4px; }
  #lp-root .d8 .desc { text-align: center; font-size: 0.8125rem; color: var(--lp-espresso-light); opacity: 0.5; margin-bottom: 32px; }
  #lp-root .d8 .fl { color: var(--lp-espresso); } #lp-root .d8 .fi { border: 1.5px solid var(--lp-linen-dark); background: var(--lp-linen); border-radius: 12px; color: var(--lp-espresso); } #lp-root .d8 .fi:focus { border-color: var(--lp-rose); box-shadow: 0 0 0 3px var(--lp-rose-muted); background: white; }
  #lp-root .d8 .ffg a { color: var(--lp-espresso-light); opacity: 0.4; }
  #lp-root .d8 .btn { width: 100%; padding: 16px; background: var(--lp-espresso); color: white; border: none; border-radius: 12px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; } #lp-root .d8 .btn:hover { background: var(--lp-rose); }
  #lp-root .d8 .fb { color: var(--lp-espresso-light); opacity: 0.5; } #lp-root .d8 .fb a { color: var(--lp-rose); }

  /* #9 不對稱 */
  #lp-root .d9 { display: grid; grid-template-columns: 1fr 480px; }
  #lp-root .d9-left { background: var(--lp-linen); display: flex; flex-direction: column; justify-content: space-between; padding: 48px 60px; position: relative; overflow: hidden; } #lp-root .d9-left::after { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: var(--lp-rose); opacity: 0.05; bottom: -100px; right: -100px; }
  #lp-root .d9-top { display: flex; align-items: center; gap: 12px; } #lp-root .d9-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--lp-rose); } #lp-root .d9-nm { font-weight: 300; font-style: italic; font-size: 1rem; color: var(--lp-espresso-light); }
  #lp-root .d9 .big { font-family: 'Noto Serif TC', serif; font-size: 3.5rem; font-weight: 700; line-height: 1.15; color: var(--lp-espresso); margin-bottom: 20px; } #lp-root .d9 .big span { color: var(--lp-rose); }
  #lp-root .d9 .ld { font-size: 1rem; color: var(--lp-espresso-light); opacity: 0.5; line-height: 1.7; }
  #lp-root .d9-cp { font-size: 0.75rem; color: var(--lp-espresso-light); opacity: 0.3; }
  #lp-root .d9-right { display: flex; align-items: center; justify-content: center; padding: 48px; background: white; } #lp-root .d9-w { width: 100%; max-width: 360px; }
  #lp-root .d9 .ftg { font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--lp-rose); font-weight: 600; margin-bottom: 8px; }
  #lp-root .d9 h2 { font-family: 'Noto Serif TC', serif; font-size: 1.5rem; font-weight: 700; color: var(--lp-espresso); margin-bottom: 6px; }
  #lp-root .d9 .desc { font-size: 0.8125rem; color: var(--lp-espresso-light); opacity: 0.5; margin-bottom: 36px; }
  #lp-root .d9 .fl { color: var(--lp-espresso); } #lp-root .d9 .fi { border: 1.5px solid var(--lp-linen-dark); background: var(--lp-linen); border-radius: 8px; color: var(--lp-espresso); } #lp-root .d9 .fi:focus { border-color: var(--lp-rose); box-shadow: 0 0 0 3px var(--lp-rose-muted); background: white; }
  #lp-root .d9 .ffg a { color: var(--lp-espresso-light); opacity: 0.4; }
  #lp-root .d9 .btn { width: 100%; padding: 16px; background: var(--lp-rose); color: white; border: none; border-radius: 8px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; } #lp-root .d9 .btn:hover { background: var(--lp-rose-dark); }
  #lp-root .d9 .fb { color: var(--lp-espresso-light); opacity: 0.5; } #lp-root .d9 .fb a { color: var(--lp-rose); }

  /* #10 堆疊 */
  #lp-root .d10 { background: var(--lp-linen); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
  #lp-root .d10-hero { text-align: center; margin-bottom: 40px; }
  #lp-root .d10-lr { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; } #lp-root .d10-lc { width: 48px; height: 48px; border-radius: 50%; background: var(--lp-rose); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; } #lp-root .d10-lt { font-weight: 300; font-style: italic; font-size: 1.5rem; color: var(--lp-rose); }
  #lp-root .d10 .ht { font-family: 'Noto Serif TC', serif; font-size: 2.25rem; font-weight: 700; color: var(--lp-espresso); line-height: 1.2; margin-bottom: 8px; }
  #lp-root .d10 .hd { font-size: 0.9375rem; color: var(--lp-espresso-light); opacity: 0.5; }
  #lp-root .d10 .fc { width: 100%; max-width: 400px; padding: 40px 36px; background: white; border-radius: 20px; box-shadow: 0 8px 40px rgba(30,15,8,0.06); }
  #lp-root .d10 .orn { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; } #lp-root .d10 .orn::before, #lp-root .d10 .orn::after { content: ''; flex: 1; height: 1px; background: var(--lp-linen-dark); } #lp-root .d10 .orn span { font-size: 0.6875rem; color: var(--lp-espresso-light); opacity: 0.4; letter-spacing: 0.15em; text-transform: uppercase; white-space: nowrap; }
  #lp-root .d10 .fl { color: var(--lp-espresso); } #lp-root .d10 .fi { border: 1.5px solid var(--lp-linen-dark); background: var(--lp-linen); border-radius: 10px; color: var(--lp-espresso); } #lp-root .d10 .fi:focus { border-color: var(--lp-rose); box-shadow: 0 0 0 3px var(--lp-rose-muted); background: white; }
  #lp-root .d10 .ffg a { color: var(--lp-espresso-light); opacity: 0.4; }
  #lp-root .d10 .btn { width: 100%; padding: 16px; background: var(--lp-rose); color: white; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; margin-top: 8px; } #lp-root .d10 .btn:hover { background: var(--lp-rose-dark); }
  #lp-root .d10-bt { width: 100%; max-width: 400px; text-align: center; margin-top: 24px; } #lp-root .d10-bt p { font-size: 0.875rem; color: var(--lp-espresso-light); opacity: 0.5; } #lp-root .d10-bt a { color: var(--lp-rose); font-weight: 500; text-decoration: none; }
  #lp-root .d10 .fts { display: flex; justify-content: center; gap: 32px; margin-top: 16px; } #lp-root .d10 .ft { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--lp-espresso-light); opacity: 0.4; } #lp-root .d10 .ftd { width: 4px; height: 4px; border-radius: 50%; background: var(--lp-rose); opacity: 0.5; }
</style>

<nav class="lp-nav">
  <span class="lp-nav-title">Login 預覽</span>
  <a href="#d1">#1 極簡居中</a><a href="#d2">#2 左圖右表單</a><a href="#d3">#3 毛玻璃</a><a href="#d4">#4 社論風</a><a href="#d5">#5 暖色漸層</a><a href="#d6">#6 深色優雅</a><a href="#d7">#7 斜切分割</a><a href="#d8">#8 浮動水果</a><a href="#d9">#9 不對稱</a><a href="#d10">#10 堆疊溫暖</a>
</nav>

<section id="d1" class="lp-section d1"><div class="lp-tag">#1 極簡居中卡片<small>白色卡片居中，乾淨簡潔</small></div><div class="card"><div class="logo">Jam For Love</div><div class="tl">Handmade with Love</div><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="ff"><label class="fl">帳號</label><input class="fi" type="text" placeholder="請輸入帳號"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password" placeholder="請輸入密碼"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></section>

<section id="d2" class="lp-section d2"><div class="lp-tag">#2 左圖右表單<small>果醬意象圖 + 登入表單</small></div><div class="d2-photo"><img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800" alt=""><div class="d2-ov"><h2>Jam<br>For Love</h2><p>Handmade with Love</p></div></div><div class="d2-fm"><div class="d2-w"><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="ff"><label class="fl">帳號</label><input class="fi" type="text"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></div></section>

<section id="d3" class="lp-section d3"><div class="lp-tag">#3 毛玻璃風<small>Glassmorphism + 漸層背景</small></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="glass"><div class="logo">Jam For Love</div><div class="tl">Handmade with Love</div><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="ff"><label class="fl">帳號</label><input class="fi" type="text"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></section>

<section id="d4" class="lp-section d4"><div class="lp-tag">#4 雜誌社論風<small>大標題、底線 input、精品感</small></div><div class="wrap"><div class="brand"><div class="brand-line"></div><span class="brand-name">Jam For Love</span></div><h2>歡迎<br>回來</h2><p class="desc">登入你的帳號，繼續享受手工果醬的美好</p><div class="divider"><span>帳號登入</span></div><div class="ff"><label class="fl">帳號</label><input class="fi" type="text"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></section>

<section id="d5" class="lp-section d5"><div class="lp-tag">#5 暖色漸層 + 圓角<small>Emoji icon、超圓角卡片</small></div><div class="deco dc1"></div><div class="deco dc2"></div><div class="card"><div class="emoji">🍓</div><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="iw"><span class="ico">👤</span><input class="fi" type="text" placeholder="帳號"></div><div class="iw"><span class="ico">🔒</span><input class="fi" type="password" placeholder="密碼"></div><div class="ffg" style="margin-top:-12px;margin-bottom:8px"><a href="#">忘記密碼？</a></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p><div class="bft">Jam For Love</div></div></section>

<section id="d6" class="lp-section d6"><div class="lp-tag">#6 深色優雅<small>Dark Mode、酒紅底色</small></div><div class="card"><div class="logo">Jam For Love</div><div class="tl">Handmade with Love</div><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="ff"><label class="fl">帳號</label><input class="fi" type="text" placeholder="請輸入帳號"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password" placeholder="請輸入密碼"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></section>

<section id="d7" class="lp-section d7"><div class="lp-tag">#7 斜切分割<small>對角線分割、品牌色 vs 亞麻色</small></div><div class="d7-br"></div><div class="d7-bl"></div><div class="d7-brand"><h2>Jam<br>For<br>Love</h2><p>Handmade with Love</p></div><div class="d7-fm"><div class="d7-w"><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="ff"><label class="fl">帳號</label><input class="fi" type="text"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></div></section>

<section id="d8" class="lp-section d8"><div class="lp-tag">#8 玫瑰底 + 浮動水果<small>水果 emoji 浮動動畫</small></div><div class="fruit fr1">🍓</div><div class="fruit fr2">🫐</div><div class="fruit fr3">🍑</div><div class="fruit fr4">🍊</div><div class="fruit fr5">🍒</div><div class="card"><div class="badge">🍓</div><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="ff"><label class="fl">帳號</label><input class="fi" type="text"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></section>

<section id="d9" class="lp-section d9"><div class="lp-tag">#9 不對稱佈局<small>左側大文案、右側表單</small></div><div class="d9-left"><div class="d9-top"><div class="d9-dot"></div><span class="d9-nm">Jam For Love</span></div><div><h2 class="big">用<span>愛</span>手工熬煮<br>每一瓶果醬</h2><p class="ld">嚴選當季新鮮水果，不加人工色素與防腐劑，每一口都是自然的甜蜜。</p></div><div class="d9-cp">© 2025 Jam For Love</div></div><div class="d9-right"><div class="d9-w"><div class="ftg">帳號登入</div><h2>歡迎回來</h2><p class="desc">登入以查看訂單或訂購果醬</p><div class="ff"><label class="fl">帳號</label><input class="fi" type="text"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button><p class="fb">還沒有帳號？ <a href="#">註冊</a></p></div></div></section>

<section id="d10" class="lp-section d10"><div class="lp-tag">#10 堆疊式溫暖<small>Logo 在上、表單卡片在下</small></div><div class="d10-hero"><div class="d10-lr"><div class="d10-lc">🍓</div><span class="d10-lt">Jam For Love</span></div><h2 class="ht">歡迎回來</h2><p class="hd">登入以查看訂單或訂購果醬</p></div><div class="fc"><div class="orn"><span>帳號登入</span></div><div class="ff"><label class="fl">帳號</label><input class="fi" type="text"></div><div class="ff"><label class="fl">密碼</label><input class="fi" type="password"><div class="ffg"><a href="#">忘記密碼？</a></div></div><button class="btn">登入</button></div><div class="d10-bt"><p>還沒有帳號？ <a href="#">註冊</a></p><div class="fts"><div class="ft"><div class="ftd"></div>天然手工</div><div class="ft"><div class="ftd"></div>當季水果</div><div class="ft"><div class="ftd"></div>用愛熬煮</div></div></div></section>

<script>
document.querySelectorAll('.lp-nav a').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth'});});});
</script>
`;

export default function LoginPreviewPage() {
  return (
    <div
      id="lp-root"
      dangerouslySetInnerHTML={{ __html: previewHTML }}
      suppressHydrationWarning
    />
  );
}
