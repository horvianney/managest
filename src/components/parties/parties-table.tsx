"use client";

import { useRouter } from "next/navigation";
import { Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Party {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
}

interface PartiesTableProps {
  parties: Party[];
  emptyLabel: string;
  onDelete: (id: string) => Promise<void>;
}

export function PartiesTable({ parties, emptyLabel, onDelete }: PartiesTableProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await onDelete(id);
    router.refresh();
  }

  if (parties.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Localisation</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {parties.map((p) => (
            <tr key={p.id} className="hover:bg-secondary/50">
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3 text-muted-foreground">
                <div className="flex flex-col gap-0.5">
                  {p.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5" /> {p.email}
                    </span>
                  )}
                  {p.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5" /> {p.phone}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {[p.city, p.country].filter(Boolean).join(", ") || "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} aria-label="Supprimer">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
