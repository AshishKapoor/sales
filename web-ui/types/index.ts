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
