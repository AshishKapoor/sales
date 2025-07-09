"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { mockTasks } from "@/lib/mock-data";
import type { Task } from "@/types";
import {
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && task.status !== "completed") ||
      (filter === "completed" && task.status === "completed");
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-foreground";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-foreground";
    }
  };

  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-secondary-foreground" />;
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "completed" ? "pending" : "completed",
            }
          : task
      )
    );
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-secondary-foreground">
            Manage your tasks and activities
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => toggleTaskComplete(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3
                          className={`text-lg font-semibold ${
                            task.status === "completed"
                              ? "line-through text-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        {getPriorityIcon(task.priority)}
                      </div>
                      <p
                        className={`text-secondary-foreground mt-1 ${
                          task.status === "completed" ? "line-through" : ""
                        }`}
                      >
                        {task.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-secondary-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span
                            className={
                              isOverdue(task.dueDate) &&
                              task.status !== "completed"
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            Due: {task.dueDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{task.assignedTo}</span>
                        </div>
                        {task.relatedTo && (
                          <div>Related to: {task.relatedTo.name}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{task.type}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
