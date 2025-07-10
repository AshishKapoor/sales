"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, Loader2, Plus, SearchIcon, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import type { Product } from "../../client/gen/sales/product";
import {
  getV1ProductsListKey,
  useV1ProductsCreate,
  useV1ProductsList,
  v1ProductsDestroy,
  v1ProductsPartialUpdate,
} from "../../client/gen/sales/v1/v1";

export default function ProductsTable() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
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
  const { data, isLoading, error } = useV1ProductsList(queryParams);
  const products = data?.results || [];
  const { trigger: createProduct, isMutating: isCreating } =
    useV1ProductsCreate();

  const refreshProducts = () => {
    mutate(getV1ProductsListKey(queryParams));
  };

  const handleDelete = async (productToDelete: Product) => {
    if (!window.confirm(`Delete product '${productToDelete.name}'?`)) return;
    try {
      await v1ProductsDestroy(productToDelete.id);
      toast.success("Product deleted successfully");
      refreshProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = async () => {
    if (!editingProduct) return;
    try {
      await v1ProductsPartialUpdate(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        currency: editingProduct.currency,
        is_active: editingProduct.is_active,
      });
      toast.success("Product updated");
      setEditingProduct(null);
      refreshProducts();
    } catch (e) {
      toast.error("Failed to update product");
    }
  };

  const handleCreate = async () => {
    if (!newProduct.name || typeof newProduct.name !== "string") {
      toast.error("Product name is required");
      return;
    }
    if (!newProduct.price || typeof newProduct.price !== "string") {
      toast.error("Product price is required");
      return;
    }
    const payload = {
      name: newProduct.name,
      description: newProduct.description || "",
      price: newProduct.price,
      currency: newProduct.currency || "USD",
      is_active: newProduct.is_active ?? true,
    };
    try {
      await createProduct(payload);
      toast.success("Product created");
      setNewProduct({});
      refreshProducts();
    } catch (e) {
      toast.error("Failed to create product");
    }
  };

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("description") || "-"}</div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const price = row.getValue("price") as string;
          const currency = row.original.currency || "USD";
          return (
            <div className="font-medium">
              {currency} {price}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Product } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingProduct(row.original)}
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
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Add New Product Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">+ Add New Product</CardTitle>
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
              placeholder="Product Name"
              value={newProduct.name || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              required
              className="md:w-48"
            />
            <Input
              placeholder="Price"
              type="number"
              step="0.01"
              value={newProduct.price || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              required
              className="md:w-32"
            />
            <Input
              placeholder="Currency"
              value={newProduct.currency || "USD"}
              onChange={(e) =>
                setNewProduct({ ...newProduct, currency: e.target.value })
              }
              className="md:w-24"
            />
            <Button type="submit" className="md:ml-2" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* All Products Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Input
              className="w-64 pl-8"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              aria-label="Search products"
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
                        "No products found."
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
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
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
              value={editingProduct?.name || ""}
              onChange={(e) =>
                setEditingProduct(
                  editingProduct
                    ? { ...editingProduct, name: e.target.value }
                    : null
                )
              }
              required
            />
            <Textarea
              placeholder="Description"
              value={editingProduct?.description || ""}
              onChange={(e) =>
                setEditingProduct(
                  editingProduct
                    ? { ...editingProduct, description: e.target.value }
                    : null
                )
              }
            />
            <Input
              placeholder="Price"
              type="number"
              step="0.01"
              value={editingProduct?.price || ""}
              onChange={(e) =>
                setEditingProduct(
                  editingProduct
                    ? { ...editingProduct, price: e.target.value }
                    : null
                )
              }
              required
            />
            <Input
              placeholder="Currency"
              value={editingProduct?.currency || "USD"}
              onChange={(e) =>
                setEditingProduct(
                  editingProduct
                    ? { ...editingProduct, currency: e.target.value }
                    : null
                )
              }
            />
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingProduct?.is_active ?? true}
                onCheckedChange={(checked) =>
                  setEditingProduct(
                    editingProduct
                      ? { ...editingProduct, is_active: checked }
                      : null
                  )
                }
              />
              <label className="text-sm font-medium">Active</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingProduct(null)}
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
