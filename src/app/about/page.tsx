export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          About Us
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          關於我們
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
      </div>

      <div className="max-w-3xl">
        <p className="text-espresso-light text-lg leading-relaxed font-serif">
          「Jam for Love」是一個由國立暨南大學國際文教與比較教育系師/生所共同組成的募資團隊。成立之目的在於，希望集結眾人之關懷，協助不同NGO、NPO持續在其助人專業上努力。
        </p>
      </div>
    </div>
  );
}
