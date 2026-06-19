import type { GroupStanding } from "@/lib/standings";

function FlagImg({ code }: { code?: string }) {
  if (!code) return null;
  return <img src={`https://flagcdn.com/20x15/${code.toLowerCase().replace("gb-eng","gb").replace("gb-sct","gb")}.png`} alt={code} width={20} height={15} className="rounded-sm" />;
}

export function GroupStandingsTable({ standings, groupName }: { standings: GroupStanding[]; groupName: string }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-3 py-2 bg-surface-700/50 border-b border-surface-600">
        <h3 className="text-xs font-bold text-pitch-400 uppercase tracking-widest">Groupe {groupName}</h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500 border-b border-surface-700">
            <th className="text-left py-1.5 px-2 font-medium">#</th>
            <th className="text-left py-1.5 px-1 font-medium">Équipe</th>
            <th className="text-center py-1.5 px-1 font-medium" title="Joués">J</th>
            <th className="text-center py-1.5 px-1 font-medium" title="Gagnés">G</th>
            <th className="text-center py-1.5 px-1 font-medium" title="Nuls">N</th>
            <th className="text-center py-1.5 px-1 font-medium" title="Perdus">P</th>
            <th className="text-center py-1.5 px-1 font-medium" title="Différence de buts">Diff</th>
            <th className="text-center py-1.5 px-2 font-medium" title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.team.id}
              className={`border-b border-surface-700/50 last:border-0 ${
                i < 2 ? "bg-pitch-900/15" : ""
              }`}
            >
              <td className="py-1.5 px-2 text-gray-500">{i + 1}</td>
              <td className="py-1.5 px-1">
                <div className="flex items-center gap-1.5">
                  <FlagImg code={s.team.country_code} />
                  <span className="font-medium text-gray-200 truncate max-w-[90px]">{s.team.name}</span>
                </div>
              </td>
              <td className="text-center py-1.5 px-1 text-gray-400">{s.played}</td>
              <td className="text-center py-1.5 px-1 text-gray-400">{s.won}</td>
              <td className="text-center py-1.5 px-1 text-gray-400">{s.drawn}</td>
              <td className="text-center py-1.5 px-1 text-gray-400">{s.lost}</td>
              <td className="text-center py-1.5 px-1 text-gray-400">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
              <td className="text-center py-1.5 px-2 font-bold text-white">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-2 py-1.5 text-[10px] text-gray-500 border-t border-surface-700">
        🟢 Qualifiés pour les 16es
      </div>
    </div>
  );
}