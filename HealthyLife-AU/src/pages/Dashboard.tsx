import React, { useMemo, useState } from 'react'

const Dashboard: React.FC = () => {
  // --- Modal & form state ---
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [age, setAge] = useState(23)
  const [gender, setGender] = useState('Male')
  const [activity, setActivity] = useState('3-5 days per Week')
  const [lifestyle, setLifestyle] = useState('Non-smoking')

  const canNext = useMemo(() => {
    if (step === 0) return age > 0 && age < 120
    if (step === 1) return Boolean(gender)
    if (step === 2) return Boolean(activity)
    if (step === 3) return Boolean(lifestyle)
    return true
  }, [step, age, gender, activity, lifestyle])

  const reset = () => {
    setStep(0)
    setAge(23)
    setGender('Male')
    setActivity('3-5 days per Week')
    setLifestyle('Non-smoking')
  }

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted at step:', step)

    // Only submit if we're on the last step
    if (step === 3) {
      console.log({ age, gender, activity, lifestyle })
      setOpen(false)
      setTimeout(() => reset(), 150)
    } else {
      // If not on last step, go to next step
      handleNext()
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* HERO (keeps only one global header from your app; no extra local navbar here) */}
      <section className="relative isolate overflow-hidden">
        {/* Decorative green blob on top-right */}
        <div className="pointer-events-none absolute -z-10 right-0 top-0 h-[520px] w-[520px] rounded-bl-[220px] bg-green-100" style={{ clipPath: 'ellipse(70% 60% at 80% 0%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid lg:grid-cols-3 gap-10 items-center">
          {/* Left: headline */}
          <div className="lg:col-span-1">
            <h1 className="text-[42px] sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-black">
              A <span className="text-green-600">Healthy</span> Mind
              <br /> is an Asset
            </h1>
            <p className="mt-5 max-w-xl text-gray-600">Take control of your health journey with personalized insights.</p>

            <div className="mt-10">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-green-700 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              >
                Start Health Assessment
              </button>
            </div>
          </div>

          {/* Right: placeholder illustration (replace with your image if needed) */}
          <div className="relative lg:col-span-2">
            <div className="aspect-[4/3] w-full rounded-[24px] bg-green-50 border border-green-100 shadow-xl">
              <img src="/background.gif" alt="People running illustration" className="w-full h-full object-cover rounded-[24px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Health Assessment (Figure-1 style) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md">
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Health Assessment</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
                  aria-label="Close modal"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Icon */}
              <div className="mx-auto mb-6 grid h-10 w-10 place-items-center rounded-full bg-green-50 text-green-600">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {step === 0 && (
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700">Age</span>
                    <input
                      type="number"
                      min={1}
                      max={119}
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value || '0', 10))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (canNext) handleNext()
                        }
                      }}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g. 23"
                      required
                    />
                  </label>
                )}

                {step === 1 && (
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700">Gender</span>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </label>
                )}

                {step === 2 && (
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700">Physical activity</span>
                    <select
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option>0–1 day per Week</option>
                      <option>2–3 days per Week</option>
                      <option>3-5 days per Week</option>
                      <option>6–7 days per Week</option>
                    </select>
                  </label>
                )}

                {step === 3 && (
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700">Lifestyle</span>
                    <select
                      value={lifestyle}
                      onChange={(e) => setLifestyle(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option>Non-smoking</option>
                      <option>Smoking</option>
                      <option>Occasional drinking</option>
                      <option>Vegan</option>
                      <option>Vegetarian</option>
                    </select>
                  </label>
                )}
              </div>

              {/* Stepper dots */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-2 w-2 rounded-full ${i === step ? 'bg-green-600' : 'bg-gray-300'}`} />
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => (step === 0 ? handleClose() : setStep((s) => Math.max(0, s - 1)))}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {step === 0 ? 'Cancel' : '< Back'}
                </button>

                <button
                  type="submit"
                  disabled={!canNext}
                  className="inline-flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step === 3 ? 'Submit' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
