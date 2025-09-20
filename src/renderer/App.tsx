import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './routes/DashboardPage'
import PluginsPage from './routes/PluginsPage'
import PluginDetailPage from './routes/PluginDetailPage'
import RulesPage from './routes/RulesPage'
import RuleEditorPage from './routes/RuleEditorPage'
import EventsPage from './routes/EventsPage'
import VariablesPage from './routes/VariablesPage'
import SettingsPage from './routes/SettingsPage'
import OnboardingWizard from './components/OnboardingWizard'
import './App.css'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const isComplete = await window.juju22.settings.get('onboardingComplete')
      if (!isComplete) {
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error('Failed to check onboarding status', error)
    } finally {
      setOnboardingChecked(true)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (!onboardingChecked) {
    return <div className="app-loading">Loading...</div>
  }

  return (
    <>
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
            <Route path="variables" element={<VariablesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
    </>
  )
}

export default App
