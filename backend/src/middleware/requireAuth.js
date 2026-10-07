import { createClient } from '@supabase/supabase-js'

function sendUnauthorized(res) {
  return res.status(401).json({
    error: { code: 'unauthorized', message: 'Authentication required' },
  })
}

export async function requireAuth(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '')
  if (!match) return sendUnauthorized(res)

  const token = match[1]

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      },
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return sendUnauthorized(res)

    req.user = user
    req.accessToken = token
    next()
  } catch {
    return res.status(500).json({
      error: { code: 'internal_error', message: 'Unexpected server error' },
    })
  }
}
