import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Mail, Phone, MapPin } from "lucide-react"

const mockCustomers = [
  {
    id: "1",
    name: "Acme Corporation",
    contact: "John Smith",
    email: "john.smith@acme.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, New York, NY 10001",
    status: "Active",
  },
  {
    id: "2",
    name: "TechStart Inc",
    contact: "Sarah Johnson",
    email: "sarah@techstart.com",
    phone: "+1 (555) 987-6543",
    address: "456 Innovation Ave, San Francisco, CA 94105",
    status: "Active",
  },
]

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle className="text-lg">{customer.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Primary Contact</p>
                  <p>{customer.contact}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm">{customer.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
