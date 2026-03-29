'use client'

import { AppLayout } from '@/components/AppLayout'
import { TenantProvider } from '@/contexts/TenantContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <TenantProvider>
        <AppLayout>{children}</AppLayout>
      </TenantProvider>
    </ProtectedRoute>
  )
}
