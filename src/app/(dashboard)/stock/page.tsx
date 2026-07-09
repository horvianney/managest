import { getProducts } from "@/lib/actions/products";
import { NewProductDialog } from "@/components/stock/new-product-dialog";
import { ProductsTable } from "@/components/stock/products-table";

export default async function StockPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Stock</h1>
          <p className="text-sm text-muted-foreground">
            Produits, quantites et alertes de rupture
          </p>
        </div>
        <NewProductDialog />
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
