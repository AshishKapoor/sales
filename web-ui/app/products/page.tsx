import ProductsTable from "@/components/tables/products";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-secondary-foreground">Manage your product catalog</p>
      </div>
      <ProductsTable />
    </div>
  );
}
