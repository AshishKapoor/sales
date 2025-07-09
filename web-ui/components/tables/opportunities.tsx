"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import type { Opportunity } from "../../client/gen/sales/opportunity";
import { StageEnum } from "../../client/gen/sales/stageEnum";
import {
  getV1OpportunitiesListKey,
  useV1OpportunitiesCreate,
  useV1OpportunitiesList,
  v1OpportunitiesDestroy,
  v1OpportunitiesPartialUpdate,
} from "../../client/gen/sales/v1/v1";

export default function OpportunitiesTable() {
  const [editingOpportunity, setEditingOpportunity] =
    useState<Opportunity | null>(null);
  const [newOpportunity, setNewOpportunity] = useState<Partial<Opportunity>>(
    {}
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const queryParams = {
    page,
    ordering: "id",
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };
  const { data, isLoading, error } = useV1OpportunitiesList(queryParams);
  const { trigger: createOpportunity, isMutating: isCreating } =
    useV1OpportunitiesCreate();

  const refreshOpportunities = () => {
    mutate(getV1OpportunitiesListKey(queryParams));
  };

  const handleDelete = async (opportunityToDelete: Opportunity) => {
    try {
      await v1OpportunitiesDestroy(opportunityToDelete.id);
      toast.success("Opportunity deleted successfully");
      refreshOpportunities();
    } catch (error) {
      console.error("Failed to delete opportunity:", error);
      toast.error("Failed to delete opportunity");
    }
  };

  const handleUpdate = async (opportunity: Opportunity) => {
    try {
      await v1OpportunitiesPartialUpdate(opportunity.id, opportunity);
      toast.success("Opportunity updated successfully");
      refreshOpportunities();
      setEditingOpportunity(null);
    } catch (error) {
      console.error("Failed to update opportunity:", error);
      toast.error("Failed to update opportunity");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: any) => (
          <div className="font-medium text-muted-foreground">
            #{row.getValue("id")}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: any) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "account_name",
        header: "Account",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">
            {row.getValue("account_name")}
          </div>
        ),
      },
      {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">{row.getValue("stage")}</div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">{row.getValue("amount")}</div>
        ),
      },
      {
        accessorKey: "close_date",
        header: "Close Date",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">
            {row.getValue("close_date")}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Opportunity } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingOpportunity(row.original)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Table logic (reuse from leads table)
  const {
    useReactTable,
    getCoreRowModel,
    flexRender,
  } = require("@tanstack/react-table");
  const table = useReactTable({
    data: data?.results || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOpportunity(newOpportunity as Opportunity);
      setNewOpportunity({});
      toast.success("Opportunity created successfully");
      refreshOpportunities();
    } catch (error) {
      console.error("Failed to create opportunity:", error);
      toast.error("Failed to create opportunity");
    }
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOpportunity) {
      await handleUpdate(editingOpportunity);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading opportunities. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Opportunity Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Name"
                value={newOpportunity.name || ""}
                onChange={(e) =>
                  setNewOpportunity({ ...newOpportunity, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Account Name"
                value={newOpportunity.account_name || ""}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    account_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="min-w-[200px]">
              <label className="text-sm font-medium">Stage</label>
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={newOpportunity.stage || ""}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    stage: e.target
                      .value as (typeof StageEnum)[keyof typeof StageEnum],
                  })
                }
                required
              >
                <option value="" disabled>
                  Select stage
                </option>
                {Object.values(StageEnum).map((stage) => (
                  <option key={stage} value={stage} className="capitalize">
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Amount"
                type="number"
                value={newOpportunity.amount || ""}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    amount: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Close Date"
                type="date"
                value={newOpportunity.close_date || ""}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    close_date: e.target.value,
                  })
                }
              />
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Opportunity
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Opportunity Modal */}
      <Dialog
        open={!!editingOpportunity}
        onOpenChange={() => setEditingOpportunity(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateForm} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editingOpportunity?.name || ""}
                onChange={(e) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? { ...editingOpportunity, name: e.target.value }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Name</label>
              <Input
                value={editingOpportunity?.account_name || ""}
                onChange={(e) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? { ...editingOpportunity, account_name: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stage</label>
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={editingOpportunity?.stage || ""}
                onChange={(e) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? {
                          ...editingOpportunity,
                          stage: e.target
                            .value as (typeof StageEnum)[keyof typeof StageEnum],
                        }
                      : null
                  )
                }
                required
              >
                <option value="" disabled>
                  Select stage
                </option>
                {Object.values(StageEnum).map((stage) => (
                  <option key={stage} value={stage} className="capitalize">
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={editingOpportunity?.amount || ""}
                onChange={(e) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? { ...editingOpportunity, amount: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Close Date</label>
              <Input
                type="date"
                value={editingOpportunity?.close_date || ""}
                onChange={(e) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? { ...editingOpportunity, close_date: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingOpportunity(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Opportunities Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="flex items-center gap-4">
            All Opportunities
            <div className="relative">
              <Input
                className="w-64 pl-8"
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                aria-label="Search opportunities"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header: any) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row: any) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell: any) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No opportunities found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Pagination Controls */}
      <div className="flex items-center justify-end mt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page}
          {data?.count && data?.results?.length
            ? ` of ${Math.ceil(data.count / data.results.length)}`
            : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((p) =>
              data?.count &&
              data?.results?.length &&
              p < Math.ceil(data.count / data.results.length)
                ? p + 1
                : p
            )
          }
          disabled={
            !data?.count ||
            !data?.results?.length ||
            page >= Math.ceil(data.count / data.results.length)
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}
