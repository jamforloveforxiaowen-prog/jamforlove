"use client";

import { useState } from "react";

/* ─── 共用假資料 ─────────────────────────────────── */

interface SampleItem {
  productId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  group: string;
}

const SAMPLE_ORDER = {
  items: [
    {
      productId: "c1",
      name: "Jam for Love 綜合禮盒",
      description: "草莓果醬 × 1、藍莓果醬 × 1、手工餅乾 × 1",
      quantity: 1,
      price: 680,
      group: "主商品",
    },
    {
      productId: "c2",
      name: "暖心小禮盒",
      description: "覆盆子果醬 × 1、蜂蜜檸檬醬 × 1",
      quantity: 1,
      price: 480,
      group: "主商品",
    },
    {
      productId: "a1",
      name: "手寫卡片",
      quantity: 2,
      price: 50,
      group: "加購商品",
    },
    {
      productId: "a2",
      name: "金盞花乳霜",
      description: "40ml",
      quantity: 1,
      price: 300,
      group: "加購商品",
    },
  ] as SampleItem[],
  total: 1480,
  subtotal: 1560,
  discountAmount: 80,
  shippingFee: 0,
  customerName: "陳小慧",
  phone: "0912-345-678",
  email: "xiaohui@example.com",
  deliveryMethod: "shipping" as const,
  address: "台北市中正區羅斯福路 4 段 1 號",
  paymentMethod: "transfer" as const,
  notes: "請小心包裝，謝謝！",
};

function groupItems(items: SampleItem[]) {
  return items.reduce<Record<string, SampleItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});
}

/* ─── 主頁面 ────────────────────────────────────── */

export default function OrderConfirmPreviewPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const designs = [
    {
      name: "卡片浮起",
      desc: "白色分層卡片 + 柔和陰影，現代電商風格",
      component: Design1,
    },
    {
      name: "雜誌編排",
      desc: "大 serif 標題、編號章節、不對稱排版",
      component: Design2,
    },
    {
      name: "復古收據",
      desc: "虛線紙條、mono 字型、單色印刷感",
      component: Design3,
    },
    {
      name: "時間軸摘要",
      desc: "垂直時間軸串接商品/收件/付款節點",
      component: Design4,
    },
    {
      name: "手感拼貼",
      desc: "紙膠帶、便利貼、貼紙標籤的手作感",
      component: Design5,
    },
  ];

  return (
    <div
      className="max-w-5xl mx-auto px-6 py-12"
      style={{ background: "var(--color-linen)" }}
    >
      <div className="mb-12">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Preview
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          訂單確認頁設計預覽
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
        <p className="text-espresso-light/60 text-sm mt-4">
          五款不同風格，決定後告訴我編號，我把 <code>/order</code> 的
          「請確認訂單內容」換成那款
        </p>
      </div>

      <div className="space-y-16">
        {designs.map((d, i) => {
          const idx = i + 1;
          const isSel = selected === idx;
          const Cmp = d.component;
          return (
            <section key={idx}>
              <button
                onClick={() => setSelected(isSel ? null : idx)}
                className="w-full text-left mb-4 group"
              >
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-rose text-[11px] font-semibold tracking-[0.3em] uppercase mb-1">
                      Design 0{idx}
                    </p>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso">
                      {d.name}
                    </h2>
                    <p className="text-espresso-light/60 text-sm mt-1">
                      {d.desc}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-4 py-2 rounded-full font-semibold transition-all ${
                      isSel
                        ? "bg-rose text-white"
                        : "bg-white text-espresso-light border border-espresso-light/15 group-hover:border-rose"
                    }`}
                  >
                    {isSel ? "✓ 已選擇" : "選這款"}
                  </span>
                </div>
                <div className="w-10 h-[2px] bg-espresso-light/20 mt-3" />
              </button>

              <div
                className={`transition-all ${
                  isSel
                    ? "ring-4 ring-rose/30 ring-offset-4 ring-offset-linen rounded-3xl"
                    : ""
                }`}
              >
                <Cmp />
              </div>
            </section>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl"
          style={{ background: "var(--color-espresso)", color: "#fff" }}
        >
          <span className="text-sm">
            已選擇 <b>Design 0{selected}</b> — 告訴我要套用
          </span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Design 1 — 卡片浮起（現代電商）
   ═══════════════════════════════════════════════════ */

function Design1() {
  const o = SAMPLE_ORDER;
  const grouped = groupItems(o.items);
  return (
    <div
      className="max-w-2xl mx-auto px-5 py-10 relative overflow-hidden rounded-3xl"
      style={{ background: "var(--color-linen)" }}
    >
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{
            background:
              "linear-gradient(135deg, var(--color-honey), var(--color-honey-light))",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1
          className="font-serif text-3xl font-bold text-espresso mb-2"
          style={{ fontStyle: "italic" }}
        >
          請確認訂單內容
        </h1>
        <p className="text-espresso-light/50 text-sm">
          確認無誤後，請點擊下方按鈕送出訂單
        </p>
      </div>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(235,226,212,0.8)",
          boxShadow: "0 4px 24px rgba(30,15,8,0.06)",
        }}
      >
        <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2">
          <span className="text-rose">♥</span> 訂單明細
        </h2>
        {Object.entries(grouped).map(([g, items]) => (
          <div key={g} className="mb-4">
            <p className="text-xs font-semibold text-espresso-light/40 tracking-wider uppercase mb-2">
              {g}
            </p>
            <div className="space-y-2">
              {items.map((it) => (
                <div
                  key={it.productId}
                  className="flex items-start justify-between gap-3 py-2"
                  style={{ borderBottom: "1px dashed rgba(30,15,8,0.06)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-espresso font-medium">{it.name}</p>
                    {it.description && (
                      <p className="text-espresso-light/50 text-xs mt-0.5">
                        {it.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-espresso text-sm">x{it.quantity}</p>
                    <p className="text-espresso-light/60 text-xs">
                      NT$ {it.price * it.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div
          className="pt-3 mt-2 space-y-1"
          style={{ borderTop: "2px dashed rgba(30,15,8,0.1)" }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-espresso-light/60">小計</span>
            <span className="text-espresso">NT$ {o.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-rose/70">♥ 支持者折扣</span>
            <span className="text-rose">-NT$ {o.discountAmount}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="font-serif font-bold text-espresso">合計</p>
            <p className="font-serif font-bold text-xl text-rose">
              NT$ {o.total}
            </p>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(235,226,212,0.8)",
          boxShadow: "0 4px 24px rgba(30,15,8,0.06)",
        }}
      >
        <h2 className="font-serif text-lg font-bold text-espresso mb-4 flex items-center gap-2">
          <span className="text-rose">♥</span> 收件資訊
        </h2>
        <div className="space-y-2 text-sm">
          <Row1 label="收件人" value={o.customerName} />
          <Row1 label="電話" value={o.phone} />
          <Row1 label="Email" value={o.email} />
          <Row1 label="取貨方式" value="郵寄" />
          <Row1 label="地址" value={o.address} />
          <Row1 label="付款方式" value="匯款" />
          <Row1 label="備註" value={o.notes} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 py-4 rounded-lg font-serif font-bold text-base text-espresso-light"
          style={{ border: "2px dashed rgba(30,15,8,0.15)" }}
        >
          返回修改
        </button>
        <button
          className="flex-1 py-4 text-white font-serif font-bold text-lg rounded-lg"
          style={{
            background: "var(--color-rose)",
            border: "2px dashed rgba(196,80,106,0.3)",
            boxShadow: "0 4px 16px rgba(196,80,106,0.2)",
          }}
        >
          確認送出訂單
        </button>
      </div>
    </div>
  );
}

function Row1({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-espresso-light/40 shrink-0 w-16">{label}</span>
      <span className="text-espresso">{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Design 2 — 雜誌編排（大 serif + 章節編號）
   ═══════════════════════════════════════════════════ */

function Design2() {
  const o = SAMPLE_ORDER;
  const grouped = groupItems(o.items);
  return (
    <div
      className="max-w-3xl mx-auto px-8 md:px-14 py-14 relative rounded-3xl"
      style={{
        background: "#faf6ef",
        border: "1px solid rgba(30,15,8,0.08)",
      }}
    >
      <div className="mb-10">
        <p className="text-rose text-[11px] font-semibold tracking-[0.4em] uppercase mb-4">
          Final Step · 訂單預覽
        </p>
        <h1
          className="font-serif text-5xl md:text-6xl font-bold text-espresso leading-[1.05]"
          style={{ fontStyle: "italic" }}
        >
          確認後，<br />我們就開始為你手作。
        </h1>
        <div className="flex items-center gap-4 mt-6">
          <div className="w-14 h-[2px] bg-rose" />
          <p className="text-espresso-light/60 text-sm">
            請再次檢查訂單內容與收件資訊
          </p>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-baseline gap-4 mb-6">
          <span
            className="font-serif text-5xl font-bold text-rose/30"
            style={{ fontStyle: "italic" }}
          >
            01
          </span>
          <h2 className="font-serif text-2xl font-bold text-espresso">
            訂單內容
          </h2>
        </div>
        {Object.entries(grouped).map(([g, items]) => (
          <div
            key={g}
            className="mb-6 pb-6"
            style={{ borderBottom: "1px solid rgba(30,15,8,0.08)" }}
          >
            <p className="text-espresso-light/40 text-[11px] tracking-[0.3em] uppercase mb-3">
              —— {g}
            </p>
            {items.map((it) => (
              <div
                key={it.productId}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div className="flex-1">
                  <p className="font-serif text-lg text-espresso font-semibold">
                    {it.name}
                  </p>
                  {it.description && (
                    <p className="text-espresso-light/50 text-sm mt-1 leading-relaxed">
                      {it.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-espresso-light/50 text-xs tracking-widest">
                    ×{it.quantity}
                  </p>
                  <p className="font-serif text-espresso text-lg font-semibold mt-0.5">
                    NT$ {it.price * it.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="space-y-2 text-right">
          <p className="text-sm text-espresso-light/60">
            小計 NT$ {o.subtotal}
          </p>
          <p className="text-sm text-rose">
            ♥ 支持者折扣 -NT$ {o.discountAmount}
          </p>
          <div
            className="flex justify-end items-baseline gap-4 pt-3 mt-3"
            style={{ borderTop: "2px solid var(--color-espresso)" }}
          >
            <span className="text-espresso-light/60 text-sm tracking-widest">
              TOTAL
            </span>
            <span
              className="font-serif text-5xl font-bold text-rose"
              style={{ fontStyle: "italic" }}
            >
              NT$ {o.total}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-baseline gap-4 mb-6">
          <span
            className="font-serif text-5xl font-bold text-rose/30"
            style={{ fontStyle: "italic" }}
          >
            02
          </span>
          <h2 className="font-serif text-2xl font-bold text-espresso">
            收件資訊
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          <Row2 label="收件人" value={o.customerName} />
          <Row2 label="聯絡電話" value={o.phone} />
          <Row2 label="Email" value={o.email} />
          <Row2 label="取貨方式" value="郵寄到府" />
          <Row2 label="寄送地址" value={o.address} full />
          <Row2 label="付款方式" value="匯款" />
          <Row2 label="備註" value={o.notes} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-6 border-t border-espresso-light/20">
        <button className="font-serif text-base text-espresso-light underline underline-offset-4">
          ← 返回修改
        </button>
        <button
          className="px-10 py-4 text-white font-serif font-bold text-lg"
          style={{
            background: "var(--color-espresso)",
            borderRadius: "2px",
            fontStyle: "italic",
          }}
        >
          Confirm & Send →
        </button>
      </div>
    </div>
  );
}

function Row2({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-espresso-light/40 text-[11px] tracking-[0.25em] uppercase mb-1">
        {label}
      </p>
      <p className="font-serif text-espresso text-base">{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Design 3 — 復古收據（單色 mono 紙條）
   ═══════════════════════════════════════════════════ */

function Design3() {
  const o = SAMPLE_ORDER;
  const grouped = groupItems(o.items);
  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div
        className="relative px-8 py-10 text-espresso"
        style={{
          background: "#fdfaf2",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(30,15,8,0.03) 0, rgba(30,15,8,0.03) 1px, transparent 1px, transparent 28px)",
          clipPath:
            "polygon(0 8px, 4% 0, 12% 8px, 20% 0, 28% 8px, 36% 0, 44% 8px, 52% 0, 60% 8px, 68% 0, 76% 8px, 84% 0, 92% 8px, 100% 0, 100% calc(100% - 8px), 92% 100%, 84% calc(100% - 8px), 76% 100%, 68% calc(100% - 8px), 60% 100%, 52% calc(100% - 8px), 44% 100%, 36% calc(100% - 8px), 28% 100%, 20% calc(100% - 8px), 12% 100%, 4% calc(100% - 8px), 0 100%)",
          fontFamily:
            "'Courier New', 'Consolas', ui-monospace, SFMono-Regular, monospace",
        }}
      >
        <div className="text-center mb-6">
          <p
            className="font-serif text-2xl font-bold"
            style={{ fontStyle: "italic", letterSpacing: "0.1em" }}
          >
            JAM FOR LOVE
          </p>
          <p className="text-[11px] tracking-[0.3em] mt-1">— ORDER RECEIPT —</p>
          <p className="text-[10px] mt-2 text-espresso-light/60">
            {new Date().toLocaleString("zh-TW")}
          </p>
        </div>

        <div
          className="py-3 my-3 text-center"
          style={{
            borderTop: "1px dashed currentColor",
            borderBottom: "1px dashed currentColor",
          }}
        >
          <p className="text-sm tracking-widest">請確認訂單內容</p>
        </div>

        <div className="space-y-3 text-[13px]">
          {Object.entries(grouped).map(([g, items]) => (
            <div key={g}>
              <p className="text-[11px] tracking-widest text-espresso-light/60 mb-1">
                [{g}]
              </p>
              {items.map((it) => (
                <div key={it.productId} className="mb-1">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">{it.name}</span>
                    <span className="shrink-0">
                      NT$ {it.price * it.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-espresso-light/60">
                    <span>
                      {it.description ? `  ${it.description}` : ""}
                    </span>
                    <span>
                      {it.quantity} × {it.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          className="my-4"
          style={{ borderTop: "1px dashed currentColor" }}
        />

        <div className="space-y-1 text-[13px]">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>NT$ {o.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>DISCOUNT ♥</span>
            <span>-NT$ {o.discountAmount}</span>
          </div>
        </div>

        <div
          className="my-4"
          style={{ borderTop: "2px dashed currentColor" }}
        />

        <div className="flex justify-between items-baseline">
          <span className="text-sm tracking-widest">TOTAL</span>
          <span
            className="text-3xl font-bold text-rose"
            style={{ fontFamily: "inherit" }}
          >
            NT$ {o.total}
          </span>
        </div>

        <div
          className="my-5"
          style={{ borderTop: "1px dashed currentColor" }}
        />

        <div className="text-[12px] space-y-1">
          <p>CUSTOMER .... {o.customerName}</p>
          <p>PHONE ....... {o.phone}</p>
          <p>EMAIL ....... {o.email}</p>
          <p>SHIP TO ..... 郵寄</p>
          <p className="pl-[12ch]">{o.address}</p>
          <p>PAYMENT ..... 匯款 (TRANSFER)</p>
          {o.notes && <p>NOTE ........ {o.notes}</p>}
        </div>

        <div
          className="my-4"
          style={{ borderTop: "1px dashed currentColor" }}
        />

        <p className="text-center text-[11px] tracking-[0.2em] mb-2">
          * * *  THANK YOU FOR YOUR LOVE  * * *
        </p>

        <div className="flex gap-3 mt-5">
          <button
            className="flex-1 py-3 text-[12px] tracking-widest"
            style={{ border: "1px dashed currentColor" }}
          >
            [ 返回修改 ]
          </button>
          <button
            className="flex-1 py-3 text-[12px] tracking-widest text-white"
            style={{ background: "var(--color-rose)" }}
          >
            [ CONFIRM ]
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Design 4 — 時間軸摘要（垂直節點）
   ═══════════════════════════════════════════════════ */

function Design4() {
  const o = SAMPLE_ORDER;
  const grouped = groupItems(o.items);
  return (
    <div
      className="max-w-2xl mx-auto px-6 py-12 rounded-3xl"
      style={{
        background:
          "linear-gradient(180deg, #faf6ef 0%, #f2ead8 100%)",
      }}
    >
      <div className="text-center mb-10">
        <h1
          className="font-serif text-3xl md:text-4xl font-bold text-espresso"
          style={{ fontStyle: "italic" }}
        >
          訂單最後一哩路
        </h1>
        <p className="text-espresso-light/60 text-sm mt-2">
          確認以下每一個節點都無誤，我們就把愛寄給你 ♥
        </p>
      </div>

      <div className="relative pl-10">
        <div
          className="absolute left-[18px] top-3 bottom-12 w-[2px]"
          style={{
            background:
              "repeating-linear-gradient(180deg, var(--color-rose) 0, var(--color-rose) 4px, transparent 4px, transparent 10px)",
          }}
        />

        <TimelineNode idx={1} title="訂單內容" color="rose">
          <div className="space-y-3">
            {Object.entries(grouped).map(([g, items]) => (
              <div key={g}>
                <p className="text-[11px] tracking-[0.25em] uppercase text-espresso-light/40 mb-1">
                  {g}
                </p>
                {items.map((it) => (
                  <div
                    key={it.productId}
                    className="flex items-start justify-between gap-3 py-1.5"
                  >
                    <div>
                      <p className="text-espresso text-sm font-medium">
                        {it.name}
                      </p>
                      {it.description && (
                        <p className="text-espresso-light/50 text-xs">
                          {it.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-espresso text-sm">
                        ×{it.quantity}　NT$ {it.price * it.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div
              className="flex justify-between items-baseline pt-3 mt-2"
              style={{ borderTop: "1px dashed rgba(30,15,8,0.15)" }}
            >
              <span className="text-espresso-light/60 text-xs tracking-widest">
                TOTAL
              </span>
              <span
                className="font-serif text-2xl font-bold text-rose"
                style={{ fontStyle: "italic" }}
              >
                NT$ {o.total}
              </span>
            </div>
          </div>
        </TimelineNode>

        <TimelineNode idx={2} title="收件" color="honey">
          <p className="text-espresso text-sm font-semibold">
            {o.customerName} · {o.phone}
          </p>
          <p className="text-espresso-light/60 text-sm mt-1">{o.email}</p>
          <p className="text-espresso text-sm mt-3">郵寄</p>
          <p className="text-espresso-light/60 text-sm">{o.address}</p>
        </TimelineNode>

        <TimelineNode idx={3} title="付款" color="sage">
          <p className="text-espresso text-sm">
            匯款 <span className="text-espresso-light/50">（送出後將收到匯款帳號）</span>
          </p>
        </TimelineNode>

        <TimelineNode idx={4} title="備註" color="espresso" last>
          <p className="text-espresso text-sm">{o.notes}</p>
        </TimelineNode>
      </div>

      <div className="flex gap-3 mt-10">
        <button
          className="flex-1 py-4 rounded-full font-serif font-bold text-base text-espresso-light"
          style={{ border: "2px solid rgba(30,15,8,0.15)" }}
        >
          返回修改
        </button>
        <button
          className="flex-[1.5] py-4 rounded-full text-white font-serif font-bold text-lg"
          style={{
            background:
              "linear-gradient(135deg, var(--color-rose), var(--color-rose-dark))",
            boxShadow: "0 8px 24px rgba(196,80,106,0.35)",
          }}
        >
          確認送出 ♥
        </button>
      </div>
    </div>
  );
}

function TimelineNode({
  idx,
  title,
  color,
  children,
  last,
}: {
  idx: number;
  title: string;
  color: "rose" | "honey" | "sage" | "espresso";
  children: React.ReactNode;
  last?: boolean;
}) {
  const bg = {
    rose: "var(--color-rose)",
    honey: "var(--color-honey)",
    sage: "var(--color-sage)",
    espresso: "var(--color-espresso)",
  }[color];
  return (
    <div className={last ? "" : "mb-8"}>
      <div
        className="absolute -left-1 w-10 h-10 rounded-full flex items-center justify-center font-serif text-white font-bold"
        style={{
          background: bg,
          boxShadow: "0 4px 12px rgba(30,15,8,0.15)",
        }}
      >
        {idx}
      </div>
      <h3 className="font-serif text-lg font-bold text-espresso mb-2 ml-2">
        {title}
      </h3>
      <div
        className="p-4 rounded-2xl ml-2"
        style={{
          background: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(30,15,8,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Design 5 — 手感拼貼（紙膠帶 + 便利貼）
   ═══════════════════════════════════════════════════ */

function Design5() {
  const o = SAMPLE_ORDER;
  const grouped = groupItems(o.items);
  return (
    <div
      className="max-w-2xl mx-auto px-5 py-12 rounded-3xl relative"
      style={{
        background: "#fbf3e4",
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(196,80,106,0.05) 0, transparent 40%), radial-gradient(circle at 90% 80%, rgba(200,149,48,0.06) 0, transparent 40%)",
      }}
    >
      {/* 裝飾紙膠帶 */}
      <div
        className="absolute top-5 -left-3 w-40 h-6 -rotate-[8deg] opacity-80 hidden md:block"
        style={{
          background:
            "repeating-linear-gradient(135deg, var(--color-rose) 0 10px, var(--color-rose-light) 10px 20px)",
        }}
      />
      <div
        className="absolute top-8 -right-2 w-32 h-5 rotate-[6deg] opacity-70 hidden md:block"
        style={{
          background:
            "repeating-linear-gradient(135deg, var(--color-honey) 0 8px, var(--color-honey-light) 8px 16px)",
        }}
      />

      <div className="text-center mb-8 relative z-10">
        <div
          className="inline-block px-6 py-3 rounded-2xl -rotate-1 mb-4"
          style={{
            background: "#fff",
            boxShadow: "3px 3px 0 var(--color-espresso)",
            border: "2px solid var(--color-espresso)",
          }}
        >
          <p className="text-rose font-bold text-sm tracking-widest">
            ♥ CHECK & SEND ♥
          </p>
        </div>
        <h1
          className="font-serif text-3xl md:text-4xl font-bold text-espresso"
          style={{ fontStyle: "italic" }}
        >
          檢查一下再出發！
        </h1>
      </div>

      {/* 便利貼 1：商品 */}
      <div
        className="p-5 mb-5 rotate-[-0.6deg] relative"
        style={{
          background: "#fff8d6",
          boxShadow: "4px 4px 0 rgba(30,15,8,0.08)",
          border: "1.5px solid rgba(30,15,8,0.1)",
        }}
      >
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold tracking-widest"
          style={{
            background: "var(--color-rose)",
            color: "#fff",
            transform: "translateX(-50%) rotate(-2deg)",
          }}
        >
          ITEMS
        </span>
        <h2 className="font-serif text-lg font-bold text-espresso mb-3">
          🍓 你選的商品
        </h2>
        {Object.entries(grouped).map(([g, items]) => (
          <div key={g} className="mb-3">
            <p className="inline-block px-2 py-0.5 text-[10px] font-bold bg-espresso text-white rounded mb-1.5">
              {g}
            </p>
            {items.map((it) => (
              <div
                key={it.productId}
                className="flex items-start justify-between gap-3 py-1.5"
                style={{ borderBottom: "1.5px dotted rgba(30,15,8,0.15)" }}
              >
                <div>
                  <p className="text-espresso font-semibold text-sm">
                    {it.name}
                  </p>
                  {it.description && (
                    <p className="text-espresso-light/60 text-xs italic">
                      ✎ {it.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-espresso text-sm font-bold">
                    ×{it.quantity}
                  </p>
                  <p className="text-rose text-sm font-bold">
                    ${it.price * it.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-baseline justify-end gap-3 mt-3">
          <span className="text-espresso-light/60 text-xs line-through">
            NT$ {o.subtotal}
          </span>
          <span className="text-rose text-xs">
            -NT$ {o.discountAmount}
          </span>
          <span
            className="font-serif text-3xl font-bold text-espresso px-3 py-1 -rotate-1 inline-block"
            style={{
              background: "var(--color-honey-light)",
              fontStyle: "italic",
            }}
          >
            NT$ {o.total}
          </span>
        </div>
      </div>

      {/* 便利貼 2：收件 */}
      <div
        className="p-5 mb-5 rotate-[0.5deg] relative"
        style={{
          background: "#e6f4e6",
          boxShadow: "4px 4px 0 rgba(30,15,8,0.08)",
          border: "1.5px solid rgba(30,15,8,0.1)",
        }}
      >
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold tracking-widest"
          style={{
            background: "var(--color-sage)",
            color: "#fff",
            transform: "translateX(-50%) rotate(2deg)",
          }}
        >
          SHIP TO
        </span>
        <h2 className="font-serif text-lg font-bold text-espresso mb-3">
          📮 寄去哪裡
        </h2>
        <div className="space-y-1.5 text-sm">
          <p>
            <span className="text-espresso-light/60">收件人 ✎ </span>
            <span className="text-espresso font-semibold">
              {o.customerName}
            </span>
          </p>
          <p>
            <span className="text-espresso-light/60">電話 ✎ </span>
            <span className="text-espresso">{o.phone}</span>
          </p>
          <p>
            <span className="text-espresso-light/60">Email ✎ </span>
            <span className="text-espresso">{o.email}</span>
          </p>
          <p>
            <span className="text-espresso-light/60">地址 ✎ </span>
            <span className="text-espresso">{o.address}</span>
          </p>
          <p>
            <span className="text-espresso-light/60">付款 ✎ </span>
            <span className="inline-block px-2 py-0.5 bg-espresso text-white text-xs rounded">
              匯款
            </span>
          </p>
        </div>
      </div>

      {/* 便利貼 3：備註 */}
      {o.notes && (
        <div
          className="p-4 mb-6 rotate-[-0.4deg] relative"
          style={{
            background: "#ffe4e8",
            boxShadow: "4px 4px 0 rgba(30,15,8,0.08)",
            border: "1.5px solid rgba(30,15,8,0.1)",
          }}
        >
          <span
            className="absolute -top-3 left-4 px-3 py-0.5 text-[10px] font-bold tracking-widest rotate-[-4deg]"
            style={{ background: "var(--color-wine)", color: "#fff" }}
          >
            NOTE
          </span>
          <p className="text-espresso italic">"{o.notes}"</p>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-4 font-serif font-bold text-base text-espresso rotate-[-0.5deg]"
          style={{
            background: "#fff",
            border: "2px solid var(--color-espresso)",
            boxShadow: "3px 3px 0 var(--color-espresso)",
          }}
        >
          ✎ 返回修改
        </button>
        <button
          className="flex-[1.3] py-4 font-serif font-bold text-lg text-white rotate-[0.5deg]"
          style={{
            background: "var(--color-rose)",
            border: "2px solid var(--color-espresso)",
            boxShadow: "3px 3px 0 var(--color-espresso)",
          }}
        >
          ♥ 送出訂單！
        </button>
      </div>
    </div>
  );
}
