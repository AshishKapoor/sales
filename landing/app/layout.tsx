import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sales CRM',
  description: 'Created by Sannty',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
