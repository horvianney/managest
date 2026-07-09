"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  userName: string;
  organizationName: string;
}

export function Topbar({ userName, organizationName }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <p className="text-sm font-semibold text-foreground">{organizationName}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserIcon className="size-4" />
          {userName}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          Deconnexion
        </Button>
      </div>
    </header>
  );
}
