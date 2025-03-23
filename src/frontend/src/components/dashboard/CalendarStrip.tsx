interface CalendarDay {
  date: string;
  status: 'completed' | 'missed' | 'scheduled' | 'upcoming';
  pillarId?: number;
}

interface CalendarStripProps {
  days: CalendarDay[];
  onPlanAhead: () => void;
}

const STATUS_ICONS = {
  completed: '✔️',
  missed: '⚠️',
  scheduled: '📅',
  upcoming: '•'
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarStrip({ days, onPlanAhead }: CalendarStripProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Week Ahead</h3>
          <button
            onClick={onPlanAhead}
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Plan Ahead
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const date = new Date(day.date);
            return (
              <div
                key={day.date}
                className={`text-center p-2 rounded-lg ${
                  day.status === 'completed'
                    ? 'bg-green-50'
                    : day.status === 'missed'
                    ? 'bg-red-50'
                    : day.status === 'scheduled'
                    ? 'bg-blue-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-500">
                  {DAYS[date.getDay()]}
                </div>
                <div className="text-lg my-1">
                  {STATUS_ICONS[day.status]}
                </div>
                <div className="text-sm font-medium">
                  {date.getDate()}
                </div>
                {day.pillarId && (
                  <div className="text-xs text-gray-500 mt-1">
                    P{day.pillarId}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 