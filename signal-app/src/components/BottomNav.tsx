import { NavLink } from 'react-router-dom'
import { Activity, CalendarCheck, Dumbbell, Pill, Settings } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Today', icon: Activity, end: true },
  { to: '/check-in', label: 'Check-in', icon: CalendarCheck },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/supplements', label: 'Supplements', icon: Pill },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
