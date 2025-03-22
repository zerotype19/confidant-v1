import { useNavigate } from 'react-router-dom';

export default function OnboardingWelcome() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/onboarding/parent-setup');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="Confidant"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Confidant
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get started by setting up your family's account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                What to expect
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">1</span>
                  <span className="ml-3">Set up your parent account</span>
                </li>
                <li className="flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">2</span>
                  <span className="ml-3">Create your child's profile</span>
                </li>
                <li className="flex items-center">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">3</span>
                  <span className="ml-3">Start monitoring their digital activity</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 