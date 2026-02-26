import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

const t = {
  hu: {
    title: 'Kapcsolat',
    subtitle: 'Kérdése van? Vegye fel velünk a kapcsolatot!',
    emailLabel: 'E-mail',
    phoneLabel: 'Telefon',
    emailDesc: 'Írjon nekünk bármikor',
    phoneDesc: 'H-P: 9:00 – 17:00',
    formTitle: 'Üzenet küldése',
    nameLabel: 'Név',
    namePlaceholder: 'Példa János',
    emailInputLabel: 'E-mail cím',
    emailPlaceholder: 'pelda@email.hu',
    subjectLabel: 'Tárgy',
    subjectPlaceholder: 'Miben segíthetünk?',
    messageLabel: 'Üzenet',
    messagePlaceholder: 'Írja le kérdését vagy észrevételét...',
    sendButton: 'Üzenet küldése',
    sending: 'Küldés...',
    successTitle: 'Üzenet elküldve!',
    successDesc: 'Köszönjük megkeresését! 24 órán belül válaszolunk.',
    sendAnother: 'Új üzenet küldése',
    required: 'Kérjük, töltse ki a kötelező mezőket.',
    back: 'Vissza a főoldalra',
  },
  en: {
    title: 'Contact',
    subtitle: 'Have a question? Get in touch with us!',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    emailDesc: 'Write to us anytime',
    phoneDesc: 'Mon-Fri: 9:00 AM – 5:00 PM',
    formTitle: 'Send a Message',
    nameLabel: 'Name',
    namePlaceholder: 'John Doe',
    emailInputLabel: 'Email address',
    emailPlaceholder: 'john@example.com',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'How can we help?',
    messageLabel: 'Message',
    messagePlaceholder: 'Describe your question or feedback...',
    sendButton: 'Send Message',
    sending: 'Sending...',
    successTitle: 'Message sent!',
    successDesc: 'Thank you for reaching out! We will respond within 24 hours.',
    sendAnother: 'Send another message',
    required: 'Please fill in the required fields.',
    back: 'Back to home',
  },
}

export function ContactPage() {
  const [lang] = useState<'hu' | 'en'>(
    () => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )
  const s = t[lang]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(s.required)
      return
    }
    setLoading(true)
    // Mock — console.log + simulated delay
    console.log('Contact form submitted:', { name, email, subject, message })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
    setSuccess(true)
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setSuccess(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO title="Kapcsolat" description="Lépj kapcsolatba a Cégverzum csapatával." />
      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{s.title}</h1>
          <p className="mt-3 text-white/70 text-base">{s.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email card */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.emailLabel}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{s.emailDesc}</p>
              <a
                href="mailto:info@cegverzum.hu"
                className="text-sm font-medium text-teal hover:text-teal-light no-underline transition-colors"
              >
                info@cegverzum.hu
              </a>
            </div>

            {/* Phone card */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.phoneLabel}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{s.phoneDesc}</p>
              <a
                href="tel:+36705678948"
                className="text-sm font-medium text-gold hover:text-gold-light no-underline transition-colors"
              >
                +3670 5678948
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{s.formTitle}</h2>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{s.successTitle}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{s.successDesc}</p>
                  <button
                    onClick={resetForm}
                    className="text-sm text-teal hover:text-teal-light font-medium bg-transparent border-none cursor-pointer"
                  >
                    {s.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {s.nameLabel} *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white dark:bg-slate-700 dark:text-white"
                        placeholder={s.namePlaceholder}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {s.emailInputLabel} *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white dark:bg-slate-700 dark:text-white"
                        placeholder={s.emailPlaceholder}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {s.subjectLabel}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white dark:bg-slate-700 dark:text-white"
                      placeholder={s.subjectPlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {s.messageLabel} *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white dark:bg-slate-700 dark:text-white resize-vertical"
                      placeholder={s.messagePlaceholder}
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-teal hover:bg-teal-light disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg transition-colors border-none cursor-pointer text-base"
                  >
                    {loading ? s.sending : s.sendButton}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <Link
            to="/"
            className="text-sm text-teal hover:text-teal-light transition-colors no-underline"
          >
            &larr; {s.back}
          </Link>
        </div>
      </div>
    </div>
  )
}
