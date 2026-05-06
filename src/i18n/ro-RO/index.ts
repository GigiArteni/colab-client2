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
    skipToContent: 'Sari la conținutul principal',
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
    mainNavLabel: 'Navigare principală',
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
    stepOf: 'Pasul {current} din {total}',
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
    filterByStatus: 'Filtrează după stare',
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
    tab: {
      detail: 'Detalii',
      history: 'Istoric',
    },
    history: {
      tab: 'Istoric',
      statusTimeline: 'Cronologie Stări',
      corrections: 'Corecții Asociate',
      activities: 'Flux Activitate',
      from: 'din',
      noStatusLogs: 'Nu există schimbări de stare înregistrate',
      noCorrections: 'Nu există corecții asociate acestei facturi',
      noActivities: 'Nu există activitate înregistrată',
    },
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
    customer: 'Date Client',
    customerName: 'Nume',
    customerEmail: 'Email',
    customerPhone: 'Telefon',
    customerTaxId: 'CUI / CNP',
    customerAddress: 'Adresă Facturare',
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
    unknown_workspace_page: {
      title: 'Workspace indisponibil',
      description: 'Nu am putut deschide acest workspace. Verifică adresa sau contactează furnizorul tău — accesul poate fi suspendat.',
      cta: 'Înapoi la site-ul principal',
    },
    no_workspace_landing: {
      title: 'Te afli pe site-ul principal',
      description: 'Acest portal se accesează prin link-ul personalizat al furnizorului tău. Folosește link-ul primit de la furnizor.',
      example: 'Exemplu: furnizorultau.colab-client.app',
      cta: 'Vizitează site-ul nostru',
    },
  },

  // UI Primitives
  ui: {
    emptyState: {
      defaultTitle: 'Nimic aici încă',
      defaultSubtitle: 'Datele vor apărea aici odată ce sunt disponibile.',
    },
    confirmDialog: {
      defaultTitle: 'Ești sigur?',
      defaultOk: 'Confirmă',
      defaultCancel: 'Anulează',
    },
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
    tabs: {
      settings: 'Setări',
      contact: 'Preferințe Contact',
      devices: 'Dispozitive',
    },
  },

  // Profile Settings tab
  profileSettings: {
    saving: 'Se salvează...',
    saved: 'Salvat',
    loadError: 'Nu s-au putut încărca setările',
    saveError: 'Nu s-au putut salva setările',
    notifications: {
      title: 'Preferințe Notificări',
      hint: 'Alege cum dorești să primești notificări pentru fiecare categorie',
      category: 'Categorie',
      email: 'Email',
      sms: 'SMS',
      push: 'Push',
      categories: {
        invoice: 'Facturi',
        payment: 'Plăți',
        reading: 'Citiri Contor',
        subscription: 'Abonamente',
        maintenance: 'Mentenanță',
        alert: 'Alerte',
        general: 'General',
      },
    },
    localization: {
      title: 'Limbă și Fus Orar',
      language: 'Limbă',
      timezone: 'Fus Orar',
    },
    channels: {
      title: 'Canale de Comunicare',
      preferredChannel: 'Canal Preferat',
      emailOverride: 'Email Alternativ',
      emailOverrideHint: 'Lasă gol pentru a folosi emailul contului tău',
      phoneOverride: 'Telefon Alternativ',
      phoneOverrideHint: 'Lasă gol pentru a folosi telefonul contului tău',
      options: {
        email: 'Email',
        sms: 'SMS',
        any: 'Oricare',
      },
    },
  },

  // Contact Settings section
  contactSettings: {
    title: 'Preferințe Contact',
    hint: 'Personalizează cum primești comunicările ca și contact',
    billingEmail: 'Email Alternativ pentru Facturare',
    billingEmailHint: 'Facturile vor fi trimise la acest email în loc de emailul contului tău',
    preferredChannel: 'Canal Preferat de Notificare',
    receiveLabel: 'Primește notificări pentru:',
    receiveInvoices: 'Facturi',
    receiveAlerts: 'Alerte',
    receiveReadings: 'Remindere Citiri',
    loadError: 'Nu s-au putut încărca preferințele de contact',
    saveError: 'Nu s-au putut salva preferințele de contact',
  },

  // Registered Devices section
  registeredDevices: {
    title: 'Dispozitive Înregistrate',
    hint: 'Dispozitive înregistrate pentru notificări push',
    noDevices: 'Niciun dispozitiv înregistrat',
    platform: 'Platformă',
    lastUsed: 'Ultima utilizare',
    registered: 'Înregistrat',
    loadError: 'Nu s-au putut încărca dispozitivele',
    revokeTitle: 'Revocă Dispozitivul',
    revokeMessage: 'Elimini notificările push pentru "{name}"? Te poți re-înregistra la următoarea autentificare.',
    revokeConfirm: 'Revocă',
  },

  // Errors / not found
  errors: {
    notFound: 'Ups. Nimic aici...',
    goHome: 'Acasă',
  },

  // Forgot password (page-level strings)
  forgotPassword: {
    hint: 'Introdu adresa de email și îți vom trimite un link pentru resetarea parolei.',
    emailLabel: 'Email',
    checkEmail: 'Verifică-ți email-ul pentru instrucțiuni de resetare a parolei.',
    submit: 'Trimite Link',
    backToLogin: 'Înapoi la autentificare',
    emailRequired: 'Introdu adresa de email',
    genericError: 'A apărut o eroare',
  },

  // Notifications / alert center
  notifications: {
    loadMore: 'Încarcă mai multe',
    markAllRead: 'Marchează tot ca citit',
    close: 'Închide',
    markRead: 'Marchează ca citită',
    bellLabel: 'Notificări ({count} necitite)',
    preferences: 'Preferințe notificări',
  },

  // Alert preferences page
  alertPreferences: {
    title: 'Preferințe Notificări',
    browserSection: 'Notificări Browser',
    browserHint: 'Primește notificări pe desktop chiar dacă aplicația nu este deschisă',
    enableBrowser: 'Activează Notificările',
    browserBlocked: 'Notificările au fost blocate. Activează-le din setările browser-ului.',
    enableAll: 'Activează Tot',
    disableAll: 'Dezactivează Tot',
    save: 'Salvează Preferințele',
    viewDetails: 'Vezi detalii',
    addTitle: 'Adaugă Preferință Notificare',
    alertType: 'Tip Alertă',
    channels: 'Canale de Notificare',
    channelEmail: 'Email',
    channelSms: 'SMS',
    channelInApp: 'În Aplicație',
    quietHoursStart: 'Silențios de la',
    quietHoursEnd: 'Silențios până la',
    deleteConfirmTitle: 'Elimină Preferință',
    deleteConfirmMessage: 'Elimini această preferință de notificare?',
    dismiss: 'Închide',
  },

  // Payments (cancel/success redirect pages)
  payments: {
    redirecting: 'Redirecționare spre plată...',
    error: 'Eroare la plată',
    errorMessage: 'A apărut o eroare la procesarea plății. Te rugăm să încerci din nou.',

    success: {
      title: 'Plată efectuată cu succes!',
      message: 'Plata ta a fost procesată cu succes.',
      verifying: 'Se verifică statusul plății...',
      viewInvoice: 'Vezi factura',
      backToInvoices: 'Înapoi la facturi',
    },

    cancel: {
      title: 'Plată anulată',
      message: 'Plata a fost anulată. Poți încerca din nou oricând.',
      tryAgain: 'Încearcă din nou',
      backToInvoices: 'Înapoi la facturi',
    },

    receipt: {
      number: 'Număr chitanță',
      amount: 'Sumă plătită',
      status: 'Status',
    },

    status: {
      pending: 'În așteptare',
      completed: 'Finalizată',
      failed: 'Eșuată',
    },
  },

  // OTP Login (passwordless flow — OtpLoginPage)
  otp: {
    identifier: 'Email sau Telefon',
    identifierHint: 'Introdu adresa de email sau numărul de telefon',
    titleIdentifier: 'Autentifică-te fără parolă',
    subtitleIdentifier: 'Introdu email-ul sau telefonul pentru a primi un cod unic',
    titleVerify: 'Introdu codul',
    subtitleVerify: 'Introdu codul unic primit',
    sentTo: 'Cod trimis la',
    verify: 'Verifică și Autentifică-te',
    resend: 'Retrimite Codul',
    codeSent: 'Cod trimis cu succes',
    invalidCode: 'Cod invalid. Te rugăm să încerci din nou.',
    errorSendingCode: 'Trimiterea codului a eșuat. Te rugăm să încerci din nou.',
    usePassword: 'Autentifică-te cu parolă',
    accountNumber: 'Număr cont',
    loginSuccess: 'Autentificare reușită',
  },
};
