interface JournalEntry {
  id: string;
  content: string;
  date: string;
  childId: string;
}

interface JournalPreviewProps {
  latestEntry: JournalEntry | null;
  isPremium: boolean;
  onAddEntry: () => void;
}

export function JournalPreview({ latestEntry, isPremium, onAddEntry }: JournalPreviewProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Journal</h3>
          <button
            onClick={onAddEntry}
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Add Entry
          </button>
        </div>

        {latestEntry ? (
          <div>
            <div className="text-sm text-gray-500 mb-2">
              {new Date(latestEntry.date).toLocaleDateString()}
            </div>
            <p className="text-gray-700">{latestEntry.content}</p>
          </div>
        ) : (
          <p className="text-gray-500">No journal entries yet. Start documenting your journey!</p>
        )}

        {!isPremium && (
          <div className="mt-4 bg-gray-50 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-xl">✨</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Upgrade to Premium
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Get access to full journal history and export capabilities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 