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
  const { trigger: createAccount, isMutating: isCreating } =
    useV1AccountsCreate();

  const refreshAccounts = () => {
    mutate(getV1AccountsListKey(queryParams));
  };

  const handleDelete = async (accountToDelete: Account) => {
    if (!window.confirm(`Delete account '${accountToDelete.name}'?`)) return;
    try {
      await v1AccountsDestroy(accountToDelete.id);
      toast.success("Account deleted");
      refreshAccounts();
    } catch (e) {
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

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: (row: any) => row.getValue(),
      },
      {
        header: "Industry",
        accessorKey: "industry",
        cell: (row: any) => row.getValue() || "-",
      },
      {
        header: "Size",
        accessorKey: "size",
        cell: (row: any) => row.getValue() || "-",
      },
      {
        header: "Location",
        accessorKey: "location",
        cell: (row: any) => row.getValue() || "-",
      },
      {
        header: "Website",
        accessorKey: "website",
        cell: (row: any) =>
          row.getValue() ? (
            <a
              href={row.getValue()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {row.getValue()}
            </a>
          ) : (
            "-"
          ),
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }: any) => (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditingAccount(row.original)}
            >
              <Edit size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [editingAccount]
  );

  // Table logic (simple, not using react-table for brevity)
  const accounts = data?.results || [];

  return (
    <div className="space-y-6">
      {/* Add New Account Form */}
      <Card className="bg-muted/50">
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.accessorKey || col.id}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      <Loader2 className="animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account: Account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.industry || "-"}</TableCell>
                      <TableCell>{account.size || "-"}</TableCell>
                      <TableCell>{account.location || "-"}</TableCell>
                      <TableCell>
                        {account.website ? (
                          <a
                            href={account.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {account.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingAccount(account)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(account)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination (simple) */}
          <div className="flex justify-end mt-4 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            <span className="px-2 text-sm">Page {page}</span>
            <Button
              size="sm"
              variant="outline"
              disabled={!data?.next}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

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
