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
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import type { Account } from "../../client/gen/sales/account";
import {
  getV1AccountsListKey,
  useV1AccountsCreate,
  useV1AccountsList,
  v1AccountsDestroy,
  v1AccountsPartialUpdate,
} from "../../client/gen/sales/v1/v1";

export default function CustomersTable() {
  const [editingCustomer, setEditingCustomer] = useState<Account | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<Account>>({});
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
  const { data, isLoading, error } = useV1AccountsList(queryParams);
  const { trigger: createCustomer, isMutating: isCreating } =
    useV1AccountsCreate();

  const refreshCustomers = () => {
    mutate(getV1AccountsListKey(queryParams));
  };

  const handleDelete = async (customerToDelete: Account) => {
    try {
      await v1AccountsDestroy(customerToDelete.id);
      toast.success("Customer deleted successfully");
      refreshCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleUpdate = async (customer: Account) => {
    try {
      await v1AccountsPartialUpdate(customer.id, customer);
      toast.success("Customer updated successfully");
      refreshCustomers();
      setEditingCustomer(null);
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer");
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
        accessorKey: "industry",
        header: "Industry",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">
            {row.getValue("industry")}
          </div>
        ),
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">{row.getValue("size")}</div>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">
            {row.getValue("location")}
          </div>
        ),
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }: any) => (
          <div className="text-muted-foreground">{row.getValue("website")}</div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Account } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingCustomer(row.original)}
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
      await createCustomer(newCustomer as Account);
      setNewCustomer({});
      toast.success("Customer created successfully");
      refreshCustomers();
    } catch (error) {
      console.error("Failed to create customer:", error);
      toast.error("Failed to create customer");
    }
  };

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      await handleUpdate(editingCustomer);
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
            Error loading customers. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Customer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Name"
                value={newCustomer.name || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Industry"
                value={newCustomer.industry || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, industry: e.target.value })
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Size"
                value={newCustomer.size || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, size: e.target.value })
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Location"
                value={newCustomer.location || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, location: e.target.value })
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Website"
                value={newCustomer.website || ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, website: e.target.value })
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
                  Add Customer
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Customer Modal */}
      <Dialog
        open={!!editingCustomer}
        onOpenChange={() => setEditingCustomer(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateForm} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editingCustomer?.name || ""}
                onChange={(e) =>
                  setEditingCustomer(
                    editingCustomer
                      ? { ...editingCustomer, name: e.target.value }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Input
                value={editingCustomer?.industry || ""}
                onChange={(e) =>
                  setEditingCustomer(
                    editingCustomer
                      ? { ...editingCustomer, industry: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <Input
                value={editingCustomer?.size || ""}
                onChange={(e) =>
                  setEditingCustomer(
                    editingCustomer
                      ? { ...editingCustomer, size: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={editingCustomer?.location || ""}
                onChange={(e) =>
                  setEditingCustomer(
                    editingCustomer
                      ? { ...editingCustomer, location: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                value={editingCustomer?.website || ""}
                onChange={(e) =>
                  setEditingCustomer(
                    editingCustomer
                      ? { ...editingCustomer, website: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCustomer(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customers Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <CardTitle className="flex items-center gap-4">
            All Customers
            <Input
              className="w-64"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              aria-label="Search customers"
            />
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
                      No customers found.
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
