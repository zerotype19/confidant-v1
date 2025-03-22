import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome to Confidant</h1>
        <p className="text-lg text-muted-foreground">
          A modern web application for child development and family engagement.
        </p>
      </main>
      <Toaster />
    </div>
  )
}

export default App 