// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl">
          <svg
            className="absolute inset-0 h-full w-full [mask-image:radial-gradient(#3b82f6_30%,transparent_100%)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="pattern-circles"
                x="50%"
                y="50%"
                width="200"
                height="200"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="64"
                  fill="rgba(59, 130, 246, 0.3)"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern-circles)" />
          </svg>
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:pt-40 lg:pb-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <div className="inline-flex space-x-6">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold leading-6 text-blue-500 ring-1 ring-inset ring-blue-500/20">
                  Nowość
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600 dark:text-gray-400">
                  <span>Wersja 1.0 dostępna</span>
                </span>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Twój osobisty asystent inwestycyjny dla memcoinów
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Memcoin Tracker to zaawansowane narzędzie analityczne, które
              pomoże Ci identyfikować memcoiny z największym potencjałem
              wzrostu. Łączymy analizę techniczną z sentymentem społeczności, by
              dostarczyć Ci kompleksowy obraz rynku.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Rozpocznij za darmo
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Zobacz demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  src="/images/dashboard-screenshot.png"
                  alt="Dashboard aplikacji"
                  width={1280}
                  height={720}
                  className="w-[62rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Zaawansowana analityka
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Wszystko czego potrzebujesz do analizy memcoinów
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Nasza platforma łączy dane z giełd kryptowalut, mediów
            społecznościowych i blockchainów, aby dostarczyć Ci kompletny obraz
            sytuacji każdego memcoina.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                    />
                  </svg>
                </div>
                Zaawansowana predykcja
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  Nasz wieloczynnikowy model predykcyjny ocenia potencjał
                  memcoinów, analizując dane techniczne, sentyment społeczności
                  i inne kluczowe metryki.
                </p>
                <p className="mt-6">
                  <Link
                    href="/dashboard"
                    className="text-sm font-semibold leading-6 text-blue-600"
                  >
                    Zobacz rankingi <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                Analiza sentymentu
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  Monitorujemy nastroje inwestorów na Twitterze, Reddicie i
                  innych platformach, aby wychwycić wczesne sygnały zmian
                  rynkowych.
                </p>
                <p className="mt-6">
                  <Link
                    href="/dashboard"
                    className="text-sm font-semibold leading-6 text-blue-600"
                  >
                    Sprawdź analizę <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                  </svg>
                </div>
                Inteligentne alerty
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  Otrzymuj powiadomienia o nagłych zmianach cen, skokach
                  wolumenu i wzrostach aktywności społeczności dla obserwowanych
                  memcoinów.
                </p>
                <p className="mt-6">
                  <Link
                    href="/alerts"
                    className="text-sm font-semibold leading-6 text-blue-600"
                  >
                    Skonfiguruj alerty <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
          <h2 className="text-base font-semibold leading-8 text-blue-600">
            Nasze statystyki
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Dane, które mówią same za siebie
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Memcoin Tracker nieustannie analizuje rynek, dostarczając
            najświeższe informacje i pomagając inwestorom podejmować lepsze
            decyzje.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          <div className="flex flex-col gap-y-3 border-l border-gray-900/10 dark:border-white/10 pl-6">
            <dt className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Śledzonych memcoinów
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              500+
            </dd>
          </div>
          <div className="flex flex-col gap-y-3 border-l border-gray-900/10 dark:border-white/10 pl-6">
            <dt className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Analizowanych wzmianek dziennie
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              10,000+
            </dd>
          </div>
          <div className="flex flex-col gap-y-3 border-l border-gray-900/10 dark:border-white/10 pl-6">
            <dt className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Dokładność predykcji
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              87%
            </dd>
          </div>
          <div className="flex flex-col gap-y-3 border-l border-gray-900/10 dark:border-white/10 pl-6">
            <dt className="text-sm leading-6 text-gray-600 dark:text-gray-400">
              Aktywnych użytkowników
            </dt>
            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              2,500+
            </dd>
          </div>
        </dl>
      </div>

      {/* CTA Section */}
      <div className="mx-auto mt-24 max-w-7xl sm:mt-40 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Gotowy, by podjąć lepsze decyzje inwestycyjne?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-gray-300">
            Dołącz do społeczności inwestorów, którzy wykorzystują zaawansowaną
            analizę danych do identyfikacji najlepszych memcoinów z potencjałem
            wzrostu.
          </p>
          <div className="mx-auto mt-10 flex max-w-md gap-x-4 justify-center">
            <Link
              href="/auth/register"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Zarejestruj się za darmo
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-white/20 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Zobacz demo
            </Link>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle
              cx={512}
              cy={512}
              r={512}
              fill="url(#gradient)"
              fillOpacity="0.15"
            />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="#3b82f6" />
                <stop offset={1} stopColor="#1d4ed8" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8 lg:py-40">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900 dark:text-white">
              Często zadawane pytania
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
              Nie znalazłeś odpowiedzi na swoje pytanie?{" "}
              <a
                href="mailto:support@memcoin-tracker.com"
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                Skontaktuj się z naszym zespołem
              </a>
            </p>
          </div>
          <div className="mt-10 lg:col-span-7 lg:mt-0">
            <dl className="space-y-10">
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Czym różni się Memcoin Tracker od innych narzędzi
                  kryptowalutowych?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  Memcoin Tracker skupia się wyłącznie na segmencie memcoinów,
                  oferując specjalistyczną analizę łączącą dane techniczne z
                  analizą sentymentu społeczności. Nasze algorytmy są
                  dostosowane do specyfiki tego rynku, gdzie czynniki
                  społecznościowe odgrywają kluczową rolę.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Jak dokładne są wasze predykcje?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  Nasz model predykcyjny osiąga średnio 87% skuteczności w
                  identyfikacji memcoinów z potencjałem wzrostowym. Pamiętaj
                  jednak, że rynek kryptowalut jest bardzo nieprzewidywalny i
                  żadne narzędzie nie może zagwarantować zysków.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Czy mogę zintegrować Memcoin Tracker z moim portfelem?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  Obecnie oferujemy ręczne śledzenie portfolio, bez
                  bezpośredniej integracji z portfelami. Planujemy dodać tę
                  funkcjonalność w przyszłych aktualizacjach.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  Czy aplikacja jest dostępna na urządzenia mobilne?
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  Nasza aplikacja jest w pełni responsywna i działa na
                  wszystkich urządzeniach. Dedykowana aplikacja mobilna jest w
                  fazie rozwoju i będzie dostępna wkrótce.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="border-t border-gray-900/10 dark:border-gray-700 pt-6">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Zastrzeżenie: Memcoin Tracker jest narzędziem analitycznym i nie
            stanowi porady inwestycyjnej. Inwestowanie w memcoiny wiąże się z
            wysokim ryzykiem. Zawsze przeprowadzaj własne badania przed
            podjęciem decyzji inwestycyjnych.
          </p>
        </div>
      </div>
    </div>
  );
}
