import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

const t = {
  hu: {
    title: 'Adatkezelési Tájékoztató',
    lastUpdated: 'Utolsó frissítés: 2026. február 26.',
    sections: [
      {
        heading: '1. Az adatkezelő adatai',
        content: `**Cégverzum** (üzemeltető partner: T-Digital Solutions Kft.)
E-mail: info@cegverzum.hu
Telefon: +3670 5678948

Az adatkezelő elkötelezett a felhasználók személyes adatainak védelme iránt, és jelen tájékoztató célja, hogy a felhasználókat tájékoztassa az adatkezelési gyakorlatáról.`,
      },
      {
        heading: '2. Jogszabályi háttér',
        content: `Az adatkezelés az alábbi jogszabályok alapján történik:

• Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR)
• 2011. évi CXII. törvény az információs önrendelkezési jogról és az információszabadságról (Infotv.)
• 2001. évi CVIII. törvény az elektronikus kereskedelmi szolgáltatások egyes kérdéseiről`,
      },
      {
        heading: '3. Kezelt adatok köre',
        content: `A szolgáltatás igénybevétele során az alábbi személyes adatokat kezeljük:

• **Regisztrációs adatok:** név, e-mail cím, jelszó (titkosítva)
• **Számlázási adatok:** cégnév, cím, adószám (előfizetős csomagok esetén)
• **Használati adatok:** bejelentkezési időpontok, keresési előzmények, használt funkciók
• **Technikai adatok:** IP-cím, böngésző típusa, operációs rendszer, cookie-k
• **Kapcsolatfelvételi adatok:** a felhasználó által megadott név, e-mail, üzenet szövege`,
      },
      {
        heading: '4. Az adatkezelés célja és jogalapja',
        content: `Az adatkezelés céljai és jogalapjai:

• **Szolgáltatás nyújtása** — jogalap: szerződés teljesítése (GDPR 6. cikk (1) b)
• **Számlázás** — jogalap: jogi kötelezettség teljesítése (GDPR 6. cikk (1) c)
• **Ügyfélszolgálat, panaszkezelés** — jogalap: jogos érdek (GDPR 6. cikk (1) f)
• **Szolgáltatás fejlesztése, statisztika** — jogalap: jogos érdek (GDPR 6. cikk (1) f)
• **Marketing célú megkeresés** — jogalap: hozzájárulás (GDPR 6. cikk (1) a)`,
      },
      {
        heading: '5. Adatok megőrzési ideje',
        content: `• **Regisztrációs adatok:** a fiók törléséig, vagy a fiók törlésétől számított 30 napig
• **Számlázási adatok:** a számviteli jogszabályok által előírt 8 évig
• **Használati adatok:** 2 évig
• **Cookie-k:** a cookie tájékoztatóban meghatározott ideig
• **Kapcsolatfelvételi adatok:** az ügy lezárásától számított 1 évig`,
      },
      {
        heading: '6. Adattovábbítás',
        content: `A személyes adatokat az alábbi címzetteknek továbbíthatjuk:

• **T-Digital Solutions Kft.** — mint üzemeltető partner, az üzemeltetési és technikai feladatok ellátása érdekében
• **Fizetési szolgáltató** — a bankkártyás fizetés feldolgozása érdekében (a kártyaadatokat nem tároljuk)
• **Tárhelyszolgáltató** — a szerverek üzemeltetése érdekében

Harmadik országba (EGT-n kívülre) személyes adatot nem továbbítunk. Személyes adatokat hatósági megkeresés esetén, jogszabályi kötelezettség alapján továbbíthatunk.`,
      },
      {
        heading: '7. Cookie-k (sütik)',
        content: `A weboldal az alábbi cookie-kat használja:

• **Szükséges cookie-k:** munkamenet-azonosító, bejelentkezési állapot — a szolgáltatás működéséhez szükségesek
• **Analitikai cookie-k:** anonim látogatottság-mérés — kizárólag a felhasználó hozzájárulásával
• **Funkcionális cookie-k:** nyelvi beállítás, sötét mód preferencia

A cookie-k kezeléséről a Cookie-sáv tájékoztat, ahol a felhasználó beállíthatja preferenciáit.`,
      },
      {
        heading: '8. Az érintett jogai',
        content: `A GDPR alapján az alábbi jogok illetik meg:

• **Hozzáférés joga:** tájékoztatást kérhet arról, hogy milyen adatait kezeljük
• **Helyesbítés joga:** kérheti pontatlan adatai kijavítását
• **Törlés joga („elfeledtetés"):** kérheti személyes adatai törlését
• **Adathordozhatóság joga:** kérheti adatai géppel olvasható formátumban történő kiadását
• **Tiltakozás joga:** tiltakozhat a jogos érdeken alapuló adatkezelés ellen
• **Hozzájárulás visszavonása:** a hozzájáruláson alapuló adatkezelés esetén bármikor visszavonhatja hozzájárulását

Jogai gyakorlásához írjon az info@cegverzum.hu e-mail címre. Kérését 30 napon belül teljesítjük.`,
      },
      {
        heading: '9. Jogorvoslat',
        content: `Amennyiben úgy érzi, hogy személyes adatainak kezelése sérti a jogszabályokat, az alábbi jogorvoslati lehetőségek állnak rendelkezésére:

• **Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)**
  Cím: 1055 Budapest, Falk Miksa utca 9-11.
  Telefon: +36 1 391 1400
  E-mail: ugyfelszolgalat@naih.hu
  Honlap: www.naih.hu

• **Bírósági jogérvényesítés:** a lakóhelye szerinti törvényszékhez fordulhat.`,
      },
      {
        heading: '10. Kapcsolat',
        content: `Adatvédelmi kérdéseivel forduljon hozzánk:

E-mail: info@cegverzum.hu
Telefon: +3670 5678948`,
      },
      {
        heading: '11. Hatálybalépés',
        content: `Jelen Adatkezelési Tájékoztató 2026. február 26. napjától hatályos.`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: February 26, 2026',
    sections: [
      {
        heading: '1. Data Controller',
        content: `**Cégverzum** (operating partner: T-Digital Solutions Kft.)
Email: info@cegverzum.hu
Phone: +3670 5678948

The data controller is committed to protecting users' personal data, and this policy aims to inform users about its data processing practices.`,
      },
      {
        heading: '2. Legal Background',
        content: `Data processing is carried out in accordance with the following legislation:

• Regulation (EU) 2016/679 of the European Parliament and of the Council (GDPR)
• Act CXII of 2011 on the Right of Informational Self-Determination and Freedom of Information (Info Act)
• Act CVIII of 2001 on Certain Issues of Electronic Commerce Services`,
      },
      {
        heading: '3. Scope of Processed Data',
        content: `We process the following personal data during the use of our service:

• **Registration data:** name, email address, password (encrypted)
• **Billing data:** company name, address, tax number (for subscription plans)
• **Usage data:** login times, search history, features used
• **Technical data:** IP address, browser type, operating system, cookies
• **Contact data:** name, email, and message text provided by the user`,
      },
      {
        heading: '4. Purpose and Legal Basis of Data Processing',
        content: `Purposes and legal bases of data processing:

• **Service provision** — legal basis: performance of contract (GDPR Art. 6(1)(b))
• **Billing** — legal basis: legal obligation (GDPR Art. 6(1)(c))
• **Customer support, complaint handling** — legal basis: legitimate interest (GDPR Art. 6(1)(f))
• **Service improvement, statistics** — legal basis: legitimate interest (GDPR Art. 6(1)(f))
• **Marketing communications** — legal basis: consent (GDPR Art. 6(1)(a))`,
      },
      {
        heading: '5. Data Retention Period',
        content: `• **Registration data:** until account deletion, or 30 days after account deletion
• **Billing data:** 8 years as required by accounting regulations
• **Usage data:** 2 years
• **Cookies:** as specified in the cookie notice
• **Contact data:** 1 year after case closure`,
      },
      {
        heading: '6. Data Transfers',
        content: `We may transfer personal data to the following recipients:

• **T-Digital Solutions Kft.** — as operating partner, for operational and technical purposes
• **Payment processor** — for credit card payment processing (we do not store card data)
• **Hosting provider** — for server operation

We do not transfer personal data to third countries (outside the EEA). We may transfer personal data to authorities upon request, based on legal obligations.`,
      },
      {
        heading: '7. Cookies',
        content: `The website uses the following cookies:

• **Necessary cookies:** session ID, login status — required for service operation
• **Analytics cookies:** anonymous visitor statistics — only with user consent
• **Functional cookies:** language setting, dark mode preference

The Cookie Banner provides information about cookie management, where users can set their preferences.`,
      },
      {
        heading: '8. Rights of Data Subjects',
        content: `Under the GDPR, you have the following rights:

• **Right of access:** you may request information about what data we process
• **Right to rectification:** you may request correction of inaccurate data
• **Right to erasure ("right to be forgotten"):** you may request deletion of your personal data
• **Right to data portability:** you may request your data in a machine-readable format
• **Right to object:** you may object to data processing based on legitimate interest
• **Withdrawal of consent:** you may withdraw your consent at any time for consent-based processing

To exercise your rights, write to info@cegverzum.hu. We will fulfill your request within 30 days.`,
      },
      {
        heading: '9. Legal Remedies',
        content: `If you believe that the processing of your personal data violates the law, the following remedies are available:

• **National Authority for Data Protection and Freedom of Information (NAIH)**
  Address: 1055 Budapest, Falk Miksa utca 9-11.
  Phone: +36 1 391 1400
  Email: ugyfelszolgalat@naih.hu
  Website: www.naih.hu

• **Court proceedings:** you may turn to the court of your place of residence.`,
      },
      {
        heading: '10. Contact',
        content: `For data protection inquiries, please contact us:

Email: info@cegverzum.hu
Phone: +3670 5678948`,
      },
      {
        heading: '11. Effective Date',
        content: `This Privacy Policy is effective from February 26, 2026.`,
      },
    ],
  },
}

export function PrivacyPage() {
  const [lang] = useState<'hu' | 'en'>(
    () => (localStorage.getItem('cegverzum_lang') as 'hu' | 'en') || 'hu'
  )
  const s = t[lang]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO title="Adatkezelési Tájékoztató" description="A Cégverzum adatkezelési és adatvédelmi tájékoztatója." />
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
