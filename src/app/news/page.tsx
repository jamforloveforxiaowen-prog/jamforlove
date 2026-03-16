export default function NewsPage() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-5xl mb-6 animate-float">
          <span role="img" aria-label="即將推出">📣</span>
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-espresso mb-4">
          最新消息
        </h1>
        <p className="text-espresso-light text-lg font-serif">
          Coming Soon — 敬請期待
        </p>
      </div>
    </section>
  );
}
