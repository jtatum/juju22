import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './routes/DashboardPage'
import PluginsPage from './routes/PluginsPage'
import PluginDetailPage from './routes/PluginDetailPage'
import RulesPage from './routes/RulesPage'
import RuleEditorPage from './routes/RuleEditorPage'
import EventsPage from './routes/EventsPage'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="plugins" element={<PluginsPage />} />
          <Route path="plugins/:pluginId" element={<PluginDetailPage />} />
          <Route path="rules" element={<RulesPage />} />
          <Route path="rules/new" element={<RuleEditorPage />} />
          <Route path="rules/:ruleId" element={<RuleEditorPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
