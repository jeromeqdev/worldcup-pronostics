"use client";
// src/app/admin/users/page.tsx — Gestion des utilisateurs

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import toast from "react-hot-toast";
import { Trash2, Shield, ShieldOff, Loader } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAdmin = async (userId: string, current: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !current })
      .eq("id", userId);
    if (error) {
      toast.error("Erreur lors de la modification");
    } else {
      toast.success(current ? "Droits admin retirés" : "Droits admin accordés");
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string, pseudo: string) => {
    if (!confirm(`Supprimer définitivement ${pseudo} et tous ses pronostics ?`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success(`${pseudo} supprimé`);
      fetchUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="animate-spin text-pitch-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-white tracking-wide">
          UTILISATEURS
        </h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} inscrits</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2 border-b border-surface-600 text-xs text-gray-500 uppercase tracking-wider font-semibold">
          <span>Participant</span>
          <span>Email</span>
          <span>Admin</span>
          <span>Actions</span>
        </div>

        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-3 border-b border-surface-700/50 last:border-0 items-center">
            <div>
              <div className="font-semibold text-gray-200 text-sm">{u.pseudo}</div>
              <div className="text-xs text-gray-500">{u.first_name} {u.last_name}</div>
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">{u.email}</div>
            <div>
              {u.is_admin ? (
                <span className="badge-live text-xs">Admin</span>
              ) : (
                <span className="badge-upcoming text-xs">Joueur</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAdmin(u.id, u.is_admin)}
                className="btn-ghost p-1.5"
                title={u.is_admin ? "Retirer admin" : "Donner admin"}
              >
                {u.is_admin ? <ShieldOff size={15} /> : <Shield size={15} />}
              </button>
              <button
                onClick={() => deleteUser(u.id, u.pseudo)}
                className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
                title="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
