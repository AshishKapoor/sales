import type { Product, Quote, Opportunity } from "@/types"

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Enterprise Software License",
    description: "Annual enterprise software license with full support",
    price: 10000,
    currency: "USD",
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Professional Services",
    description: "Implementation and consulting services",
    price: 150,
    currency: "USD",
    isActive: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Training Package",
    description: "Comprehensive training for end users",
    price: 2500,
    currency: "USD",
    isActive: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    name: "Support Package",
    description: "24/7 premium support package",
    price: 5000,
    currency: "USD",
    isActive: false,
    createdAt: new Date("2024-02-10"),
  },
]

export const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    name: "Acme Corp Implementation",
    company: "Acme Corporation",
    value: 50000,
    stage: "Proposal",
    closeDate: new Date("2024-03-15"),
  },
  {
    id: "2",
    name: "TechStart Upgrade",
    company: "TechStart Inc",
    value: 25000,
    stage: "Negotiation",
    closeDate: new Date("2024-02-28"),
  },
]

export const mockQuotes: Quote[] = [
  {
    id: "1",
    opportunityId: "1",
    title: "Acme Corp - Enterprise Package",
    totalPrice: 17500,
    createdBy: "John Doe",
    createdAt: new Date("2024-01-25"),
    notes: "Initial quote for enterprise implementation",
    status: "sent",
    lineItems: [
      {
        id: "1",
        quoteId: "1",
        product: mockProducts[0],
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      },
      {
        id: "2",
        quoteId: "1",
        product: mockProducts[1],
        quantity: 50,
        unitPrice: 150,
        totalPrice: 7500,
      },
    ],
  },
  {
    id: "2",
    opportunityId: "2",
    title: "TechStart - Training & Support",
    totalPrice: 7500,
    createdBy: "Jane Smith",
    createdAt: new Date("2024-02-05"),
    notes: "Training and support package for existing customer",
    status: "draft",
    lineItems: [
      {
        id: "3",
        quoteId: "2",
        product: mockProducts[2],
        quantity: 2,
        unitPrice: 2500,
        totalPrice: 5000,
      },
      {
        id: "4",
        quoteId: "2",
        product: mockProducts[3],
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500,
      },
    ],
  },
]
