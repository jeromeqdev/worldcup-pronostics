"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { toast.error("Mot de passe trop court (8 caractères min)"); return; }
    setLoading(true);

    const { data: existing } = await supabase.from("profiles").select("id").eq("pseudo", pseudo.trim()).maybeSingle();
    if (existing) { toast.error("Ce pseudo est déjà pris"); setLoading(false); return; }

    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error || !data.user) { toast.error(error?.message ?? "Erreur lors de la création du compte"); setLoading(false); return; }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      pseudo: pseudo.trim(),
      is_admin: false,
    });

    if (profileError) {
      toast.error("Erreur profil : " + profileError.message);
      setLoading(false);
      return;
    }

    toast.success("Compte créé avec succès !");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚽</div>
          <h1 className="font-display text-3xl font-bold text-white tracking-wide">INSCRIPTION</h1>
          <p className="text-gray-500 text-sm mt-2">Rejoins le concours de pronostics</p>
        </div>
        <form onSubmit={handleRegister} className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Prénom</label>
              <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" className="input" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nom</label>
              <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Pseudo</label>
            <input type="text" required value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Pepito68" className="input" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@email.com" className="input" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Mot de passe</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8 caractères min (lettres + chiffres)" className="input" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Confirmer le mot de passe</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={16} />}
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <p className="text-center text-sm text-gray-500">
            Déjà inscrit ?{" "}
            <Link href="/auth/login" className="text-pitch-400 hover:text-pitch-300 font-medium">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
