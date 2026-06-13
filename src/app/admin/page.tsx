import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, BarChart3, RefreshCw, Settings } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/admin");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  const [{ count: usersCount },{ count: matchesCount },{ count: predictionsCount },{ count: finishedCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("predictions").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "finished"),
  ]);

  const adminCards = [
    { href: "/admin/matches", icon: Calendar, label: "Gérer les matchs", desc: `${matchesCount ?? 0} matchs · ${finishedCount ?? 0} terminés`, color: "text-pitch-400", bg: "bg-pitch-900/30 border-pitch-700/40" },
    { href: "/admin/users", icon: Users, label: "Gérer les utilisateurs", desc: `${usersCount ?? 0} participants inscrits`, color: "text-blue-400", bg: "bg-blue-900/20 border-blue-700/30" },
    { href: "/admin/results", icon: BarChart3, label: "Saisir les résultats", desc: `${(matchesCount ?? 0) - (finishedCount ?? 0)} matchs en attente`, color: "text-gold-400", bg: "bg-gold-900/20 border-gold-700/30" },
    { href: "/admin/recalculate", icon: RefreshCw, label: "Recalculer classement", desc: `${predictionsCount ?? 0} pronostics au total`, color: "text-purple-400", bg: "bg-purple-900/20 border-purple-700/30" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide flex items-center gap-3">
          <Settings size={28} className="text-gold-400" />ADMINISTRATION
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gestion du concours de pronostics</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Participants", value: usersCount ?? 0, color: "text-pitch-400" },
          { label: "Matchs", value: matchesCount ?? 0, color: "text-blue-400" },
          { label: "Pronostics", value: predictionsCount ?? 0, color: "text-gold-400" },
          { label: "Terminés", value: finishedCount ?? 0, color: "text-green-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {adminCards.map(({ href, icon: Icon, label, desc, color, bg }) => (
          <Link key={href} href={href} className={`card-hover border ${bg} flex items-center gap-4`}>
            <div className="p-3 rounded-xl bg-surface-900/50 border border-surface-600">
              <Icon size={22} className={color} />
            </div>
            <div>
              <div className="font-semibold text-white">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
