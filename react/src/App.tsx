import { Link, NavLink, Route, Routes } from 'react-router'
import RequestDetailsPage from './pages/RequestDetailsPage'
import RequestListPage from './pages/RequestListPage'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">Northline Job Manager</span>
        <nav>
          <NavLink to="/" end>Requests</NavLink>
        </nav>
        <span>Sample data</span>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<RequestListPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <Link to="/">← Back to requests</Link>
    </section>
  )
}