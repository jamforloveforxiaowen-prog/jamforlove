"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const DEFAULT_ABOUT = `「Jam for Love」是一個由「國立暨南大學國際文教與比較教育系」師生所共同組成的募資團隊。我們的起心動念很單純：在這個社會的許多角落，有許多非營利組織（NGO與NPO）正默默耕耘，無論是陪伴弱勢孩童、推動教育發展，或是傳遞和平與善意，他們總是無私地奉獻著自己的專業與時間。

我們深知，這些走在第一線的助人工作者，經常面臨資源匱乏的挑戰。因此，我們希望自己能成為一份溫柔而堅定的陪伴力量。團隊裡的老師與同學們會聚在一起，用心熬煮出一罐罐純粹、甜蜜的果醬。我們期盼透過這份手作的溫度，集結社會大眾的關懷，將這些點滴心意轉化為實質的支持，交到那些持續在助人道路上努力的組織手中，讓他們在付出的同時，也能感受到被照顧的溫暖。

這份透過果醬傳遞愛的行動，即將邁入充滿意義的第十年。十年來，我們不求成為耀眼的光，只願做那陣輕柔的風，為助人者輕輕推動前行的風帆。每一罐果醬，都承載著我們對這片土地的祝福。我們誠摯地邀請您，與我們一起品嚐這份甜蜜，讓這股溫柔的力量持續陪伴更多 NGO 與 NPO，在帶來希望的道路上走得更穩、更長遠。`;

export default function Footer() {
  const pathname = usePathname();
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    fetch("/api/site-settings?key=about")
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setAboutText(data.value);
      })
      .catch(() => {});
  }, []);

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <footer className="border-t border-linen-dark/60">
      {/* 關於我們 */}
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-10 text-center">
        <ScrollReveal>
          <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            About Us
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso mb-5">
            關於我們
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="text-espresso-light text-base leading-relaxed font-serif whitespace-pre-line">
            {aboutText}
          </div>
        </ScrollReveal>
      </div>

      <div className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-linen-dark to-transparent" />

      <ScrollReveal className="max-w-6xl mx-auto px-6 py-14 flex flex-col items-center gap-5">
        <Image
          src="/logo.jpg"
          alt="Jam For Love"
          width={48}
          height={48}
          className="rounded-full"
        />
        <p
          className="text-espresso text-lg tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          Jam For Love
        </p>
        <a
          href="https://www.facebook.com/groups/229394627478779/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] hover:scale-110 transition-all duration-300 shadow-sm"
          aria-label="Facebook 社團"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <p className="text-espresso-light/40 text-xs tracking-wide">
          用愛手工熬煮 &middot; {new Date().getFullYear()}
        </p>
      </ScrollReveal>
    </footer>
  );
}
