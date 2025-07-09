import OpportunitiesTable from "@/components/tables/opportunities";

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
        <p className="text-secondary-foreground">
          Manage your sales opportunities and pipeline
        </p>
      </div>
      <OpportunitiesTable />
    </div>
  );
}
