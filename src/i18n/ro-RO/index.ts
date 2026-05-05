export default {
  // App
  app: {
    name: 'CoLab Client',
    tagline: 'Portal Clienți',
    copyright: '© {year} CoLab. Toate drepturile rezervate.',
  },

  // Common
  common: {
    back: 'Înapoi',
    cancel: 'Anulează',
    save: 'Salvează',
    delete: 'Șterge',
    edit: 'Editează',
    close: 'Închide',
    loading: 'Se încarcă...',
    error: 'Eroare',
    success: 'Succes',
    viewDetails: 'Vezi Detalii',
    tryAgain: 'Încearcă din nou',
    selectEntity: 'Selectează Compania',
    loadMore: 'Încarcă Mai Multe',
    by: 'de',
  },

  // Navigation
  nav: {
    menu: 'Meniu',
    dashboard: 'Panou Principal',
    dashboardShort: 'Acasă',
    invoices: 'Facturi',
    invoicesShort: 'Facturi',
    meters: 'Contoare',
    metersShort: 'Contoare',
    subscriptions: 'Abonamente',
    subscriptionsShort: 'Contracte',
    profile: 'Profil',
    profileShort: 'Profil',
  },

  // Auth
  auth: {
    login: 'Autentificare',
    logout: 'Deconectare',
    logoutConfirm: 'Deconectare',
    logoutConfirmMessage: 'Ești sigur că vrei să te deconectezi?',
    identifier: 'Email sau Telefon',
    identifierHint: 'Introdu adresa de email sau numărul de telefon',
    password: 'Parolă',
    enterPassword: 'Introdu parola pentru a continua',
    forgotPassword: 'Ai uitat parola?',
    continue: 'Continuă',
    changeIdentifier: 'Schimbă',
    // OTP Login (Passwordless)
    otp: {
      enterIdentifier: 'Conectează-te la contul tău',
      identifierHint: 'Introdu emailul sau telefonul pentru a continua',
      chooseChannel: 'Verifică identitatea',
      channelHint: 'Alege cum vrei să primești codul de verificare',
      enterCode: 'Introdu codul de verificare',
      codeSentTo: 'Am trimis un cod la {destination}',
      verify: 'Verifică și Conectează-te',
      resend: 'Retrimite Codul',
      resendIn: 'Retrimite în {seconds}s',
      codeSent: 'Cod trimis cu succes',
      invalidCode: 'Cod invalid. Te rugăm să încerci din nou.',
      passwordNotSupported: 'Autentificarea cu parolă nu este disponibilă. Contactează suportul.',
      channel: {
        sms: 'Mesaj Text (SMS)',
        email: 'Email',
      },
    },
    resetPassword: {
      title: 'Resetează Parola',
      subtitle: 'Introdu noua ta parolă',
      newPassword: 'Parolă Nouă',
      confirmPassword: 'Confirmă Parola',
      passwordPlaceholder: 'Introdu parola nouă',
      confirmPlaceholder: 'Confirmă parola nouă',
      submit: 'Resetează Parola',
      success: 'Parola a fost resetată cu succes!',
      error: 'Nu s-a putut reseta parola. Te rugăm să încerci din nou.',
      passwordMismatch: 'Parolele nu coincid',
      invalidLink: 'Link invalid sau expirat',
      invalidLinkMessage: 'Link-ul de resetare a parolei este invalid sau a expirat. Te rugăm să soliciți unul nou.',
      requestNew: 'Solicită link nou',
      requirements: 'Parola trebuie să aibă cel puțin 8 caractere',
    },
    mfa: {
      title: 'Verificare',
      selectMethod: 'Selectează cum dorești să primești codul de verificare:',
      enterCode: 'Introdu codul de verificare',
      enterTotpCode: 'Introdu codul din aplicația de autentificare',
      codeSentTo: 'Cod trimis la {destination}',
      verify: 'Verifică',
      trustDevice: 'Ține minte acest dispozitiv 30 de zile',
      resendCode: 'Retrimite Codul',
      resendIn: 'Retrimite în {seconds}s',
      codeResent: 'Cod trimis cu succes',
      invalidCode: 'Cod invalid. Te rugăm să încerci din nou.',
      challengeError: 'Nu s-a putut trimite codul. Te rugăm să încerci din nou.',
      resendError: 'Nu s-a putut retrimite codul. Te rugăm să încerci din nou.',
    },
  },

  // Validation
  validation: {
    required: 'Acest câmp este obligatoriu',
    email: 'Introdu o adresă de email validă',
    phone: 'Introdu un număr de telefon valid',
  },

  // Dashboard
  dashboard: {
    supplier: 'Furnizorul Tău',
    unpaid: 'Neachitate',
    overdue: 'Restante',
    paid: 'Achitate',
    invoices: 'facturi',
    mySubscriptions: 'Abonamentele Mele',
    lastReading: 'Ultima citire',
    viewAllInvoices: 'Vezi Toate Facturile',
    noSubscriptions: 'Nu ai abonamente',
  },

  // Invoices
  invoices: {
    title: 'Facturi',
    invoice: 'Factură',
    all: 'Toate',
    pending: 'În așteptare',
    sent: 'Emise',
    overdue: 'Restante',
    partiallyPaid: 'Parțial Achitate',
    paid: 'Achitate',
    unpaid: 'Neachitate',
    utilityType: 'Tip Utilitate',
    issueDate: 'Data Emiterii',
    dueDate: 'Data Scadenței',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'TVA',
    discount: 'Reducere',
    grandTotal: 'Total General',
    subsidyDeduction: 'Deducere Subvenție',
    totalPayable: 'Total de Plată',
    balanceDue: 'Rest de Plată',
    consumptionPeriod: 'Perioada de Consum',
    details: 'Detalii',
    paymentHistory: 'Istoric Plăți',
    downloadPdf: 'Descarcă PDF',
    pay: 'Plătește',
    noInvoices: 'Nu ai facturi',
    noInvoicesHint: 'Facturile tale vor apărea aici',
    notFound: 'Factură negăsită',
    subsidyApplied: 'Subvenție Aplicată',
    subsidyDescription: 'Subvenția guvernamentală a fost aplicată pentru reducerea valorii facturii',
    subsidyAmount: 'Valoare Subvenție',
    subsidyType: 'Tip',
    calculationMode: 'Mod Calcul',
    percentage: 'Procentaj',
    unitRate: 'Tarif Unitar',
    description: 'Descriere',
    regulatoryReference: 'Referință Legală',
    // Penalty & overdue
    penaltyInvoice: 'Factură Penalizare',
    penaltyFor: 'Penalizare pentru Factura #{number}',
    penaltyDays: '{days} zile restanță',
    penaltyRate: 'Rată zilnică: {rate}%',
    penaltyBreakdown: 'Detalii Penalizare',
    penaltyPeriodFrom: 'De la',
    penaltyPeriodTo: 'Până la',
    penaltyPeriodDays: 'Zile',
    penaltyPeriodBalance: 'Sold',
    penaltyPeriodDaily: 'Sumă Zilnică',
    penaltyPeriodTotal: 'Total Perioadă',
    overdueWarning: 'Această factură este restantă',
    overdueBy: '{days} zile restanță',
    accruedPenalty: 'Penalizare acumulată',
    viewSourceInvoice: 'Vezi Factura Originală',
    type: {
      subscription: 'Abonament',
      'one-time': 'O singură dată',
      'late-payment-penalty': 'Penalizare Întârziere',
      'mandatory-inspection': 'Inspecție Obligatorie',
      regularization: 'Regularizare',
    },
    status: {
      draft: 'Ciornă',
      pending: 'În așteptare',
      validated: 'Validată',
      sent: 'Emisă',
      partially_paid: 'Parțial Achitată',
      paid: 'Achitată',
      overdue: 'Restantă',
      cancelled: 'Anulată',
      refunded: 'Rambursată',
      corrected: 'Corectată',
    },
  },

  // Subscriptions
  subscriptions: {
    title: 'Abonamente',
    contract: 'Contract',
    address: 'Adresă',
    startDate: 'Data Începerii',
    lastReading: 'Ultima citire',
    usage: 'Consum',
    usageHistory: 'Istoric Consum',
    meters: 'Contoare',
    noSubscriptions: 'Nu ai abonamente',
    notFound: 'Abonament negăsit',
    status: {
      active: 'Activ',
      inactive: 'Inactiv',
      suspended: 'Suspendat',
      cancelled: 'Anulat',
      pending: 'În așteptare',
    },
  },

  // Utilities (API uses 'natural-gas' as the key)
  utilities: {
    'electricity': 'Energie Electrică',
    'natural-gas': 'Gaz Natural',
    'water': 'Apă',
    'sewage': 'Canalizare',
  },

  // Usage
  usage: {
    consumptionChart: 'Istoric Consum',
    period: 'Perioadă',
    previousReading: 'Anterior',
    currentReading: 'Actual',
    consumption: 'Consum',
    unit: 'Unitate',
    readingType: 'Tip',
    noData: 'Nu există date de consum',
    type: {
      actual: 'Real',
      estimated: 'Estimat',
    },
  },

  // Meters
  meters: {
    title: 'Contoarele Mele de Gaz',
    details: 'Detalii Contor',
    total: 'Total',
    lastReading: 'Ultima Citire',
    noMeters: 'Nu există contoare',
    noMetersDescription: 'Contoarele tale de gaz vor apărea aici odată ce sunt înregistrate.',
    notFound: 'Contor negăsit',
    noReadings: 'Nu există citiri înregistrate',
    noActivities: 'Nu există activitate înregistrată',

    // Fields
    type: 'Tip',
    manufacturer: 'Producător',
    currentIndex: 'Index Curent',
    previousIndex: 'Index Anterior',
    installedDate: 'Data Instalării',
    verificationDate: 'Data Verificării',
    sealNumber: 'Număr Sigiliu',
    readingDate: 'Data Citirii',
    consumption: 'Consum',
    source: 'Sursă',
    readingHistory: 'Istoric Citiri',
    activities: 'Jurnal Activitate',

    // Submit Reading
    submitReading: 'Trimite Citire',
    enterReading: 'Introdu Citire Nouă',
    currentIndexHint: 'Introdu valoarea afișată pe contorul tău',
    notes: 'Note (opțional)',
    notesHint: 'Adaugă orice note suplimentare despre această citire',
    estimatedConsumption: 'Consum Estimat',
    readingSubmitted: 'Citire Trimisă!',
    readingSubmittedDescription: 'Citirea contorului a fost înregistrată cu succes.',
    backToMeter: 'Înapoi la Contor',
    submitError: 'Nu s-a putut trimite citirea',

    // Status
    status: {
      active: 'Activ',
      pending: 'În așteptare',
      detached: 'Detașat',
      replaced: 'Înlocuit',
      decommissioned: 'Dezafectat',
    },

    // Types
    types: {
      traditional: 'Tradițional',
      smart: 'Inteligent',
      volumetric: 'Volumetric',
      thermal: 'Termic',
    },

    // Reading Source
    readingSource: {
      customer: 'Autocitire',
      manual: 'Manual',
      automatic: 'Automat',
      estimated: 'Estimat',
    },

    // Validation
    validation: {
      indexMustBeHigher: 'Indexul trebuie să fie mai mare decât citirea anterioară',
      indexTooHigh: 'Indexul pare prea mare. Te rugăm să verifici.',
    },

    // Warnings
    warnings: {
      highConsumption: 'Consumul pare neobișnuit de mare. Te rugăm să verifici citirea.',
      zeroConsumption: 'Nu s-a detectat consum. Verifică dacă citirea este corectă.',
    },

    // Tips
    tips: {
      title: 'Sfaturi pentru Citire',
      tip1: 'Citește toate cifrele de pe afișajul contorului de la stânga la dreapta.',
      tip2: 'Ignoră cifrele roșii sau cifrele de după virgulă.',
      tip3: 'Fă o poză contorului pentru referință.',
    },
  },

  // Payment
  payment: {
    payInvoice: 'Plătește Factura',
    amount: 'Sumă de plată',
    cardDetails: 'Detalii Card',
    payNow: 'Plătește {amount}',
    securePayment: 'Plată securizată prin Stripe',
    success: 'Plată efectuată cu succes!',
    successTitle: 'Plată Finalizată',
    successMessage: 'Mulțumim pentru plată. Factura ta a fost achitată.',
    viewInvoices: 'Vezi Facturile',
    error: 'Eroare Plată',
    failed: 'Plata a eșuat. Te rugăm să încerci din nou.',
    initError: 'Nu s-a putut inițializa plata. Te rugăm să încerci din nou.',
    alreadyPaid: 'Această factură a fost deja achitată.',
    method: {
      card: 'Card',
      bank_transfer: 'Transfer Bancar',
      cash: 'Numerar',
      other: 'Altele',
    },
  },

  // Erori de acces (cheie din error.message_key de la server)
  tenancyError: {
    tenant_unknown: 'Nu am putut găsi contul tău. Verifică link-ul sau contactează suportul.',
    tenant_inactive: 'Contul tău este momentan inactiv. Contactează suportul pentru asistență.',
    tenant_archived: 'Acest cont a fost arhivat. Contactează suportul dacă ai nevoie de acces.',
    tenant_unavailable: 'Serviciul este temporar indisponibil. Te rugăm să încerci din nou.',
    tenant_required: 'Te rugăm să folosești link-ul personalizat pentru a accesa portalul.',
    tenant_required_for_route: 'Te rugăm să folosești link-ul personalizat pentru a accesa această pagină.',
    landlord_required: 'Această pagină nu este disponibilă prin portalul clienților.',
    broadcast_no_tenant: 'Actualizările în timp real sunt indisponibile. Reîncarcă pagina pentru datele recente.',
  },

  // Profile
  profile: {
    title: 'Profilul Meu',
    customer: 'Client',
    email: 'Email',
    phone: 'Telefon',
    changePassword: 'Schimbă Parola',
    changePasswordNotImplemented: 'Schimbarea parolei va fi disponibilă în curând',
    mySuppliers: 'Furnizorii Mei',
  },
};
