"use client";

import { useV1QuotesRetrieve } from "@/client/gen/sales/v1/v1";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

export default function QuoteDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? parseInt(params.id) : 0;

  const {
    data: quote,
    error,
    isLoading,
  } = useV1QuotesRetrieve(id, {
    swr: { enabled: !!id && id > 0 },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !quote) {
    notFound();
  }

  // Convert API price strings to numbers for display
  const formatPrice = (price: string | undefined) => {
    return price ? parseFloat(price) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/quotes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {quote.title}
            </h1>
            <p className="text-secondary-foreground">Quote #{quote.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send Quote
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">
                    Opportunity
                  </p>
                  <p>{quote.opportunity_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">
                    Created By
                  </p>
                  <p>{quote.created_by_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">
                    Created Date
                  </p>
                  <p>{new Date(quote.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">
                    Total Amount
                  </p>
                  <p className="text-lg font-semibold">
                    ${formatPrice(quote.total_price).toLocaleString()}
                  </p>
                </div>
              </div>
              {quote.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-secondary-foreground">
                    Notes
                  </p>
                  <p className="mt-1">{quote.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.line_items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                          </div>
                        </td>
                        <td className="text-right py-3">
                          {item.quantity || 0}
                        </td>
                        <td className="text-right py-3">
                          ${formatPrice(item.unit_price).toLocaleString()}
                        </td>
                        <td className="text-right py-3 font-medium">
                          ${formatPrice(item.total_price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right py-3 font-medium">
                        Total:
                      </td>
                      <td className="text-right py-3 text-lg font-bold">
                        ${formatPrice(quote.total_price).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline">
                Edit Quote
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Duplicate Quote
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Convert to Invoice
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-foreground">Subtotal:</span>
                  <span>
                    ${formatPrice(quote.total_price).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-foreground">Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-foreground">Discount:</span>
                  <span>$0.00</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    ${formatPrice(quote.total_price).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
