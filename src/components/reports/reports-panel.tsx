"use client";

import { useState } from "react";
import { FileText, Receipt, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getProfitAndLoss, getVatReport, getStockReport } from "@/lib/actions/reports";
import {
  generateProfitAndLossPdf,
  generateVatReportPdf,
  generateStockReportPdf,
} from "@/lib/pdf/generate-report-pdf";

function firstDayOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function ReportsPanel() {
  const [startDate, setStartDate] = useState(firstDayOfMonth());
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePnl() {
    setLoading("pnl");
    try {
      const data = await getProfitAndLoss(startDate, endDate);
      generateProfitAndLossPdf(data);
    } finally {
      setLoading(null);
    }
  }

  async function handleVat() {
    setLoading("vat");
    try {
      const data = await getVatReport(startDate, endDate);
      generateVatReportPdf(data);
    } finally {
      setLoading(null);
    }
  }

  async function handleStock() {
    setLoading("stock");
    try {
      const data = await getStockReport();
      generateStockReportPdf(data);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Periode</CardTitle>
          <CardDescription>Utilisee pour le compte de resultat et la declaration de TVA</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <Label>Debut</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fin</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="font-medium">Compte de resultat</p>
              <p className="text-xs text-muted-foreground">CA, depenses, resultat net par categorie</p>
            </div>
            <Button onClick={handlePnl} disabled={loading === "pnl"}>
              {loading === "pnl" ? "Generation..." : "Telecharger le PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Receipt className="size-5" />
            </div>
            <div>
              <p className="font-medium">Declaration de TVA</p>
              <p className="text-xs text-muted-foreground">TVA collectee, deductible et due</p>
            </div>
            <Button onClick={handleVat} disabled={loading === "vat"}>
              {loading === "vat" ? "Generation..." : "Telecharger le PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-success/10 text-success">
              <Package className="size-5" />
            </div>
            <div>
              <p className="font-medium">Rapport de stock</p>
              <p className="text-xs text-muted-foreground">Etat des stocks et valorisation</p>
            </div>
            <Button onClick={handleStock} disabled={loading === "stock"}>
              {loading === "stock" ? "Generation..." : "Telecharger le PDF"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
