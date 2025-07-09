"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockLeads } from "@/lib/mock-data";
import type { Lead } from "@/types";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  User,
  Edit,
  Trash2,
} from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = leads.filter(
    (lead) =>
      `${lead.firstName} ${lead.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "unqualified":
        return "bg-red-100 text-red-800";
      case "converted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRatingColor = (rating: Lead["rating"]) => {
    switch (rating) {
      case "hot":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-orange-100 text-orange-800";
      case "cold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-secondary-foreground">
            Manage your sales leads and prospects
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <Card key={lead.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {lead.firstName} {lead.lastName}
                </CardTitle>
                <div className="flex flex-col space-y-1">
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <Badge className={getRatingColor(lead.rating)}>
                    {lead.rating}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{lead.company}</span>
                </div>
                {lead.title && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{lead.title}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-xs text-secondary-foreground">
                    Assigned to: {lead.assignedTo}
                  </p>
                  <p className="text-xs text-secondary-foreground">
                    Created: {lead.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-secondary-foreground">
                    Source: {lead.source.replace("_", " ")}
                  </p>
                </div>
                {lead.notes && (
                  <div className="pt-2">
                    <p className="text-sm text-secondary-foreground">
                      {lead.notes}
                    </p>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
