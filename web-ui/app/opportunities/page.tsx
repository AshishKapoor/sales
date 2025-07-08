import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockOpportunities } from "@/lib/mock-data"
import { Plus, Calendar, DollarSign } from "lucide-react"

export default function OpportunitiesPage() {
  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "proposal":
        return "bg-blue-100 text-blue-800"
      case "negotiation":
        return "bg-yellow-100 text-yellow-800"
      case "closed won":
        return "bg-green-100 text-green-800"
      case "closed lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-600">Track your sales opportunities and pipeline</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Opportunity
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockOpportunities.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                <Badge className={getStageColor(opportunity.stage)}>{opportunity.stage}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Company</p>
                  <p>{opportunity.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-lg font-semibold">${opportunity.value.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Close Date: {opportunity.closeDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
