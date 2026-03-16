import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-linen-dark/60">
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
        <p className="text-espresso-light/40 text-xs tracking-wide">
          用愛手工熬煮 &middot; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
