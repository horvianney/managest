import { getSettingsData } from "@/lib/actions/settings";
import { OrganizationForm } from "@/components/settings/organization-form";
import { TaxRatesPanel } from "@/components/settings/tax-rates-panel";
import { CurrenciesPanel } from "@/components/settings/currencies-panel";

export default async function SettingsPage() {
  const { organization, taxRates, currencies } = await getSettingsData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Parametres</h1>
        <p className="text-sm text-muted-foreground">
          Profil de l&apos;entreprise, TVA et devises
        </p>
      </div>
      <OrganizationForm organization={organization} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TaxRatesPanel taxRates={taxRates} />
        <CurrenciesPanel currencies={currencies} />
      </div>
    </div>
  );
}
