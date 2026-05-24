import Image from "next/image";
import Link from "next/link";

const CARDS = [
  {
    href: "/oop-lab",
    title: "OOP Lab 들어가기",
    description:
      "클래스를 눌러 보세요. 같은 process()도 기계마다 결과가 달라집니다.",
  },
  {
    href: "/dashboard",
    title: "공장 대시보드 열기",
    description:
      "생산 라인을 돌려 보세요. 막히면 어디서 멈췄는지 한눈에 보입니다.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden p-8">
      <Image
        src="/images/factory-bg.svg"
        alt=""
        fill
        className="object-cover opacity-40 dark:opacity-50"
        priority
      />
      <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/75" />

      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Smart Factory OOP
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          스마트 팩토리 생산 라인 — 상속과 다형성을 웹에서 체험합니다
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border border-slate-200/80 bg-white/90 p-6 text-left shadow-md backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-900/90 dark:hover:ring-1 dark:hover:ring-emerald-500/40"
            >
              <h2 className="flex items-center justify-between text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                {card.title}
                <span
                  className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500"
                  aria-hidden
                >
                  →
                </span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
