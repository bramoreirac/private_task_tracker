import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import { supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p>Loading session...</p>

  return (
    <>
      <p className="session-status" role="status">
        {session ? `Signed in as ${session.user.email}` : 'Signed out'}
      </p>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={session ? '/dashboard' : '/login'} replace />}
        />
        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={session ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route
          path="/dashboard"
          element={
            session
              ? <DashboardPage email={session.user.email} />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </>
  )
}

export default App
