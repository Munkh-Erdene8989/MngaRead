import { CatalogProvider } from '@/contexts/CatalogContext'
import { AuthProvider } from '@/contexts/AuthContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CatalogProvider>{children}</CatalogProvider>
    </AuthProvider>
  )
}
