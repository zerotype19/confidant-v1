import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-full bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-primary-600 sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page not found</h1>
              <p className="mt-1 text-base text-gray-500">Please check the URL in the address bar and try again.</p>
              <div className="mt-6 flex space-x-3">
                <Link
                  to="/"
                  className="btn btn-primary"
                >
                  Go back home
                </Link>
                <Link
                  to="/dashboard"
                  className="btn btn-secondary"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 