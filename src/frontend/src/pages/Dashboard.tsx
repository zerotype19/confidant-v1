import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { API_URL } from '../config'
import { Child, Challenge } from '../types/child'
import { ChildSwitcher } from '../components/dashboard/ChildSwitcher'
import { ChallengeCard } from '../components/dashboard/ChallengeCard'
import { StreakTracker } from '../components/dashboard/StreakTracker'
import { JournalPreview } from '../components/dashboard/JournalPreview'
import { CalendarStrip } from '../components/dashboard/CalendarStrip'

interface ProgressSummary {
  streak: number
  coins: number
  pillarProgress: Record<number, number>
  badges: Array<{
    id: string
    name: string
    emoji: string
  }>
}

interface JournalEntry {
  id: string
  content: string
  date: string
  childId: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch children data
  const { data: children, isLoading: isLoadingChildren } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/children`, {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch children')
      }
      return response.json()
    },
  })

  // Set initial selected child
  useEffect(() => {
    if (children?.length && !selectedChildId) {
      setSelectedChildId(children[0].id)
    }
  }, [children, selectedChildId])

  // Fetch daily challenge
  const { data: dailyChallenge, isLoading: isLoadingChallenge } = useQuery<Challenge | null>({
    queryKey: ['dailyChallenge', selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return null;
      const response = await fetch(
        `${API_URL}/api/challenges/today?child_id=${selectedChildId}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch daily challenge');
      }
      return response.json();
    },
    enabled: !!selectedChildId,
  });

  // Fetch progress summary
  const { data: progressSummary, isLoading: isLoadingProgress } = useQuery<ProgressSummary | null>({
    queryKey: ['progressSummary', selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return null;
      const response = await fetch(
        `${API_URL}/api/progress/summary?child_id=${selectedChildId}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch progress summary');
      }
      return response.json();
    },
    enabled: !!selectedChildId,
  });

  // Fetch latest journal entry
  const { data: latestJournalEntry, isLoading: isLoadingJournal } = useQuery<JournalEntry | null>({
    queryKey: ['latestJournal', selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return null;
      const response = await fetch(
        `${API_URL}/api/journal/latest?child_id=${selectedChildId}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch latest journal entry');
      }
      return response.json();
    },
    enabled: !!selectedChildId,
  });

  // Generate calendar days
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString(),
      status: i === 0 ? 'completed' as const : i === 1 ? 'scheduled' as const : 'upcoming' as const,
      pillarId: i === 1 ? 3 : undefined,
    };
  });

  const handleStartChallenge = () => {
    if (selectedChildId && dailyChallenge) {
      navigate(`/challenge/${selectedChildId}`)
    }
  }

  const handleAddJournalEntry = () => {
    if (selectedChildId) {
      navigate(`/journal/${selectedChildId}`)
    }
  }

  const handlePlanAhead = () => {
    if (selectedChildId) {
      navigate(`/calendar/${selectedChildId}`)
    }
  }

  if (isLoadingChildren) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header with Child Switcher */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome{user?.name ? `, ${user.name}` : ''}!
            </h1>
          </div>
          {children && children.length > 0 && (
            <ChildSwitcher
              children={children}
              selectedChildId={selectedChildId}
              onChildSelect={setSelectedChildId}
            />
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <ChallengeCard
              challenge={dailyChallenge ?? null}
              isLoading={isLoadingChallenge}
              error={error}
              isPremium={true} // TODO: Get from user's plan
              onStartChallenge={handleStartChallenge}
            />
            
            <StreakTracker
              summary={progressSummary ?? null}
              isLoading={isLoadingProgress}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <JournalPreview
              latestEntry={latestJournalEntry ?? null}
              isPremium={true} // TODO: Get from user's plan
              onAddEntry={handleAddJournalEntry}
            />

            <CalendarStrip
              days={calendarDays}
              onPlanAhead={handlePlanAhead}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 