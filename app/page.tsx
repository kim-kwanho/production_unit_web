import Image from "next/image";
import Link from "next/link";
import { IconFactory, IconOop } from "@/components/layout/NavIcons";

const MODULES = [
  {
    href: "/oop-lab",
    title: "OOP Lab",
    description:
      "가까이 가면 스펙, 클릭하면 P1 process()가 실행됩니다. 클래스마다 다른 결과를 Activity Log로 비교하세요.",
    Icon: IconOop,
  },
  {
    href: "/dashboard",
    title: "Factory Dashboard",
    description:
      "생산 라인을 구성하고 실행하세요. 맵·효율·로그로 병목과 실패 지점을 한눈에 봅니다.",
    Icon: IconFactory,
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100dvh-var(--app-header-h))] overflow-hidden">
      <Image
        src="/images/factory-bg.svg"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover opacity-20 dark:opacity-25"
        priority
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/95 via-slate-50/90 to-slate-100/95 dark:from-slate-950/95 dark:via-slate-950/90 dark:to-slate-950"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-full max-w-3xl flex-col justify-center px-5 py-16 sm:px-8 sm:py-24">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Smart Factory
          </h1>
          <p className="mt-3 text-lg text-slate-500 sm:text-xl dark:text-slate-400">
            OOP를 실행하고, 생산 라인을 돌려보세요
          </p>
        </header>

        <section
          className="mt-14 sm:mt-20"
          aria-labelledby="modules-heading"
        >
          <h2 id="modules-heading" className="sr-only">
            모듈 선택
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            {MODULES.map((mod) => {
              const Icon = mod.Icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80 p-7 shadow-sm transition-[border-color,box-shadow,background-color] duration-300 hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800/80 dark:from-slate-900/90 dark:to-slate-900/50 dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-500/10 dark:focus-visible:ring-offset-slate-950 sm:p-8"
                >
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-emerald-400/10"
                    aria-hidden
                  />

                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/15 transition-colors duration-300 group-hover:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-400/20"
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                  </span>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {mod.title}
                  </h3>

                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {mod.description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors group-hover:text-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                    열기
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
