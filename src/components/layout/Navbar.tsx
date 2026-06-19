"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Calendar, List, LogOut, LogIn, Shield, User, Grid3x3, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { href: "/", label: "Accueil", icon: Trophy },
  { href: "/matches", label: "Matchs", icon: Calendar },
  { href: "/classement-groupes", label: "Groupes", icon: Grid3x3 },
  { href: "/ranking", label: "Classement", icon: List },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("À bientôt !");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-900/90 backdrop-blur-md border-b border-surface-700">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-pitch-600 rounded-lg flex items-center justify-center group-hover:bg-pitch-500 transition-colors">
              <span className="text-lg leading-none">⚽</span>
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white hidden sm:block">
              CdM <span className="text-pitch-400">2026</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-pitch-600/20 text-pitch-400 border border-pitch-600/30"
                    : "text-gray-400 hover:text-gray-100 hover:bg-surface-700"
                )}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                    : "text-gray-400 hover:text-gray-100 hover:bg-surface-700"
                )}
              >
                <Shield size={15} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface-600 animate-pulse" />
            ) : user && profile ? (
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 btn-ghost">
                  <div className="w-7 h-7 rounded-full bg-pitch-700 flex items-center justify-center">
                    <User size={14} className="text-pitch-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden sm:block">
                    {profile.pseudo}
                  </span>
                </Link>
                <button onClick={handleSignOut} className="btn-ghost p-1.5" title="Déconnexion">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-1.5 btn-primary text-sm py-1.5">
                <LogIn size={15} />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}