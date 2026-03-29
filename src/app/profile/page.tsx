"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TaiwanAddressSelector from "@/components/TaiwanAddressSelector";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromOrder = searchParams.get("from") === "order";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) { router.push("/login"); return; }
        const u = data.user;
        setName(u.name || "");
        setPhone(u.phone || "");
        setEmail(u.email || "");
        // 解析地址：嘗試拆分 "郵遞區號 縣市 區域 詳細地址"
        if (u.address) parseAddress(u.address);
        setLoading(false);
      })
      .catch(() => { router.push("/login"); });
  }, [router]);

  function parseAddress(addr: string) {
    // 嘗試匹配 "XXX 縣市 區域 詳細地址" 或 "縣市區域詳細地址"
    const zipMatch = addr.match(/^(\d{3})\s*/);
    if (zipMatch) {
      setZipcode(zipMatch[1]);
      addr = addr.slice(zipMatch[0].length);
    }
    // 嘗試匹配縣市
    const cityMatch = addr.match(/^([\u4e00-\u9fff]{2,3}[市縣])/);
    if (cityMatch) {
      setCity(cityMatch[1]);
      addr = addr.slice(cityMatch[0].length);
      // 嘗試匹配區域
      const distMatch = addr.match(/^([\u4e00-\u9fff]{2,4}[區鄉鎮市])/);
      if (distMatch) {
        setDistrict(distMatch[1]);
        addr = addr.slice(distMatch[0].length);
      }
    }
    setDetail(addr.trim());
  }

  const handleChangeZipcode = useCallback((v: string) => setZipcode(v), []);
  const handleChangeCity = useCallback((v: string) => setCity(v), []);
  const handleChangeDistrict = useCallback((v: string) => setDistrict(v), []);
  const handleChangeDetail = useCallback((v: string) => setDetail(v), []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const fullAddress = city && district
      ? `${zipcode} ${city}${district}${detail}`.trim()
      : detail;

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, address: fullAddress }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "儲存失敗");
      } else {
        setSaved(true);
        if (fromOrder) {
          // 從訂購頁來的，儲存後自動跳回
          setTimeout(() => router.push("/order"), 800);
        } else {
          setTimeout(() => setSaved(false), 3000);
        }
      }
    } catch {
      setError("網路連線失敗");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-espresso-light/50">載入中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-10 md:py-16">
      <div className="text-center mb-10 animate-reveal-up">
        <h1 className="font-serif text-3xl font-bold text-espresso" style={{ fontStyle: "italic" }}>個人資料</h1>
        <p className="text-espresso-light/40 text-base mt-1">儲存後訂購時會自動帶入</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="w-10 h-px bg-rose/30" />
          <span className="text-rose text-sm">♥</span>
          <span className="w-10 h-px bg-rose/30" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-1">
        <div style={{ borderBottom: "2px dashed rgba(30,15,8,0.12)" }} className="focus-within:[border-bottom-color:var(--color-rose)]">
          <label className="block text-xs font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">姓名</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full py-3 px-0 bg-transparent text-base text-espresso outline-none placeholder:text-espresso-light/30" required />
        </div>

        <div style={{ borderBottom: "2px dashed rgba(30,15,8,0.12)" }} className="focus-within:[border-bottom-color:var(--color-rose)]">
          <label className="block text-xs font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">電話</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full py-3 px-0 bg-transparent text-base text-espresso outline-none placeholder:text-espresso-light/30" placeholder="手機或市話" />
        </div>

        <div style={{ borderBottom: "2px dashed rgba(30,15,8,0.12)" }} className="focus-within:[border-bottom-color:var(--color-rose)]">
          <label className="block text-xs font-semibold tracking-wider uppercase text-espresso-light/40 pt-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-3 px-0 bg-transparent text-base text-espresso outline-none placeholder:text-espresso-light/30" />
        </div>

        <div className="pt-4">
          <label className="block text-xs font-semibold tracking-wider uppercase text-espresso-light/40 mb-2">收件地址</label>
          <TaiwanAddressSelector
            zipcode={zipcode} city={city} district={district} detail={detail}
            onChangeZipcode={handleChangeZipcode} onChangeCity={handleChangeCity}
            onChangeDistrict={handleChangeDistrict} onChangeDetail={handleChangeDetail}
          />
        </div>

        {error && <p className="text-rose text-sm font-medium animate-shake pt-2">{error}</p>}

        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-rose text-white font-serif font-bold text-base rounded-lg transition-all hover:bg-rose-dark active:scale-[0.98] disabled:opacity-40"
            style={{ border: "2px dashed rgba(196,80,106,0.3)" }}
          >
            {saving ? "儲存中..." : saved ? "✓ 已儲存" : "儲存資料"}
          </button>
        </div>
      </form>
    </div>
  );
}
