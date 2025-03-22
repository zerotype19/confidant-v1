import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface User {
  id: string
  email: string
  name: string
  subscription: {
    status: 'free' | 'premium'
    expiresAt?: string
  }
}

export default function Profile() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      setName(data.name)
      return data
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setIsEditing(false)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your account settings and subscription.
          </p>
        </div>
      </div>

      {/* Profile information */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
          <div className="mt-5">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  Name
                </label>
                <div className="mt-1">
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user?.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <div className="mt-1">
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => updateProfileMutation.mutate(name)}
                      className="btn btn-primary"
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setName(user?.name || '')
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Subscription information */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription</h3>
          <div className="mt-5">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Current Plan</p>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.subscription.status === 'premium' ? 'Premium' : 'Free'}
                </p>
              </div>
              {user?.subscription.expiresAt && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Expires</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(user.subscription.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {user?.subscription.status === 'free' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/api/subscriptions/upgrade'}
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 