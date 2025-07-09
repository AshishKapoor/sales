"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { mockInteractions } from "@/lib/mock-data"
import type { Interaction } from "@/types"
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Video,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>(mockInteractions)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInteractions = interactions.filter(
    (interaction) =>
      interaction.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.relatedTo.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: Interaction["type"]) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "demo":
        return <Video className="h-4 w-4" />
      case "proposal":
        return <FileText className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: Interaction["type"]) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-800"
      case "email":
        return "bg-green-100 text-green-800"
      case "meeting":
        return "bg-purple-100 text-purple-800"
      case "demo":
        return "bg-orange-100 text-orange-800"
      case "proposal":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDirectionIcon = (direction: Interaction["direction"]) => {
    return direction === "inbound" ? (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-blue-600" />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interactions</h1>
          <p className="text-gray-600">Track all customer interactions and communications</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Interaction
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search interactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredInteractions.map((interaction) => (
          <Card key={interaction.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(interaction.type)}
                    <CardTitle className="text-lg">{interaction.subject}</CardTitle>
                  </div>
                  {getDirectionIcon(interaction.direction)}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(interaction.type)}>{interaction.type}</Badge>
                  <Badge variant="outline">{interaction.direction}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700">{interaction.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Related to: {interaction.relatedTo.name}</span>
                    <span>By: {interaction.createdBy}</span>
                    {interaction.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{interaction.duration} min</span>
                      </div>
                    )}
                  </div>
                  <span>{interaction.createdAt.toLocaleDateString()}</span>
                </div>

                {interaction.outcome && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-green-800">Outcome:</p>
                    <p className="text-sm text-green-700">{interaction.outcome}</p>
                  </div>
                )}

                {interaction.scheduledAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Scheduled: {interaction.scheduledAt.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
