export default function StoryPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-12 animate-reveal-up">
        <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Our Story
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso">
          果醬的故事
        </h1>
        <div className="w-16 h-[2px] bg-rose mt-5" />
      </div>

      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-5xl mb-6 animate-float">
            <span role="img" aria-label="果醬">🍯</span>
          </p>
          <p className="text-espresso-light text-lg font-serif">
            Coming Soon — 敬請期待
          </p>
        </div>
      </div>
    </div>
  );
}
