import { useEffect, useState } from 'react'

type Summary = {
  total: number
  byStatus: { status: string; count: number } []
  byService: { serviceType: string; count: number }[]
}

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
      fetch(`${API_URL}/api/quoterequests/summary`)
        .then(res => {
            if (!res.ok) throw new Error(`API retured ${res.status}`)
              return res.json()
          })
          .then(data => setSummary(data))
          .catch(err => setError(err.Error))
    },[])

    if (error) return <p>Error: {error}</p>
    if(!summary) return <p>Loading...</p>

    return (
      <main>
        <h1>Northline Job Manager</h1>
        <p>Total requests: {summary.total}</p>
        <ul>
          {summary.byStatus.map(s => (
            <li key={s.status}>{s.status}: {s.count}</li>
          ))}
        </ul>
      </main>
    )

}

export default App