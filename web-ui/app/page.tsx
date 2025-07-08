import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockProducts, mockQuotes, mockOpportunities } from "@/lib/mock-data"
import { DollarSign, Package, FileText, Target, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const totalRevenue = mockQuotes.reduce((sum, quote) => sum + quote.totalPrice, 0)
  const activeProducts = mockProducts.filter((p) => p.isActive).length
  const totalQuotes = mockQuotes.length
  const totalOpportunities = mockOpportunities.length

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+12.5%",
    },
    {
      title: "Active Products",
      value: activeProducts.toString(),
      icon: Package,
      change: "+2",
    },
    {
      title: "Total Quotes",
      value: totalQuotes.toString(),
      icon: FileText,
      change: "+5",
    },
    {
      title: "Opportunities",
      value: totalOpportunities.toString(),
      icon: Target,
      change: "+1",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your CRM.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockQuotes.slice(0, 3).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{quote.title}</p>
                    <p className="text-sm text-gray-600">by {quote.createdBy}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${quote.totalPrice.toLocaleString()}</p>
                    <p
                      className={`text-xs capitalize ${
                        quote.status === "sent"
                          ? "text-blue-600"
                          : quote.status === "accepted"
                            ? "text-green-600"
                            : quote.status === "rejected"
                              ? "text-red-600"
                              : "text-gray-600"
                      }`}
                    >
                      {quote.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProducts
                .filter((p) => p.isActive)
                .slice(0, 3)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.description.slice(0, 40)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{product.currency}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
