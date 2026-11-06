import { Link, NavLink, Route, Routes } from 'react-router'
import RequestDetailsPage from './pages/RequestDetailsPage'
import RequestListPage from './pages/RequestListPage'
import NewRequestPage from './pages/NewRequestPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <div className="app">
            <a href="#main" className="skip-link">Skip to main content</a>
      <header className="app-header">
        <span className="brand">Northline Job Manager</span>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/" end>Requests</NavLink>
          <NavLink to="/requests/new">New request</NavLink>
        </nav>
        <span>Sample data</span>
      </header>
            <main id="main" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<RequestListPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/requests/new" element={<NewRequestPage />} />
        </Routes>
      </main>
    </div>
  )
}

function NotFound() {
  return (
    <section>
      <title>Page not found · Northline Job Manager</title>
      <h1>Page not found</h1>
      <Link to="/">← Back to requests</Link>
    </section>
  )
}