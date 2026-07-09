"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { organizationSchema } from "@/lib/validations/settings";
import { updateOrganization } from "@/lib/actions/settings";

interface OrganizationFormProps {
  organization: {
    name: string;
    siret: string | null;
    vatNumber: string | null;
    address: string | null;
    city: string | null;
    zipCode: string | null;
    country: string | null;
    currency: string;
  };
}

export function OrganizationForm({ organization }: OrganizationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: organization.name,
    siret: organization.siret ?? "",
    vatNumber: organization.vatNumber ?? "",
    address: organization.address ?? "",
    city: organization.city ?? "",
    zipCode: organization.zipCode ?? "",
    country: organization.country ?? "",
    currency: organization.currency,
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = organizationSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await updateOrganization(parsed.data);
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Erreur lors de la mise a jour.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil de l&apos;entreprise</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Nom de l&apos;entreprise</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Devise par defaut</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="XOF">CFA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>SIRET</Label>
              <Input value={form.siret} onChange={(e) => update("siret", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Numero de TVA</Label>
              <Input value={form.vatNumber} onChange={(e) => update("vatNumber", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Adresse</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Ville</Label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Code postal</Label>
              <Input value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Pays</Label>
              <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-success">Modifications enregistrees.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
