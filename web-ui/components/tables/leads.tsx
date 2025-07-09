import React, { useMemo, useState } from "react";
import { mutate } from "swr";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  orderColumns,
} from "@tanstack/react-table";
import {
  useV1LeadsList,
  useV1LeadsCreate,
  getV1LeadsListKey,
  v1LeadsPartialUpdate,
  v1LeadsDestroy,
} from "../../client/gen/sales/v1/v1";
import type { Lead } from "../../client/gen/sales/lead";
import { LeadStatusEnum } from "../../client/gen/sales/leadStatusEnum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LeadsTable() {
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState<Partial<Lead>>({});
  const [page, setPage] = useState(1);

  // Fetch leads using SWR
  const queryParams = { page, ordering: "id" };
  const { data, isLoading, error } = useV1LeadsList(queryParams);

  // SWR Mutations
  const { trigger: createLead, isMutating: isCreating } = useV1LeadsCreate();

  // Helper function to refresh leads data
  const refreshLeads = () => {
    mutate(getV1LeadsListKey(queryParams));
  };

  // Handlers for CRUD operations
  const handleDelete = async (leadToDelete: Lead) => {
    try {
      await v1LeadsDestroy(leadToDelete.id);
      toast.success("Lead deleted successfully");
      refreshLeads();
    } catch (error) {
      console.error("Failed to delete lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const handleUpdate = async (lead: Lead) => {
    try {
      await v1LeadsPartialUpdate(lead.id, lead);
      toast.success("Lead updated successfully");
      refreshLeads();
      setEditingLead(null);
    } catch (error) {
      console.error("Failed to update lead:", error);
      toast.error("Failed to update lead");
    }
  };

  // Helper function to get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "contacted":
        return "secondary";
      case "qualified":
        return "outline";
      case "unqualified":
        return "destructive";
      case "converted":
        return "default";
      default:
        return "secondary";
    }
  };

  // Table columns
  const columns = useMemo<ColumnDef<Lead, any>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-medium text-muted-foreground">
            #{row.getValue("id")}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.getValue("company")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.getValue("phone")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={getStatusVariant(status)} className="capitalize">
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Lead } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingLead(row.original)}
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

  const table = useReactTable({
    data: data?.results || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(newLead as Lead);
      setNewLead({});
      toast.success("Lead created successfully");
      refreshLeads();
    } catch (error) {
      console.error("Failed to create lead:", error);
      toast.error("Failed to create lead");
    }
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      await handleUpdate(editingLead);
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
            Error loading leads. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">
            Manage your sales leads and prospects
          </p>
        </div>
      </div>

      {/* Create Lead Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Lead
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Full Name"
                value={newLead.name || ""}
                onChange={(e) =>
                  setNewLead({ ...newLead, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Company"
                value={newLead.company || ""}
                onChange={(e) =>
                  setNewLead({ ...newLead, company: e.target.value })
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Email"
                type="email"
                value={newLead.email || ""}
                onChange={(e) =>
                  setNewLead({ ...newLead, email: e.target.value })
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Phone"
                value={newLead.phone || ""}
                onChange={(e) =>
                  setNewLead({ ...newLead, phone: e.target.value })
                }
              />
            </div>
            <div className="min-w-[150px]">
              <Select
                value={newLead.status || ""}
                onValueChange={(value) =>
                  setNewLead({
                    ...newLead,
                    status:
                      value as (typeof LeadStatusEnum)[keyof typeof LeadStatusEnum],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LeadStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      <span className="capitalize">{status}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  Add Lead
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Lead Modal */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateForm} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editingLead?.name || ""}
                onChange={(e) =>
                  setEditingLead(
                    editingLead
                      ? { ...editingLead, name: e.target.value }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                value={editingLead?.company || ""}
                onChange={(e) =>
                  setEditingLead(
                    editingLead
                      ? { ...editingLead, company: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editingLead?.email || ""}
                onChange={(e) =>
                  setEditingLead(
                    editingLead
                      ? { ...editingLead, email: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={editingLead?.phone || ""}
                onChange={(e) =>
                  setEditingLead(
                    editingLead
                      ? { ...editingLead, phone: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editingLead?.status || ""}
                onValueChange={(value) =>
                  setEditingLead(
                    editingLead
                      ? {
                          ...editingLead,
                          status:
                            value as (typeof LeadStatusEnum)[keyof typeof LeadStatusEnum],
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LeadStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      <span className="capitalize">{status}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLead(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
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
                      No leads found.
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
