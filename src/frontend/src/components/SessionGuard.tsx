import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface SessionGuardProps {
  children: ReactNode
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        setIsAuthenticated(false)
        navigate('/signin', { state: { from: location.pathname } })
        return
      }

      try {
        // TODO: Implement actual token validation
        const response = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Invalid token')
        }

        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem('auth_token')
        setIsAuthenticated(false)
        navigate('/signin', { state: { from: location.pathname } })
      }
    }

    checkAuth()
  }, [navigate, location])

  if (isAuthenticated === null) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
} 