import { useState } from 'react'
import { supabase } from '../lib/supabase'

function DashboardPage({ email }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    if (pending) return
    setPending(true)
    setError('')

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
    } catch (submitError) {
      setError(submitError.message || 'Could not log out. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Signed in as {email}</p>
      <button type="button" onClick={handleLogout} disabled={pending}>
        {pending ? 'Logging out...' : 'Log out'}
      </button>
      {error && <p role="alert">{error}</p>}
    </main>
  )
}

export default DashboardPage
