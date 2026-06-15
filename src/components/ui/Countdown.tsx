"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
  kickoffTime: string;
}

export function Countdown({ kickoffTime }: Props) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const kickoff = new Date(kickoffTime).getTime();
      const diff = kickoff - now;
      if (diff <= 0) { setTimeLeft(""); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setUrgent(diff < 3600000);
      if (days > 0) { setTimeLeft(`${days}j ${hours}h`); }
      else if (hours > 0) { setTimeLeft(`${hours}h ${minutes}min`); }
      else { setTimeLeft(`${minutes}min ${seconds}s`); }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [kickoffTime]);

  if (!timeLeft) return null;

  return (
    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${urgent ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-surface-600 text-gray-400"}`}>
      <Clock size={10} />
      {urgent ? "⚡ " : ""}{timeLeft}
    </span>
  );
}
