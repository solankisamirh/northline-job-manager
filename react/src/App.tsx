import RequestListPage from './pages/RequestListPage'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">Northline Job Manager</span>
        <span>Sample data</span>
      </header>
      <main className="container">
        <RequestListPage />
      </main>
    </div>
  )
}