"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, LogOut, User, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/bounties", label: "Bounties" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/how-it-works", label: "How It Works" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect scroll for navbar shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [profileOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl transition-all duration-300",
      scrolled ? "border-border shadow-lg shadow-black/20" : "border-transparent"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Zap className="h-4 w-4 text-accent transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-mono text-lg font-bold tracking-tight">
              vibe<span className="text-accent">bounty</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm transition-colors rounded-lg",
                  pathname === link.href || pathname?.startsWith(link.href + "/")
                    ? "text-foreground"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                )}
              >
                {link.label}
                {(pathname === link.href || pathname?.startsWith(link.href + "/")) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-border animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                    profileOpen ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-7 h-7 rounded-full border border-border"
                  />
                  <span className="text-sm font-mono max-w-[100px] truncate">{user.username}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", profileOpen && "rotate-180")} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40 z-50 overflow-hidden animate-fade-in-down" style={{ animationDuration: "0.15s" }}>
                    <div className="p-3 border-b border-border">
                      <p className="font-mono text-sm font-medium truncate">{user.display_name || user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || `@${user.username}`}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
                      </Link>
                      <Link href={`/profile/${user.username}`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                        <User className="w-4 h-4 text-muted-foreground" /> Profile
                      </Link>
                      <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                        <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                      </Link>
                      <div className="my-1 border-t border-border" />
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-500/10 rounded-lg transition-colors w-full text-left text-red-400">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-fade-in-down" style={{ animationDuration: "0.2s" }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-4 py-3 text-sm rounded-lg transition-colors",
                  pathname === link.href
                    ? "text-foreground bg-white/5 border-l-2 border-accent"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.username}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border border-border"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium truncate">{user.display_name || user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || `@${user.username}`}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="block px-4 py-3 text-sm text-muted hover:text-foreground rounded-lg">
                    Dashboard
                  </Link>
                  <Link href={`/profile/${user.username}`} className="block px-4 py-3 text-sm text-muted hover:text-foreground rounded-lg">
                    Profile
                  </Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-3 text-sm text-red-400 rounded-lg">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-3 text-sm text-muted hover:text-foreground rounded-lg">
                    Log in
                  </Link>
                  <Link href="/signup" className="block px-4 py-3 text-sm text-center font-medium bg-accent rounded-lg text-white">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
