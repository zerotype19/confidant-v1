import { Challenge } from '../../types/child';

interface ChallengeCardProps {
  challenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  isPremium: boolean;
  onStartChallenge: () => void;
}

const PILLAR_COLORS: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-purple-100 text-purple-800',
  4: 'bg-yellow-100 text-yellow-800',
  5: 'bg-red-100 text-red-800'
};

export function ChallengeCard({ 
  challenge, 
  isLoading, 
  error, 
  isPremium, 
  onStartChallenge 
}: ChallengeCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white shadow sm:rounded-lg animate-pulse">
        <div className="px-4 py-5 sm:p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500">No challenge available for today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Challenge of the Day</h2>
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${PILLAR_COLORS[challenge.pillar_id]}`}>
            Pillar {challenge.pillar_id}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
            <p className="mt-1 text-gray-500">{challenge.description}</p>
          </div>

          {challenge.estimated_time && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {challenge.estimated_time}
            </div>
          )}

          {isPremium && (
            <>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900">Pro Tip</h4>
                <p className="mt-1 text-gray-500">{challenge.tip}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Example Dialogue</h4>
                <p className="mt-1 text-gray-500 italic">"{challenge.example_dialogue}"</p>
              </div>
            </>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={onStartChallenge}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 