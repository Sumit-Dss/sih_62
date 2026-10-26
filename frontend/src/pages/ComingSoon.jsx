import { useNavigate } from 'react-router-dom'

export default function ComingSoon({ title = 'Module Coming Soon' }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-inner">
        <span className="material-symbols-outlined text-[32px]">construction</span>
      </div>
      <h2 className="text-2xl font-bold text-primary tracking-tight mb-2">{title}</h2>
      <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
        This module is scheduled for development in Stage 2 of the AICTE Sangam grievance monitoring rollout. Full integration and analytics will be available in future releases.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-sm font-medium transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  )
}
