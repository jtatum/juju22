import { useState } from 'react'
import { useNotificationStore } from '../stores/useNotificationStore'
import './OnboardingWizard.css'

interface OnboardingWizardProps {
  onComplete: () => void
  onSkip: () => void
}

type Step = 'welcome' | 'plugins' | 'sample-rule' | 'complete'

export const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [sampleRuleCreated, setSampleRuleCreated] = useState(false)
  const addNotification = useNotificationStore((state) => state.addNotification)

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('plugins')
        break
      case 'plugins':
        setCurrentStep('sample-rule')
        break
      case 'sample-rule':
        setCurrentStep('complete')
        break
      case 'complete':
        handleComplete()
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'plugins':
        setCurrentStep('welcome')
        break
      case 'sample-rule':
        setCurrentStep('plugins')
        break
      case 'complete':
        setCurrentStep('sample-rule')
        break
    }
  }

  const handleComplete = async () => {
    try {
      // Mark onboarding as complete in settings
      await window.aidle.settings.set('onboardingComplete', true)
      addNotification({
        type: 'success',
        title: 'Welcome to Aidle!',
        message: 'You can always access help from the Settings page.',
      })
      onComplete()
    } catch {
      // Still complete even if saving fails
      onComplete()
    }
  }

  const handleSkip = async () => {
    try {
      await window.aidle.settings.set('onboardingComplete', true)
      onSkip()
    } catch {
      // Still skip even if saving fails
      onSkip()
    }
  }

  const createSampleRule = async () => {
    if (sampleRuleCreated) return // Prevent duplicate creation

    try {
      // Create a simple welcome rule
      const sampleRule = {
        id: `sample-rule-${Date.now()}`,
        name: 'Welcome Message',
        description: 'Shows a welcome message every hour',
        enabled: false,
        trigger: {
          pluginId: 'system',
          triggerId: 'interval',
          config: { interval: 3600000 } // 1 hour
        },
        actions: [
          {
            pluginId: 'system',
            actionId: 'notification',
            config: {
              title: 'Hello from Aidle!',
              message: 'Your automation is working!'
            }
          }
        ],
        priority: 0
      }

      await window.aidle.rules.save(sampleRule)
      setSampleRuleCreated(true)
      addNotification({
        type: 'success',
        title: 'Sample Rule Created',
        message: 'A sample rule has been created. You can enable it from the Rules page.',
      })
    } catch {
      addNotification({
        type: 'error',
        title: 'Failed to Create Sample',
        message: 'You can create rules manually from the Rules page.',
      })
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="onboarding-step">
            <h2>Welcome to Aidle</h2>
            <div className="onboarding-icon">🤖</div>
            <p>
              Aidle is your personal automation platform for content creation.
              Connect services, create rules, and let automation handle the repetitive tasks.
            </p>
            <ul className="feature-list">
              <li>✨ Connect multiple services and platforms</li>
              <li>⚡ Create powerful automation rules</li>
              <li>📊 Track variables and metrics</li>
              <li>🔄 Import/export and backup your configurations</li>
            </ul>
          </div>
        )

      case 'plugins':
        return (
          <div className="onboarding-step">
            <h2>Plugins Power Your Automations</h2>
            <div className="onboarding-icon">🔌</div>
            <p>
              Plugins connect Aidle to external services and provide triggers and actions
              for your automation rules.
            </p>
            <div className="plugin-examples">
              <div className="plugin-example">
                <h4>System Plugin</h4>
                <p>Built-in plugin for timers, notifications, and system events</p>
              </div>
              <div className="plugin-example">
                <h4>Twitch Plugin</h4>
                <p>React to chat, subscriptions, and stream events</p>
              </div>
              <div className="plugin-example">
                <h4>Custom Plugins</h4>
                <p>Add your own plugins to extend functionality</p>
              </div>
            </div>
          </div>
        )

      case 'sample-rule':
        return (
          <div className="onboarding-step">
            <h2>Create Your First Rule</h2>
            <div className="onboarding-icon">📋</div>
            <p>
              Rules connect triggers to actions. When a trigger fires, the associated
              actions are executed.
            </p>
            <div className="rule-flow">
              <div className="rule-part">
                <h4>Trigger</h4>
                <p>An event that starts the automation</p>
              </div>
              <div className="rule-arrow">→</div>
              <div className="rule-part">
                <h4>Actions</h4>
                <p>What happens when triggered</p>
              </div>
            </div>
            <button
              type="button"
              className={sampleRuleCreated ? "secondary-button success" : "secondary-button"}
              onClick={createSampleRule}
              disabled={sampleRuleCreated}
            >
              {sampleRuleCreated ? '✓ Sample Rule Created' : 'Create Sample Rule'}
            </button>
          </div>
        )

      case 'complete':
        return (
          <div className="onboarding-step">
            <h2>You're All Set!</h2>
            <div className="onboarding-icon">🎉</div>
            <p>
              You're ready to start automating with Aidle. Here are some things you can do next:
            </p>
            <ul className="next-steps">
              <li>Configure your plugins with API keys and settings</li>
              <li>Create automation rules for your workflow</li>
              <li>Set up variables to track data across rules</li>
              <li>Enable automatic backups in Settings</li>
            </ul>
            <button
              type="button"
              className="primary-button"
              onClick={handleComplete}
            >
              Go to Rules
            </button>
          </div>
        )
    }
  }

  const getStepNumber = () => {
    switch (currentStep) {
      case 'welcome': return 1
      case 'plugins': return 2
      case 'sample-rule': return 3
      case 'complete': return 4
    }
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-wizard">
        <div className="onboarding-progress">
          <div
            className="onboarding-progress-bar"
            style={{ width: `${(getStepNumber() / 4) * 100}%` }}
          />
        </div>

        {renderStepContent()}

        <div className="onboarding-footer">
          <button
            type="button"
            className="ghost-button"
            onClick={handleSkip}
          >
            Skip Tour
          </button>
          <div className="onboarding-navigation">
            {currentStep !== 'welcome' && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleBack}
              >
                Back
              </button>
            )}
            <button
              type="button"
              className="primary-button"
              onClick={handleNext}
            >
              {currentStep === 'complete' ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard