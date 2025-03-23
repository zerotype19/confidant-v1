import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '../utils/api'

interface Child {
  id: string
  name: string
  age: number
  age_range: string
}

export default function Children() {
  const queryClient = useQueryClient()
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [newChild, setNewChild] = useState({ name: '', age: '' })

  const { data: children, isLoading, error } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const data = await apiRequest('/children')
      return data
    },
  })

  const addChildMutation = useMutation({
    mutationFn: async (child: { name: string; age: number }) => {
      return apiRequest('/children', {
        method: 'POST',
        body: JSON.stringify(child),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      setIsAddingChild(false)
      setNewChild({ name: '', age: '' })
    },
  })

  const deleteChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      return apiRequest(`/children/${childId}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error loading children</h2>
          <p className="mt-2 text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Children</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your children's profiles and track their progress.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsAddingChild(true)}
            className="btn btn-primary"
          >
            Add child
          </button>
        </div>
      </div>

      {/* Add child form */}
      {isAddingChild && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Child</h3>
            <div className="mt-5">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="label">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newChild.name}
                      onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="age" className="label">
                    Age
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="3"
                      max="13"
                      value={newChild.age}
                      onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (newChild.name && newChild.age) {
                        addChildMutation.mutate({
                          name: newChild.name,
                          age: parseInt(newChild.age),
                        })
                      }
                    }}
                    className="btn btn-primary"
                  >
                    Add child
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingChild(false)
                      setNewChild({ name: '', age: '' })
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Children list */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Your Children</h3>
          <div className="mt-5">
            {children && children.length > 0 ? (
              <div className="space-y-4">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{child.name}</h4>
                      <p className="text-sm text-gray-500">
                        Age: {child.age} ({child.age_range} years)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteChildMutation.mutate(child.id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No children added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 