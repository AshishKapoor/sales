import AccountsTable from "@/components/tables/accounts";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
        <p className="text-secondary-foreground">
          Manage your accounts and business relationships
        </p>
      </div>
      <AccountsTable />
    </div>
  );
}
