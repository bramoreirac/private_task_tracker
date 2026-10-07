import { createClient } from '@supabase/supabase-js'

export function createTaskClient(accessToken) {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_PUBLISHABLE_KEY,
        {
            accessToken: async () => accessToken,
        },
    )
}