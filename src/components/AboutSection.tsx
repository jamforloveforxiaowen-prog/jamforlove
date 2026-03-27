"use client";

import { useEffect, useState } from "react";

export default function AboutSection() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/site-settings?key=about")
      .then((res) => res.json())
      .then((data) => setContent(data.value || ""))
      .catch(() => {});
  }, []);

  if (!content) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-rose text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            About Us
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-espresso">
            關於我們
          </h2>
          <div className="w-12 h-[2px] bg-rose mt-5 mx-auto" />
        </div>
        <div
          className="text-espresso-light/70 text-[0.95rem] leading-[1.9] whitespace-pre-line max-w-2xl mx-auto"
        >
          {content}
        </div>
      </div>
    </section>
  );
}
