"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations/auth";
import { createOrganizationForUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ ...form, currency: "EUR" });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          organizationName: parsed.data.organizationName,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          currency: parsed.data.currency,
        },
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      try {
        await createOrganizationForUser({
          supabaseUserId: data.user.id,
          email: parsed.data.email,
          organizationName: parsed.data.organizationName,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          currency: parsed.data.currency,
        });
      } catch {
        setError("Compte cree, mais erreur lors de la configuration de l'organisation. Contactez le support.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Creer un compte</CardTitle>
          <CardDescription>
            Demarrez la gestion comptable de votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="organizationName">Nom de l&apos;entreprise</Label>
              <Input
                id="organizationName"
                value={form.organizationName}
                onChange={(e) => update("organizationName", e.target.value)}
                placeholder="Ma Boutique SARL"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">Prenom</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="vous@entreprise.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="********"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Creation..." : "Creer mon compte"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Deja un compte ?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
