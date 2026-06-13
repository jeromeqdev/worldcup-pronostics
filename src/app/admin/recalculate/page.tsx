"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { RefreshCw, CheckCircle } from "lucide-react";

export default function RecalculatePage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  const handleRecalculate = async () => {
    setLoading(true);
    setDone(false);
    const { error } = await supabase.rpc("recalculate_rankings");
    setLoading(false);
    if (error) { toast.error("Erreur lors du recalcul : " + error.message); } else { setDone(true); toast.success("Classement recalculé avec succès !"); }
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide">RECALCUL</h1>
        <p className="text-gray-500 text-sm mt-1">Le classement est recalculé automatiquement à chaque résultat saisi. Ce bouton permet un recalcul forcé si nécessaire.</p>
      </div>
      <div className="card space-y-4">
        <p className="text-gray-400 text-sm">Cette opération recalcule tous les points pour tous les pronostics de tous les utilisateurs, puis remet les rangs à jour.</p>
        <button onClick={handleRecalculate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <><RefreshCw size={18} className="animate-spin" />Recalcul en cours...</> : done ? <><CheckCircle size={18} className="text-pitch-300" />Classement à jour !</> : <><RefreshCw size={18} />Recalculer le classement</>}
        </button>
      </div>
    </div>
  );
}
