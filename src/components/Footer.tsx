import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-linen-dark/60">
      {/* 關於我們 */}
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-10 text-center">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          About Us
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-espresso mb-5">
          關於我們
        </h2>
        <p className="text-espresso-light text-base leading-relaxed font-serif mb-5">
          「Jam for Love」是一個由國立暨南大學國際文教與比較教育系師/生所共同組成的募資團隊。成立之目的在於，希望集結眾人之關懷，協助不同NGO、NPO持續在其助人專業上努力。
        </p>
        <Link
          href="/about"
          className="text-rose text-sm font-medium hover:text-rose-dark transition-colors duration-250"
        >
          瞭解更多 &rarr;
        </Link>
      </div>

      <div className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-linen-dark to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col items-center gap-5">
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
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5] transition-all duration-300 shadow-sm"
          aria-label="Facebook 社團"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <p className="text-espresso-light/40 text-xs tracking-wide">
          用愛手工熬煮 &middot; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
