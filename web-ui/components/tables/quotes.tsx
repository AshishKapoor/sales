"use client";

import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
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
import { toast } from "sonner";
import { mutate } from "swr";
import type { Quote } from "../../client/gen/sales/quote";
import {
  useV1QuotesList,
  useV1QuotesCreate,
  v1QuotesPartialUpdate,
  v1QuotesDestroy,
  useV1OpportunitiesList,
  getV1QuotesListKey,
} from "../../client/gen/sales/v1/v1";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuotesTable() {
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [newQuote, setNewQuote] = useState<Partial<Quote>>({});
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
  const { data, isLoading, error } = useV1QuotesList(queryParams);
  const { data: opportunitiesData } = useV1OpportunitiesList({ page: 1 });
  const quotes = data?.results || [];
  const opportunities = opportunitiesData?.results || [];
  const { trigger: createQuote, isMutating: isCreating } = useV1QuotesCreate();

  const refreshQuotes = () => {
    mutate(getV1QuotesListKey(queryParams));
  };

  const handleDelete = async (quoteToDelete: Quote) => {
    if (!window.confirm(`Delete quote '${quoteToDelete.title}'?`)) return;
    try {
      await v1QuotesDestroy(quoteToDelete.id);
      toast.success("Quote deleted successfully");
      refreshQuotes();
    } catch (error) {
      console.error("Failed to delete quote:", error);
      toast.error("Failed to delete quote");
    }
  };

  const handleEdit = async () => {
    if (!editingQuote) return;
    try {
      await v1QuotesPartialUpdate(editingQuote.id, {
        title: editingQuote.title,
        opportunity: editingQuote.opportunity,
        notes: editingQuote.notes,
      });
      toast.success("Quote updated");
      setEditingQuote(null);
      refreshQuotes();
    } catch (e) {
      toast.error("Failed to update quote");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.title || typeof newQuote.title !== "string") {
      toast.error("Quote title is required");
      return;
    }
    if (!newQuote.opportunity) {
      toast.error("Opportunity is required");
      return;
    }
    const payload = {
      title: newQuote.title,
      opportunity: newQuote.opportunity,
      notes: newQuote.notes || "",
    };
    try {
      await createQuote(payload);
      toast.success("Quote created");
      setNewQuote({});
      refreshQuotes();
    } catch (e) {
      toast.error("Failed to create quote");
    }
  };

  const handleEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleEdit();
  };

  const columns = useMemo<ColumnDef<Quote, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("title")}</div>
        ),
      },
      {
        accessorKey: "opportunity_name",
        header: "Opportunity",
        cell: ({ row }) => <div>{row.getValue("opportunity_name")}</div>,
      },
      {
        accessorKey: "total_price",
        header: "Total Price",
        cell: ({ row }) => {
          const totalPrice = row.getValue("total_price") as string;
          return <div className="font-medium">${totalPrice || "0.00"}</div>;
        },
      },
      {
        accessorKey: "created_by_name",
        header: "Created By",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("created_by_name")}</div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          const date = new Date(row.getValue("created_at"));
          return <div className="text-sm">{date.toLocaleDateString()}</div>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Quote } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingQuote(row.original)}
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
    data: quotes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Add New Quote Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">+ Add New Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreate}
            className="flex flex-col md:flex-row gap-2 md:items-center"
          >
            <Input
              placeholder="Quote Title"
              value={newQuote.title || ""}
              onChange={(e) =>
                setNewQuote({ ...newQuote, title: e.target.value })
              }
              required
              className="md:w-48"
            />
            <Select
              value={newQuote.opportunity?.toString() || ""}
              onValueChange={(value) =>
                setNewQuote({ ...newQuote, opportunity: parseInt(value) })
              }
            >
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Select Opportunity" />
              </SelectTrigger>
              <SelectContent>
                {opportunities.map((opportunity) => (
                  <SelectItem
                    key={opportunity.id}
                    value={opportunity.id.toString()}
                  >
                    {opportunity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="md:ml-2" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Quote
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* All Quotes Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Input
              className="w-64 pl-8"
              placeholder="Search quotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              aria-label="Search quotes"
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
                        "No quotes found."
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
        open={!!editingQuote}
        onOpenChange={(open) => !open && setEditingQuote(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditForm} className="space-y-4">
            <Input
              placeholder="Title"
              value={editingQuote?.title || ""}
              onChange={(e) =>
                setEditingQuote(
                  editingQuote
                    ? { ...editingQuote, title: e.target.value }
                    : null
                )
              }
              required
            />
            <Select
              value={editingQuote?.opportunity?.toString() || ""}
              onValueChange={(value) =>
                setEditingQuote(
                  editingQuote
                    ? { ...editingQuote, opportunity: parseInt(value) }
                    : null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Opportunity" />
              </SelectTrigger>
              <SelectContent>
                {opportunities.map((opportunity) => (
                  <SelectItem
                    key={opportunity.id}
                    value={opportunity.id.toString()}
                  >
                    {opportunity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Notes"
              value={editingQuote?.notes || ""}
              onChange={(e) =>
                setEditingQuote(
                  editingQuote
                    ? { ...editingQuote, notes: e.target.value }
                    : null
                )
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingQuote(null)}
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
