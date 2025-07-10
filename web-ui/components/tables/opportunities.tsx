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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useV1AccountsList,
  useV1ContactsList,
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

  // Fetch accounts and contacts for dropdowns
  const { data: accountsData } = useV1AccountsList({});
  const { data: contactsData } = useV1ContactsList({});

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
        cell: ({ row }: any) => {
          const stage = row.getValue("stage") as string;
          return (
            <div className="text-muted-foreground capitalize">
              {stage?.replace("_", " ")}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }: any) => {
          const amount = parseFloat(row.getValue("amount"));
          return (
            <div className="text-muted-foreground">
              $
              {amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "close_date",
        header: "Close Date",
        cell: ({ row }: any) => {
          const closeDate = row.getValue("close_date");
          return (
            <div className="text-muted-foreground">
              {closeDate ? new Date(closeDate).toLocaleDateString() : "—"}
            </div>
          );
        },
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
      setNewOpportunity({}); // Clear the form
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
                placeholder="Opportunity Name"
                value={newOpportunity.name || ""}
                onChange={(e) =>
                  setNewOpportunity({ ...newOpportunity, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select
                value={newOpportunity.account?.toString() || ""}
                onValueChange={(value) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    account: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  {accountsData?.results?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select
                value={newOpportunity.contact?.toString() || ""}
                onValueChange={(value) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    contact: value ? parseInt(value) : null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Contact (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No contact selected</SelectItem>
                  {contactsData?.results
                    ?.filter(
                      (contact) => contact.account === newOpportunity.account
                    )
                    ?.map((contact) => (
                      <SelectItem
                        key={contact.id}
                        value={contact.id.toString()}
                      >
                        {contact.name} ({contact.title || "No title"})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Amount (e.g., 10000.00)"
                type="number"
                step="0.01"
                value={newOpportunity.amount || ""}
                onChange={(e) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    amount: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="min-w-[150px]">
              <Select
                value={newOpportunity.stage || ""}
                onValueChange={(value) =>
                  setNewOpportunity({
                    ...newOpportunity,
                    stage: value as (typeof StageEnum)[keyof typeof StageEnum],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(StageEnum).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      <span className="capitalize">
                        {value.replace("_", " ")}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium">Account</label>
              <Select
                value={editingOpportunity?.account?.toString() || ""}
                onValueChange={(value) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? {
                          ...editingOpportunity,
                          account: parseInt(value),
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accountsData?.results?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact (Optional)</label>
              <Select
                value={editingOpportunity?.contact?.toString() || ""}
                onValueChange={(value) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? {
                          ...editingOpportunity,
                          contact: value ? parseInt(value) : null,
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No contact selected</SelectItem>
                  {contactsData?.results
                    ?.filter(
                      (contact) =>
                        contact.account === editingOpportunity?.account
                    )
                    ?.map((contact) => (
                      <SelectItem
                        key={contact.id}
                        value={contact.id.toString()}
                      >
                        {contact.name} ({contact.title || "No title"})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stage</label>
              <Select
                value={editingOpportunity?.stage || ""}
                onValueChange={(value) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? {
                          ...editingOpportunity,
                          stage:
                            value as (typeof StageEnum)[keyof typeof StageEnum],
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(StageEnum).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      <span className="capitalize">
                        {value.replace("_", " ")}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                value={editingOpportunity?.amount || ""}
                onChange={(e) =>
                  setEditingOpportunity(
                    editingOpportunity
                      ? { ...editingOpportunity, amount: e.target.value }
                      : null
                  )
                }
                required
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
