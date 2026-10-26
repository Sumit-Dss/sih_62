import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Dashboard from './pages/Dashboard'
import CasesList from './pages/CasesList'
import CaseDetail from './pages/CaseDetail'
import NewComplaint from './pages/NewComplaint'
import InstitutionProfile from './pages/InstitutionProfile'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cases/new" element={<NewComplaint />} />
        <Route path="/cases/:caseId" element={<CaseDetail />} />
        <Route path="/cases" element={<CasesList />} />
        <Route path="/institutions/:aicteId" element={<InstitutionProfile />} />
        <Route path="/institutions" element={<ComingSoon title="Institutions List" />} />
        <Route path="/alerts" element={<ComingSoon title="Alerts" />} />
        <Route path="/reports" element={<ComingSoon title="Reports" />} />
        <Route path="/audit" element={<ComingSoon title="Audit Log" />} />
        <Route path="*" element={<ComingSoon title="Page Not Found" />} />
      </Route>
    </Routes>
  )
}
