import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AnchorAI | AI Recovery Operating System',
  description: 'AI-driven recovery platform for individuals with Substance Use Disorders. Real-time crisis management, safety planning, and caregiver support.',
}

import ErrorBoundary from '../components/ErrorBoundary'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0a0e1a] text-slate-300 antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
