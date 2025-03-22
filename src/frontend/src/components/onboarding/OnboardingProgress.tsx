import { useLocation } from 'react-router-dom';

const steps = [
  { id: 'welcome', name: 'Welcome', path: '/onboarding/welcome' },
  { id: 'parent-setup', name: 'Parent Setup', path: '/onboarding/parent-setup' },
  { id: 'child-profile', name: 'Child Profile', path: '/onboarding/child-profile' },
];

export default function OnboardingProgress() {
  const location = useLocation();
  const currentStep = steps.findIndex(step => step.path === location.pathname) + 1;

  return (
    <div className="py-4">
      <div className="mx-auto w-full max-w-md">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div
                      className={`${
                        isCompleted ? 'bg-primary-600' : isCurrent ? 'bg-primary-600' : 'bg-gray-200'
                      } h-8 w-8 rounded-full flex items-center justify-center`}
                    >
                      {isCompleted ? (
                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={`${isCurrent ? 'text-white' : 'text-gray-500'} text-sm font-medium`}>
                          {stepNumber}
                        </span>
                      )}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className={`hidden sm:block absolute top-4 -right-4 h-0.5 w-full ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-900">{step.name}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
} 