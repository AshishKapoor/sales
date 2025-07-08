import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockQuotes } from "@/lib/mock-data"
import { ArrowLeft, Download, Send } from "lucide-react"
import Link from "next/link"

interface QuoteDetailPageProps {
  params: {
    id: string
  }
}

export default function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const quote = mockQuotes.find((q) => q.id === params.id)

  if (!quote) {
    notFound()
  }

  const getStatusColor = (status: typeof quote.status) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">{quote.title}</h1>
            <p className="text-gray-600">Quote #{quote.id}</p>
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
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created By</p>
                  <p>{quote.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created Date</p>
                  <p>{quote.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-lg font-semibold">${quote.totalPrice.toLocaleString()}</p>
                </div>
              </div>
              {quote.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Notes</p>
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
                    {quote.lineItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">{item.product.description}</p>
                          </div>
                        </td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">${item.unitPrice.toLocaleString()}</td>
                        <td className="text-right py-3 font-medium">${item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right py-3 font-medium">
                        Total:
                      </td>
                      <td className="text-right py-3 text-lg font-bold">${quote.totalPrice.toLocaleString()}</td>
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
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${quote.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span>$0.00</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${quote.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
