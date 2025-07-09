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
import type { Task } from "../../client/gen/sales/task";
import type { User } from "../../client/gen/sales/user";
import { TaskTypeEnum } from "../../client/gen/sales/taskTypeEnum";
import { TaskStatusEnum } from "../../client/gen/sales/taskStatusEnum";
import {
  useV1TasksList,
  useV1TasksCreate,
  getV1TasksListKey,
  v1TasksPartialUpdate,
  v1TasksDestroy,
  useV1LeadsList,
  useV1OpportunitiesList,
  useV1UsersList,
} from "../../client/gen/sales/v1/v1";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TasksTable() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
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
  const { data, isLoading, error } = useV1TasksList(queryParams);
  const { data: leadsData } = useV1LeadsList({ page: 1 });
  const { data: opportunitiesData } = useV1OpportunitiesList({ page: 1 });
  const { data: usersData } = useV1UsersList({ ordering: "username" });
  const tasks = data?.results || [];
  const leads = leadsData?.results || [];
  const opportunities = opportunitiesData?.results || [];
  const users = usersData || [];
  const { trigger: createTask, isMutating: isCreating } = useV1TasksCreate();

  const refreshTasks = () => {
    mutate(getV1TasksListKey(queryParams));
  };

  const handleDelete = async (taskToDelete: Task) => {
    if (!window.confirm(`Delete task '${taskToDelete.title}'?`)) return;
    try {
      await v1TasksDestroy(taskToDelete.id);
      toast.success("Task deleted successfully");
      refreshTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleEdit = async () => {
    if (!editingTask) return;
    try {
      await v1TasksPartialUpdate(editingTask.id, {
        title: editingTask.title,
        type: editingTask.type,
        due_date: editingTask.due_date,
        status: editingTask.status,
        related_lead: editingTask.related_lead,
        related_opportunity: editingTask.related_opportunity,
        owner: editingTask.owner,
        notes: editingTask.notes,
      });
      toast.success("Task updated");
      setEditingTask(null);
      refreshTasks();
    } catch (e) {
      toast.error("Failed to update task");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || typeof newTask.title !== "string") {
      toast.error("Task title is required");
      return;
    }
    if (!newTask.type) {
      toast.error("Task type is required");
      return;
    }
    if (!newTask.due_date) {
      toast.error("Due date is required");
      return;
    }
    // If owner is not set, default to current user
    const ownerId = newTask.owner;
    if (!ownerId) {
      toast.error("Owner is required");
      return;
    }
    const payload = {
      title: newTask.title,
      type: newTask.type,
      due_date: newTask.due_date,
      status: newTask.status || TaskStatusEnum.pending,
      related_lead: newTask.related_lead || null,
      related_opportunity: newTask.related_opportunity || null,
      owner: ownerId,
      notes: newTask.notes || "",
    };
    try {
      await createTask(payload);
      toast.success("Task created");
      setNewTask({});
      refreshTasks();
    } catch (e) {
      toast.error("Failed to create task");
    }
  };

  const getStatusBadge = (status: TaskStatusEnum) => {
    switch (status) {
      case TaskStatusEnum.completed:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case TaskStatusEnum.overdue:
        return <Badge variant="destructive">Overdue</Badge>;
      case TaskStatusEnum.pending:
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getTypeBadge = (type: TaskTypeEnum) => {
    const colors = {
      [TaskTypeEnum.call]: "bg-blue-100 text-blue-800",
      [TaskTypeEnum.email]: "bg-purple-100 text-purple-800",
      [TaskTypeEnum.meeting]: "bg-orange-100 text-orange-800",
      [TaskTypeEnum.demo]: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge variant="secondary" className={colors[type]}>
        {type}
      </Badge>
    );
  };

  const columns = useMemo<ColumnDef<Task, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("title")}</div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => getTypeBadge(row.getValue("type")),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("due_date"));
          return <div className="text-sm">{date.toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: "related_lead_name",
        header: "Lead",
        cell: ({ row }) => {
          const leadName = row.getValue("related_lead_name") as string;
          return leadName ? (
            <div className="text-sm">{leadName}</div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "related_opportunity_name",
        header: "Opportunity",
        cell: ({ row }) => {
          const oppName = row.getValue("related_opportunity_name") as string;
          return oppName ? (
            <div className="text-sm">{oppName}</div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: "owner_name",
        header: "Owner",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("owner_name")}</div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Task } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingTask(row.original)}
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
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Add New Task Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">+ Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="Task Title"
                value={newTask.title || ""}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
              />
              <Select
                value={newTask.type || ""}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, type: value as TaskTypeEnum })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskTypeEnum).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newTask.due_date || ""}
                onChange={(e) =>
                  setNewTask({ ...newTask, due_date: e.target.value })
                }
                required
              />
              <Select
                value={newTask.status || ""}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, status: value as TaskStatusEnum })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newTask.related_lead?.toString() || "none"}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    related_lead:
                      value && value !== "none" ? parseInt(value) : null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Lead (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Lead</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id.toString()}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newTask.related_opportunity?.toString() || "none"}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    related_opportunity:
                      value && value !== "none" ? parseInt(value) : null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Opportunity (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Opportunity</SelectItem>
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
              <Select
                value={newTask.owner?.toString() || ""}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    owner: value ? parseInt(value) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Notes (Optional)"
              value={newTask.notes || ""}
              onChange={(e) =>
                setNewTask({ ...newTask, notes: e.target.value })
              }
            />
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Task
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* All Tasks Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Input
              className="w-64 pl-8"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              aria-label="Search tasks"
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
                        "No tasks found."
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
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit();
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Title"
              value={editingTask?.title || ""}
              onChange={(e) =>
                setEditingTask(
                  editingTask ? { ...editingTask, title: e.target.value } : null
                )
              }
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={editingTask?.type || ""}
                onValueChange={(value) =>
                  setEditingTask(
                    editingTask
                      ? { ...editingTask, type: value as TaskTypeEnum }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskTypeEnum).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={editingTask?.status || ""}
                onValueChange={(value) =>
                  setEditingTask(
                    editingTask
                      ? { ...editingTask, status: value as TaskStatusEnum }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="date"
              value={editingTask?.due_date || ""}
              onChange={(e) =>
                setEditingTask(
                  editingTask
                    ? { ...editingTask, due_date: e.target.value }
                    : null
                )
              }
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={editingTask?.related_lead?.toString() || "none"}
                onValueChange={(value) =>
                  setEditingTask(
                    editingTask
                      ? {
                          ...editingTask,
                          related_lead:
                            value && value !== "none" ? parseInt(value) : null,
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Lead (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Lead</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id.toString()}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={editingTask?.related_opportunity?.toString() || "none"}
                onValueChange={(value) =>
                  setEditingTask(
                    editingTask
                      ? {
                          ...editingTask,
                          related_opportunity:
                            value && value !== "none" ? parseInt(value) : null,
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Opportunity (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Opportunity</SelectItem>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select
                value={editingTask?.owner?.toString() || ""}
                onValueChange={(value) =>
                  setEditingTask(
                    editingTask
                      ? {
                          ...editingTask,
                          owner: value ? parseInt(value) : editingTask.owner,
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Notes"
              value={editingTask?.notes || ""}
              onChange={(e) =>
                setEditingTask(
                  editingTask ? { ...editingTask, notes: e.target.value } : null
                )
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTask(null)}
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
