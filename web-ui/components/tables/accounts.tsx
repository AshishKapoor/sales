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
import { Edit, Loader2, Plus, SearchIcon, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
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

export default function AccountsTable() {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Table data
  const queryParams = {
    page,
    ordering: "id",
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };
  const { data, isLoading, error } = useV1AccountsList(queryParams);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { trigger: createAccount, isMutating: isCreating } =
    useV1AccountsCreate();

  const refreshAccounts = () => {
    mutate(getV1AccountsListKey(queryParams));
  };

  const handleDelete = async (accountToDelete: Account) => {
    try {
      await v1AccountsDestroy(accountToDelete.id);
      toast.success("Account deleted successfully");
      refreshAccounts();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleEdit = async () => {
    if (!editingAccount) return;
    try {
      await v1AccountsPartialUpdate(editingAccount.id, editingAccount);
      toast.success("Account updated");
      setEditingAccount(null);
      refreshAccounts();
    } catch (e) {
      toast.error("Failed to update account");
    }
  };

  const handleCreate = async () => {
    if (!newAccount.name || typeof newAccount.name !== "string") {
      toast.error("Account name is required");
      return;
    }
    const payload = {
      name: newAccount.name,
      industry: newAccount.industry,
      size: newAccount.size,
      location: newAccount.location,
      website: newAccount.website,
    };
    try {
      await createAccount(payload);
      toast.success("Account created");
      setNewAccount({});
      refreshAccounts();
    } catch (e) {
      toast.error("Failed to create account");
    }
  };

  const accounts = data?.results || [];
  const columns = useMemo<ColumnDef<Account, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "industry",
        header: "Industry",
        cell: ({ row }) => <div>{row.getValue("industry") || "-"}</div>,
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => <div>{row.getValue("size") || "-"}</div>,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => <div>{row.getValue("location") || "-"}</div>,
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
          const value = row.getValue("website") as string | undefined;
          return value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {value}
            </a>
          ) : (
            "-"
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Account } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingAccount(row.original)}
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
    [editingAccount]
  );

  const table = useReactTable({
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Add New Account Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">+ Add New Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="flex flex-col md:flex-row gap-2 md:items-center"
          >
            <Input
              placeholder="Account Name"
              value={newAccount.name || ""}
              onChange={(e) =>
                setNewAccount({ ...newAccount, name: e.target.value })
              }
              required
              className="md:w-48"
            />
            <Input
              placeholder="Industry"
              value={newAccount.industry || ""}
              onChange={(e) =>
                setNewAccount({ ...newAccount, industry: e.target.value })
              }
              className="md:w-40"
            />
            <Input
              placeholder="Size"
              value={newAccount.size || ""}
              onChange={(e) =>
                setNewAccount({ ...newAccount, size: e.target.value })
              }
              className="md:w-32"
            />
            <Input
              placeholder="Location"
              value={newAccount.location || ""}
              onChange={(e) =>
                setNewAccount({ ...newAccount, location: e.target.value })
              }
              className="md:w-40"
            />
            <Input
              placeholder="Website"
              value={newAccount.website || ""}
              onChange={(e) =>
                setNewAccount({ ...newAccount, website: e.target.value })
              }
              className="md:w-48"
            />
            <Button type="submit" className="md:ml-2" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}{" "}
              Add Account
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* All Accounts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Input
              className="w-64 pl-8"
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              aria-label="Search accounts"
            />
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
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
                      {isLoading ? (
                        <Loader2 className="animate-spin mx-auto" />
                      ) : (
                        "No accounts found."
                      )}
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

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit();
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Name"
              value={editingAccount?.name || ""}
              onChange={(e) =>
                setEditingAccount(
                  editingAccount
                    ? { ...editingAccount, name: e.target.value }
                    : null
                )
              }
              required
            />
            <Input
              placeholder="Industry"
              value={editingAccount?.industry || ""}
              onChange={(e) =>
                setEditingAccount(
                  editingAccount
                    ? { ...editingAccount, industry: e.target.value }
                    : null
                )
              }
            />
            <Input
              placeholder="Size"
              value={editingAccount?.size || ""}
              onChange={(e) =>
                setEditingAccount(
                  editingAccount
                    ? { ...editingAccount, size: e.target.value }
                    : null
                )
              }
            />
            <Input
              placeholder="Location"
              value={editingAccount?.location || ""}
              onChange={(e) =>
                setEditingAccount(
                  editingAccount
                    ? { ...editingAccount, location: e.target.value }
                    : null
                )
              }
            />
            <Input
              placeholder="Website"
              value={editingAccount?.website || ""}
              onChange={(e) =>
                setEditingAccount(
                  editingAccount
                    ? { ...editingAccount, website: e.target.value }
                    : null
                )
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingAccount(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
