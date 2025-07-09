"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockQuotes } from "@/lib/mock-data";
import type { Quote } from "@/types";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Quote["status"]) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotes</h1>
          <p className="text-secondary-foreground">
            Manage your sales quotes and proposals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Quote
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{quote.title}</h3>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-secondary-foreground">
                    <p>
                      Created by {quote.createdBy} on{" "}
                      {quote.createdAt.toLocaleDateString()}
                    </p>
                    <p className="mt-1">{quote.notes}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${quote.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-secondary-foreground">
                      {quote.lineItems.length} items
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/quotes/${quote.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
