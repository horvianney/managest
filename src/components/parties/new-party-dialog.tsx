"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { partySchema } from "@/lib/validations/party";

interface NewPartyDialogProps {
  triggerLabel: string;
  dialogTitle: string;
  onCreate: (data: unknown) => Promise<unknown>;
}

export function NewPartyDialog({ triggerLabel, dialogTitle, onCreate }: NewPartyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = partySchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await onCreate(parsed.data);
      setOpen(false);
      setForm({ name: "", email: "", phone: "", address: "", city: "", zipCode: "", country: "" });
      router.refresh();
    } catch {
      setError("Erreur lors de la creation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telephone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zipCode">Code postal</Label>
              <Input id="zipCode" value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="country">Pays</Label>
              <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creation..." : "Creer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
