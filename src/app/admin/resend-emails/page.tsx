"use client";

import { useEffect, useState } from "react";

interface PickupOrderSummary {
  id: number;
  customerName: string;
  email: string;
  address: string;
  total: number;
  createdAt: string;
  hasEmail: boolean;
}

interface ListResponse {
  count: number;
  withEmail: number;
  orders: PickupOrderSummary[];
}

interface SendResult {
  orderId: number;
  email: string;
  ok: boolean;
  error?: string;
}

interface SendResponse {
  total: number;
  sent: number;
  failed: number;
  results: SendResult[];
}

const API_PATH = "/api/admin/resend-pickup-confirmations";

export default function ResendEmailsPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_PATH);
        if (!res.ok) {
          setError(res.status === 403 ? "請先登入管理員" : `讀取失敗 (${res.status})`);
          return;
        }
        setData(await res.json());
      } catch {
        setError("網路錯誤");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSendAll() {
    if (!data) return;
    const confirmMsg = `即將寄出 ${data.withEmail} 封「更正版」訂單確認信給所有面交訂戶，確定嗎？`;
    if (!window.confirm(confirmMsg)) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "寄送失敗");
      } else {
        setResult(json);
      }
    } catch {
      setError("網路錯誤");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-espresso-light/60">
        載入中...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-8">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Admin Tool
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso mb-3">
          面交訂單確認信補寄
        </h1>
        <p className="text-espresso-light/70 text-base leading-relaxed">
          先前寄出的確認信，「取貨方式」欄位固定顯示為「面交 / 暨大取貨」，未呈現用戶實際選擇的地點。此工具會將所有面交訂單的確認信以「更正版」標題重新寄送，內含完整且正確的訂單資訊。
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-rose/10 border-2 border-rose/30 px-5 py-4 text-rose text-sm">
          {error}
        </div>
      )}

      {data && !result && (
        <>
          <div className="rounded-xl bg-linen-dark/20 border-2 border-dashed border-espresso-light/15 px-6 py-5 mb-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-espresso-light/50">面交訂單總數：</span>
                <span className="text-espresso font-semibold text-lg ml-1">{data.count}</span>
              </div>
              <div>
                <span className="text-espresso-light/50">有 Email 可寄送：</span>
                <span className="text-espresso font-semibold text-lg ml-1">{data.withEmail}</span>
              </div>
              <div>
                <span className="text-espresso-light/50">無 Email（會跳過）：</span>
                <span className="text-espresso-light/70 font-semibold text-lg ml-1">
                  {data.count - data.withEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-xl font-semibold text-espresso mb-3">
              訂單清單
            </h2>
            <div className="overflow-x-auto rounded-xl border-2 border-espresso-light/10">
              <table className="w-full text-sm">
                <thead className="bg-linen-dark/20">
                  <tr className="text-left text-espresso-light/60 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">姓名</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">面交地點</th>
                    <th className="px-4 py-3 text-right">金額</th>
                    <th className="px-4 py-3">建立時間</th>
                    <th className="px-4 py-3 text-center">預覽</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr key={o.id} className="border-t border-espresso-light/10">
                      <td className="px-4 py-3 text-espresso-light/60">{o.id}</td>
                      <td className="px-4 py-3 text-espresso">{o.customerName}</td>
                      <td className="px-4 py-3 text-espresso-light/80">
                        {o.email || <span className="text-rose/70">（無）</span>}
                      </td>
                      <td className="px-4 py-3 text-espresso">{o.address}</td>
                      <td className="px-4 py-3 text-right text-espresso font-medium">
                        NT$ {o.total}
                      </td>
                      <td className="px-4 py-3 text-espresso-light/60 text-xs">
                        {o.createdAt}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {o.hasEmail ? (
                          <a
                            href={`${API_PATH}?preview=${o.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-rose hover:underline text-sm"
                          >
                            查看
                          </a>
                        ) : (
                          <span className="text-espresso-light/30 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {data.orders.length > 0 && (
              <a
                href={`${API_PATH}?preview=first`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl border-2 border-espresso-light/20 text-espresso hover:bg-linen-dark/30 transition-all text-base font-medium"
              >
                預覽第一封
              </a>
            )}
            <button
              type="button"
              onClick={handleSendAll}
              disabled={sending || data.withEmail === 0}
              className="px-6 py-3 rounded-xl bg-rose text-white hover:bg-rose/90 transition-all text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "寄送中…" : `全部寄出（${data.withEmail} 封）`}
            </button>
          </div>
        </>
      )}

      {result && (
        <div className="rounded-xl bg-white border-2 border-dashed border-espresso-light/15 px-6 py-6">
          <h2 className="font-serif text-xl font-semibold text-espresso mb-4">
            寄送結果
          </h2>
          <div className="flex gap-6 mb-4 text-sm">
            <div>
              <span className="text-espresso-light/50">總數：</span>
              <span className="text-espresso font-semibold">{result.total}</span>
            </div>
            <div>
              <span className="text-espresso-light/50">成功：</span>
              <span className="text-sage font-semibold">{result.sent}</span>
            </div>
            <div>
              <span className="text-espresso-light/50">失敗：</span>
              <span className="text-rose font-semibold">{result.failed}</span>
            </div>
          </div>
          {result.failed > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-rose mb-2">失敗訂單：</p>
              <ul className="text-sm text-espresso-light/80 space-y-1">
                {result.results
                  .filter((r) => !r.ok)
                  .map((r) => (
                    <li key={r.orderId}>
                      #{r.orderId} {r.email || "(無 email)"} — {r.error}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
