import { createClient } from "@/lib/supabase/server";
import type { Ranking, Profile } from "@/types";
import { Trophy, Star, Target, TrendingUp } from "lucide-react";

export const revalidate = 60;

export default async function RankingPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("rankings").select("*, profile:profiles(*)").order("total_points", { ascending: false }).order("exact_scores", { ascending: false }).order("correct_results", { ascending: false });
  const rankings = (data ?? []) as (Ranking & { profile: Profile })[];
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide flex items-center gap-3">
          <Trophy size={28} className="text-gold-400" />
          CLASSEMENT
        </h1>
        <p className="text-gray-500 text-sm mt-1">{rankings.length} participants</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_60px_60px_60px] gap-2 px-4 py-2 border-b border-surface-600 text-xs text-gray-500 uppercase tracking-wider font-semibold">
          <span>#</span>
          <span>Joueur</span>
          <span className="text-center">Points</span>
          <span className="text-center hidden sm:block">Exact</span>
          <span className="text-center hidden sm:block">Bons</span>
          <span className="text-center hidden sm:block">Nuls</span>
        </div>
        {rankings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy size={32} className="mx-auto mb-3 opacity-20" />
            <p>Le classement sera disponible dès les premiers pronostics.</p>
          </div>
        ) : (
          rankings.map((r, i) => {
            const isCurrentUser = r.user_id === user?.id;
            const rank = i + 1;
            return (
              <div key={r.id} className={`grid grid-cols-[40px_1fr_80px_60px_60px_60px] gap-2 px-4 py-3 border-b border-surface-700/50 last:border-0 transition-colors ${isCurrentUser ? "bg-pitch-900/25" : "hover:bg-surface-700/30"}`}>
                <div className={`flex items-center justify-center font-display font-bold ${rank === 1 ? "text-gold-400 text-xl" : rank === 2 ? "text-gray-300 text-lg" : rank === 3 ? "text-amber-600 text-lg" : "text-gray-500"}`}>
                  {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCurrentUser ? "bg-pitch-600 text-white" : "bg-surface-600 text-gray-300"}`}>
                    {r.profile?.pseudo?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold truncate ${isCurrentUser ? "text-pitch-300" : "text-gray-200"}`}>
                      {r.profile?.pseudo ?? "—"}
                      {isCurrentUser && <span className="ml-1 text-xs text-gray-500">(toi)</span>}
                    </div>
                    <div className="text-xs text-gray-500">{r.predictions_count} pronostic{r.predictions_count !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="font-display font-bold text-lg text-white">{r.total_points}</span>
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <span className="text-gold-400 font-semibold text-sm">{r.exact_scores}</span>
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <span className="text-pitch-400 font-semibold text-sm">{r.correct_results}</span>
                </div>
                <div className="hidden sm:flex items-center justify-center">
                  <span className="text-blue-400 font-semibold text-sm">{r.correct_draws}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-sm text-gray-400 mb-3 tracking-wider">BARÈME</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { pts: 5, label: "Score exact", icon: Star, color: "text-gold-400" },
            { pts: 3, label: "Bon vainqueur", icon: TrendingUp, color: "text-pitch-400" },
            { pts: 2, label: "Bon match nul", icon: Target, color: "text-blue-400" },
            { pts: 0, label: "Mauvais résultat", icon: Trophy, color: "text-red-400" },
          ].map(({ pts, label, icon: Icon, color }) => (
            <div key={pts} className="bg-surface-700 rounded-lg p-3 text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <div className={`font-display font-bold text-xl ${color}`}>{pts} pts</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
