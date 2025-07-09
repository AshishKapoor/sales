import CustomersTable from "@/components/tables/customers";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-secondary-foreground">
          Manage your customer relationships
        </p>
      </div>
      <CustomersTable />
    </div>
  );
}
