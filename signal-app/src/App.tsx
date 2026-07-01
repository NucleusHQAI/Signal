import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { CheckInPage } from './pages/CheckInPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { SupplementsPage } from './pages/SupplementsPage'
import { WeeklyReviewPage } from './pages/WeeklyReviewPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/supplements" element={<SupplementsPage />} />
          <Route path="/weekly-review" element={<WeeklyReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
