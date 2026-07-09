import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "EUR",
  locale: string = "fr-FR"
): string {
  const currencyMap: Record<string, string> = {
    EUR: "EUR",
    USD: "USD",
    XOF: "CFA",
  };
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyMap[currency] || currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string = "fr-FR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function generateInvoiceNumber(prefix: string, seq: number): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return `${prefix}-${year}${month}-${String(seq).padStart(5, "0")}`;
}
