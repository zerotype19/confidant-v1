import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface Child {
  id: string
  name: string
  age: number
  challenges: Challenge[]
}

interface Challenge {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'archived'
  progress: number
}

export default function Dashboard() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null)

  const { data: children, isLoading } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const response = await fetch('/api/children')
      if (!response.ok) {
        throw new Error('Failed to fetch children')
      }
      return response.json()
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
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            A summary of your family's activities and challenges.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="btn btn-primary"
          >
            Add child
          </button>
        </div>
      </div>

      {/* Children selector */}
      <div className="flex space-x-4">
        {children?.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedChild === child.id
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>

      {/* Active challenges */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Active Challenges</h3>
          <div className="mt-5">
            <div className="space-y-4">
              {children
                ?.find((child) => child.id === selectedChild)
                ?.challenges.filter((challenge) => challenge.status === 'active')
                .map((challenge) => (
                  <div
                    key={challenge.id}
                    className="relative pt-1"
                  >
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                          {challenge.title}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-primary-600">
                          {challenge.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                      <div
                        style={{ width: `${challenge.progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">{challenge.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent journal entries */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Journal Entries</h3>
          <div className="mt-5">
            <div className="space-y-4">
              {/* Placeholder for journal entries */}
              <p className="text-sm text-gray-500">No recent journal entries.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 