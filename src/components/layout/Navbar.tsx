// src/components/layout/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Aktualizuj stan przewijania
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Zamknij menu mobilne po zmianie ścieżki
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const isLinkActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav
      className={`fixed w-full z-10 transition-all duration-200 ${
        isScrolled
          ? "bg-white dark:bg-gray-800 shadow"
          : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MemTracker
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isLinkActive("/dashboard")
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/portfolio"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isLinkActive("/portfolio")
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Portfolio
              </Link>
              <Link
                href="/alerts"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isLinkActive("/alerts")
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Alerty
              </Link>
            </div>
          </div>

          {/* Right Side Navigation Elements */}
          <div className="flex items-center">
            {status === "authenticated" ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center max-w-xs text-sm focus:outline-none"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Otwórz menu użytkownika</span>
                    {session.user?.image ? (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {session.user?.name?.charAt(0) ||
                            session.user?.email?.charAt(0) ||
                            "U"}
                        </span>
                      </div>
                    )}
                    <span className="hidden md:block ml-2 text-gray-700 dark:text-gray-300">
                      {session.user?.name || session.user?.email}
                    </span>
                    <svg
                      className="ml-1 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <Link
                      href="/settings/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      Profil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      Ustawienia
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            ) : status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : (
              <div className="flex items-center md:space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logowanie
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden md:block px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
                >
                  Rejestracja
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="ml-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Otwórz menu główne</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 border-t dark:border-gray-700">
          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isLinkActive("/dashboard")
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/portfolio"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isLinkActive("/portfolio")
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Portfolio
          </Link>
          <Link
            href="/alerts"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isLinkActive("/alerts")
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Alerty
          </Link>

          {status === "unauthenticated" && (
            <Link
              href="/auth/register"
              className="block px-3 py-2 rounded-md text-base font-medium bg-blue-500 text-white hover:bg-blue-600"
            >
              Rejestracja
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
