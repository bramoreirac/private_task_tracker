import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function DashboardPage({ email }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)
  const [taskError, setTaskError] = useState('')
  const [taskMessage, setTaskMessage] = useState('')
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [listError, setListError] = useState('')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [toggleError, setToggleError] = useState('')
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadTasks() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session?.access_token) throw new Error('Please sign in again.')

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error?.message || 'Could not load tasks.')
        }

        if (!ignore) setTasks(result.tasks)
      } catch (loadError) {
        if (!ignore) setListError(loadError.message || 'Could not load tasks.')
      } finally {
        if (!ignore) setLoadingTasks(false)
      }
    }

    loadTasks()
    return () => { ignore = true }
  }, [])

  const handleDeleteTask = async (taskId) => {
    if (deletingTaskId !== null || updatingTaskId !== null) return
    setDeletingTaskId(taskId)
    setDeleteError('')

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.access_token) throw new Error('Please sign in again.')

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error?.message || 'Could not delete task.')
      }

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    } catch (removeError) {
      setDeleteError(removeError.message || 'Could not delete task. Please try again.')
    } finally {
      setDeletingTaskId(null)
    }
  }

  const handleToggleTask = async (taskId, completed) => {
    if (updatingTaskId !== null || deletingTaskId !== null) return
    setUpdatingTaskId(taskId)
    setToggleError('')

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.access_token) throw new Error('Please sign in again.')

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ completed }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error?.message || 'Could not update task.')
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) => task.id === result.task.id ? result.task : task)
      )
    } catch (updateError) {
      setToggleError(updateError.message || 'Could not update task. Please try again.')
    } finally {
      setUpdatingTaskId(null)
    }
  }

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

  const handleCreateTask = async (event) => {
    event.preventDefault()
    if (creatingTask) return

    setTaskError('')
    setTaskMessage('')
    const trimmedTitle = title.trim()
    if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
      setTaskError('Title must be 1 to 200 characters.')
      return
    }

    setCreatingTask(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.access_token) throw new Error('Please sign in again.')

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title: trimmedTitle }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error?.message || 'Could not create task.')
      }

      setTitle('')
      setTaskMessage('Task created.')
      setTasks((currentTasks) => [result.task, ...currentTasks])
    } catch (submitError) {
      setTaskError(submitError.message || 'Could not create task. Please try again.')
    } finally {
      setCreatingTask(false)
    }
  }


  return (
    <main className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Signed in as {email}</p>
      <button type="button" onClick={handleLogout} disabled={pending}>
        {pending ? 'Logging out...' : 'Log out'}
      </button>
      <form onSubmit={handleCreateTask}>
        <label htmlFor="title">New Task</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={creatingTask}
          required
        />
        <button type="submit" disabled={creatingTask}>
          {creatingTask ? 'Creating...' : 'Create Task'}
        </button>
      </form>
      {taskError && <p role="alert">{taskError}</p>}
      {taskMessage && <p role="status">{taskMessage}</p>}
      {error && <p role="alert">{error}</p>}
      <section aria-labelledby="tasks-heading">
        <h2 id="tasks-heading">Your tasks</h2>
        {loadingTasks ? (
          <p role="status">Loading tasks...</p>
        ) : listError ? (
          <p role="alert">{listError}</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id, !task.completed)}
                    disabled={updatingTaskId !== null || deletingTaskId !== null}
                  />
                  {task.title}
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={deletingTaskId !== null || updatingTaskId !== null}
                >
                  {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
        {deleteError && <p role="alert">{deleteError}</p>}
        {toggleError && <p role="alert">{toggleError}</p>}
      </section>
    </main>
  )
}

export default DashboardPage
