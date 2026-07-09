-- Enable Row Level Security on all multi-tenant tables.
-- Prisma connects with a trusted server-side connection (via prisma.config.ts / DATABASE_URL)
-- and enforces organizationId scoping in application code (see src/lib/actions/*).
-- These RLS policies are a defense-in-depth layer in case a table is ever queried
-- directly via the Supabase client (PostgREST / anon or authenticated key) instead of Prisma.

alter table "Organization" enable row level security;
alter table "User" enable row level security;
alter table "Customer" enable row level security;
alter table "Supplier" enable row level security;
alter table "Product" enable row level security;
alter table "StockMovement" enable row level security;
alter table "Transaction" enable row level security;
alter table "Invoice" enable row level security;
alter table "InvoiceLine" enable row level security;
alter table "TaxRate" enable row level security;
alter table "Currency" enable row level security;
alter table "ActivityLog" enable row level security;

-- Helper: current user's organization id, derived from the "User" table
-- (linked 1:1 to auth.users.id via the same primary key).
create or replace function current_organization_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select "organizationId" from "User" where id = auth.uid()::text
$$;

-- Organization: a user can only see/update their own organization.
create policy "org_select_own" on "Organization"
  for select using (id = current_organization_id());
create policy "org_update_own" on "Organization"
  for update using (id = current_organization_id());

-- User: a user can see other users in the same organization.
create policy "user_select_same_org" on "User"
  for select using ("organizationId" = current_organization_id());

-- Generic per-table policy: full CRUD scoped to the caller's organization.
create policy "customer_all_own_org" on "Customer"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "supplier_all_own_org" on "Supplier"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "product_all_own_org" on "Product"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "stockmovement_all_own_org" on "StockMovement"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "transaction_all_own_org" on "Transaction"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "invoice_all_own_org" on "Invoice"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "invoiceline_all_own_org" on "InvoiceLine"
  for all using (
    exists (
      select 1 from "Invoice" i
      where i.id = "InvoiceLine"."invoiceId"
      and i."organizationId" = current_organization_id()
    )
  );

create policy "taxrate_all_own_org" on "TaxRate"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "currency_all_own_org" on "Currency"
  for all using ("organizationId" = current_organization_id())
  with check ("organizationId" = current_organization_id());

create policy "activitylog_select_own_org" on "ActivityLog"
  for select using ("organizationId" = current_organization_id());
