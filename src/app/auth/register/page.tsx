"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", confirm: "", first_name: "", last_name: "", pseudo: "" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (form.password.length < 8) { toast.error("Mot de passe trop court (8 caractères min)"); return; }
    setLoading(true);
    const { data: existing } = await supabase.from("profiles").select("id").eq("pseudo", form.pseudo.trim()).single();
    if (existing) { toast.error("Ce pseudo est déjà pris"); setLoading(false); return; }
    const { data, error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password });
    if (error || !data.user) { toast.error(error?.message ?? "Erreur lors de la création du compte"); setLoading(false); return; }
    const { error: profileError } = await supabase.from("profiles").insert({ id: data.user.id, email: form.email.trim(), first_name: form.first_name.trim(), last_name: form.last_name.trim(), pseudo: form.pseudo.trim(), is_admin: false });
    if (profileError) { toast.error("Erreur lors de la création du profil"); setLoading(false); return; }
    toast.success("Compte créé avec succès !");
    router.push("/");
    router.refresh();
  };

  const Field = ({ label, name, type = "text", placeholder }: { label: string; name: keyof typeof form; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      <input type={type} required value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} placeholder={placeholder} className="input" />
    </div>
  );

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
            <Field label="Prénom" name="first_name" placeholder="Jean" />
            <Field label="Nom" name="last_name" placeholder="Dupont" />
          </div>
          <Field label="Pseudo" name="pseudo" placeholder="Pepito68" />
          <Field label="Email" name="email" type="email" placeholder="jean@email.com" />
          <Field label="Mot de passe" name="password" type="password" placeholder="8 caractères min" />
          <Field label="Confirmer le mot de passe" name="confirm" type="password" placeholder="••••••••" />
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
