interface ProgressSummary {
  streak: number;
  coins: number;
  pillarProgress: Record<number, number>;
  badges: Array<{
    id: string;
    name: string;
    emoji: string;
  }>;
}

interface StreakTrackerProps {
  summary: ProgressSummary | null;
  isLoading: boolean;
}

export function StreakTracker({ summary, isLoading }: StreakTrackerProps) {
  if (isLoading) {
    return (
      <div className="bg-white shadow sm:rounded-lg animate-pulse">
        <div className="px-4 py-5 sm:p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Tracker</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Streak and Coins */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <span className="text-lg font-medium">{summary.streak} day streak</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪙</span>
              <span className="text-lg font-medium">{summary.coins} coins</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {summary.badges.map(badge => (
              <div
                key={badge.id}
                className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1"
                title={badge.name}
              >
                <span>{badge.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar Progress */}
        <div className="mt-6 space-y-4">
          {Object.entries(summary.pillarProgress).map(([pillarId, progress]) => (
            <div key={pillarId} className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Pillar {pillarId}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {progress}%
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 