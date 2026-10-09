import { useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setMessage('')
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      })
      if (signUpError) throw signUpError

      setMessage(data.session
        ? 'Account created and signed in.'
        : 'Check your email to confirm your account.')
    } catch (submitError) {
      setError(submitError.message || 'Registration failed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={pending}>
          {pending ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      <Link to="/login">Login</Link>
    </main>
  )
}

export default RegisterPage
