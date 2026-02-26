import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

const t = {
  hu: {
    title: 'Általános Szerződési Feltételek',
    lastUpdated: 'Utolsó frissítés: 2026. február 26.',
    sections: [
      {
        heading: '1. Szolgáltató adatai',
        content: `A Cégverzum szolgáltatás üzemeltetője:

**Cégverzum** (üzemeltető partner: T-Digital Solutions Kft.)
E-mail: info@cegverzum.hu
Telefon: +3670 5678948`,
      },
      {
        heading: '2. A szolgáltatás leírása',
        content: `A Cégverzum egy online céginformációs platform, amely a magyar cégek nyilvánosan elérhető adatait gyűjti össze, rendszerezi és teszi kereshetővé. A platform a NAV, a Cégbíróság és a KSH adatbázisaiból dolgozik, és pénzügyi elemzéseket, kockázati jelentéseket, marketing adatbázist, cégfigyelési szolgáltatást, valamint API hozzáférést biztosít.`,
      },
      {
        heading: '3. Regisztráció és felhasználói fiók',
        content: `A szolgáltatás igénybevételéhez regisztráció szükséges. A felhasználó köteles valós adatokat megadni a regisztráció során. A felhasználó felelős a fiókjához tartozó jelszó biztonságos kezeléséért. A Cégverzum fenntartja a jogot, hogy a valótlan adatokkal létrehozott fiókokat törölje.`,
      },
      {
        heading: '4. Előfizetési csomagok és fizetés',
        content: `A Cégverzum többféle előfizetési csomagot kínál (Free, Basic, Pro, Enterprise). Az egyes csomagok tartalmát és árait a Csomagok oldal tartalmazza. Az előfizetési díjak havi számlázásúak. A fizetés bankkártyával történik, biztonságos online fizetési rendszeren keresztül. Az árak az ÁFA-t tartalmazzák.`,
      },
      {
        heading: '5. Szellemi tulajdon',
        content: `A Cégverzum platform, annak forráskódja, designja, logója, szövegei és egyéb tartalmai szerzői jogi védelem alatt állnak. A felhasználó a szolgáltatást kizárólag saját üzleti céljaira használhatja. Tilos a tartalom másolása, terjesztése, újrapublikálása vagy értékesítése a Cégverzum előzetes írásbeli engedélye nélkül.`,
      },
      {
        heading: '6. Felelősségkorlátozás',
        content: `A Cégverzum törekszik az adatok pontosságára és naprakészségére, azonban nem vállal felelősséget az adatok teljességéért, pontosságáért vagy az adatokon alapuló üzleti döntésekért. A szolgáltatás „ahogy van" (as-is) alapon érhető el. A Cégverzum nem felel a szolgáltatás átmeneti elérhetetlenségéből, technikai hibákból vagy vis major eseményekből eredő károkért.`,
      },
      {
        heading: '7. Adatvédelem',
        content: `A felhasználók személyes adatainak kezelésére vonatkozó részletes tájékoztatást az Adatkezelési Tájékoztató tartalmazza, amely elérhető a /adatvedelem oldalon.`,
      },
      {
        heading: '8. Elállási jog',
        content: `A fogyasztónak minősülő felhasználó a 45/2014. (II. 26.) Korm. rendelet alapján a szerződés megkötésétől számított 14 napon belül indokolás nélkül elállhat a szerződéstől. Az elállási szándékot e-mailben (info@cegverzum.hu) kell jelezni. Az elállás esetén a Cégverzum a befizetett összeget 14 napon belül visszatéríti.`,
      },
      {
        heading: '9. Panaszkezelés',
        content: `Panaszát az alábbi elérhetőségeken jelezheti:

E-mail: info@cegverzum.hu
Telefon: +3670 5678948

A beérkezett panaszokat 30 napon belül megválaszoljuk. Amennyiben a panaszkezelés eredményével nem elégedett, a lakóhelye szerinti békéltető testülethez vagy bírósághoz fordulhat.`,
      },
      {
        heading: '10. Módosítás',
        content: `A Cégverzum fenntartja a jogot jelen ÁSZF módosítására. A módosításokról a felhasználókat e-mailben és/vagy a felületen keresztül értesítjük. A módosított ÁSZF a közzétételét követően lép hatályba.`,
      },
      {
        heading: '11. Alkalmazandó jog és jogviták',
        content: `Jelen ÁSZF-re a magyar jog az irányadó. A felek vitáikat elsősorban békés úton kísérlik meg rendezni. Ennek sikertelensége esetén a magyar bíróságok illetékesek.`,
      },
      {
        heading: '12. Hatálybalépés',
        content: `Jelen Általános Szerződési Feltételek 2026. február 26. napjától hatályosak.`,
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: February 26, 2026',
    sections: [
      {
        heading: '1. Service Provider',
        content: `The Cégverzum service is operated by:

**Cégverzum** (operating partner: T-Digital Solutions Kft.)
Email: info@cegverzum.hu
Phone: +3670 5678948`,
      },
      {
        heading: '2. Description of Service',
        content: `Cégverzum is an online company information platform that collects, organizes, and makes searchable publicly available data on Hungarian companies. The platform works with data from NAV (Tax Authority), the Court of Registration, and KSH (Statistics Office), providing financial analysis, risk reports, marketing database, company monitoring, and API access.`,
      },
      {
        heading: '3. Registration and User Account',
        content: `Registration is required to use the service. Users must provide accurate information during registration. Users are responsible for the secure management of their account passwords. Cégverzum reserves the right to delete accounts created with false information.`,
      },
      {
        heading: '4. Subscription Plans and Payment',
        content: `Cégverzum offers several subscription plans (Free, Basic, Pro, Enterprise). The content and pricing of each plan can be found on the Packages page. Subscription fees are billed monthly. Payment is made by credit card through a secure online payment system. Prices include VAT.`,
      },
      {
        heading: '5. Intellectual Property',
        content: `The Cégverzum platform, its source code, design, logo, texts, and other content are protected by copyright. Users may only use the service for their own business purposes. Copying, distributing, republishing, or selling content without prior written consent from Cégverzum is prohibited.`,
      },
      {
        heading: '6. Limitation of Liability',
        content: `Cégverzum strives for data accuracy and currency but does not guarantee the completeness, accuracy of data, or business decisions based on the data. The service is provided on an "as-is" basis. Cégverzum is not liable for damages arising from temporary unavailability of the service, technical errors, or force majeure events.`,
      },
      {
        heading: '7. Data Protection',
        content: `Detailed information on the processing of users' personal data can be found in the Privacy Policy, available at /adatvedelem.`,
      },
      {
        heading: '8. Right of Withdrawal',
        content: `Users qualifying as consumers may withdraw from the contract within 14 days of concluding the contract without giving reasons, in accordance with Government Decree 45/2014 (II. 26.). The intention to withdraw must be communicated via email (info@cegverzum.hu). In case of withdrawal, Cégverzum will refund the amount paid within 14 days.`,
      },
      {
        heading: '9. Complaint Handling',
        content: `You can report complaints at the following contact details:

Email: info@cegverzum.hu
Phone: +3670 5678948

We respond to received complaints within 30 days. If you are not satisfied with the result of complaint handling, you may turn to the conciliation body or court of your place of residence.`,
      },
      {
        heading: '10. Amendments',
        content: `Cégverzum reserves the right to amend these Terms of Service. Users will be notified of amendments via email and/or through the platform. Amended terms become effective upon publication.`,
      },
      {
        heading: '11. Governing Law and Disputes',
        content: `These Terms of Service are governed by Hungarian law. The parties shall primarily attempt to resolve disputes amicably. In case of failure, Hungarian courts shall have jurisdiction.`,
      },
      {
        heading: '12. Effective Date',
        content: `These Terms of Service are effective from February 26, 2026.`,
      },
    ],
  },
}

export function TermsPage() {
  const [lang] = useState<'hu' | 'en'>(
    () => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )
  const s = t[lang]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO title="Általános Szerződési Feltételek" description="A Cégverzum ÁSZF és felhasználási feltételek." />
      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-teal-dark py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{s.title}</h1>
          <p className="mt-3 text-white/60 text-sm">{s.lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {s.sections.map((sec) => (
            <div key={sec.heading} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {sec.heading}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line text-sm">
                {sec.content.split('**').map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="text-gray-900 dark:text-white">{part}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <Link
            to="/"
            className="text-sm text-teal hover:text-teal-light transition-colors no-underline"
          >
            &larr; {lang === 'hu' ? 'Vissza a főoldalra' : 'Back to home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
