export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  isActive: boolean
  createdAt: Date
}

export interface Quote {
  id: string
  opportunityId: string
  title: string
  totalPrice: number
  createdBy: string
  createdAt: Date
  notes: string
  status: "draft" | "sent" | "accepted" | "rejected"
  lineItems: QuoteLineItem[]
}

export interface QuoteLineItem {
  id: string
  quoteId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Opportunity {
  id: string
  name: string
  company: string
  value: number
  stage: string
  closeDate: Date
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  title?: string
  source: "website" | "referral" | "cold_call" | "social_media" | "trade_show" | "other"
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted"
  rating: "hot" | "warm" | "cold"
  assignedTo: string
  createdAt: Date
  convertedAt?: Date
  convertedOpportunityId?: string
  notes: string
}

export interface Task {
  id: string
  title: string
  description: string
  type: "call" | "email" | "meeting" | "follow_up" | "demo" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  assignedTo: string
  relatedTo?: {
    type: "lead" | "opportunity" | "customer" | "quote"
    id: string
    name: string
  }
  dueDate: Date
  createdAt: Date
  completedAt?: Date
}

export interface Interaction {
  id: string
  type: "call" | "email" | "meeting" | "note" | "demo" | "proposal"
  subject: string
  description: string
  direction: "inbound" | "outbound"
  duration?: number // in minutes
  outcome?: string
  relatedTo: {
    type: "lead" | "opportunity" | "customer"
    id: string
    name: string
  }
  createdBy: string
  createdAt: Date
  scheduledAt?: Date
  completedAt?: Date
}
