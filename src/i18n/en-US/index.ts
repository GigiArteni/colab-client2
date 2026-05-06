export default {
  // App
  app: {
    name: 'CoLab Customer',
    tagline: 'Customer Portal',
    copyright: '© {year} CoLab. All rights reserved.',
  },

  // Common
  common: {
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    viewDetails: 'View Details',
    tryAgain: 'Try Again',
    selectEntity: 'Select Company',
    loadMore: 'Load More',
    by: 'by',
    skipToContent: 'Skip to main content',
  },

  // Navigation
  nav: {
    menu: 'Menu',
    dashboard: 'Dashboard',
    dashboardShort: 'Home',
    invoices: 'Invoices',
    invoicesShort: 'Invoices',
    meters: 'Meters',
    metersShort: 'Meters',
    subscriptions: 'Subscriptions',
    subscriptionsShort: 'Contracts',
    profile: 'Profile',
    profileShort: 'Profile',
    mainNavLabel: 'Main navigation',
  },

  // Auth
  auth: {
    login: 'Login',
    logout: 'Logout',
    logoutConfirm: 'Logout',
    logoutConfirmMessage: 'Are you sure you want to logout?',
    identifier: 'Email or Phone',
    identifierHint: 'Enter your email address or phone number',
    password: 'Password',
    enterPassword: 'Enter your password to continue',
    forgotPassword: 'Forgot password?',
    continue: 'Continue',
    changeIdentifier: 'Change',
    resetPassword: {
      title: 'Reset Password',
      subtitle: 'Enter your new password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      passwordPlaceholder: 'Enter new password',
      confirmPlaceholder: 'Confirm new password',
      submit: 'Reset Password',
      success: 'Password reset successfully!',
      error: 'Failed to reset password. Please try again.',
      passwordMismatch: 'Passwords do not match',
      invalidLink: 'Invalid or Expired Link',
      invalidLinkMessage: 'The password reset link is invalid or has expired. Please request a new one.',
      requestNew: 'Request New Link',
      requirements: 'Password must be at least 8 characters',
    },
    mfa: {
      title: 'Verification',
      selectMethod: 'Select how you want to receive your verification code:',
      enterCode: 'Enter the verification code',
      enterTotpCode: 'Enter the code from your authenticator app',
      codeSentTo: 'Code sent to {destination}',
      verify: 'Verify',
      trustDevice: 'Trust this device for 30 days',
      resendCode: 'Resend Code',
      resendIn: 'Resend in {seconds}s',
      codeResent: 'Code sent successfully',
      invalidCode: 'Invalid code. Please try again.',
      challengeError: 'Failed to send code. Please try again.',
      resendError: 'Failed to resend code. Please try again.',
    },
    stepOf: 'Step {current} of {total}',
    otp: {
      enterIdentifier: 'Sign in to your account',
      identifierHint: 'Enter your email or phone number to continue',
      chooseChannel: 'Verify your identity',
      channelHint: 'Choose how you want to receive the verification code',
      enterCode: 'Enter verification code',
      codeSentTo: 'We sent a code to {destination}',
      verify: 'Verify & Sign In',
      resend: 'Resend Code',
      resendIn: 'Resend in {seconds}s',
      codeSent: 'Code sent successfully',
      invalidCode: 'Invalid code. Please try again.',
      passwordNotSupported: 'Password login is not available. Please contact support.',
      channel: {
        sms: 'Text Message (SMS)',
        email: 'Email',
      },
    },
  },

  // Validation
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
  },

  // Dashboard
  dashboard: {
    supplier: 'Your Supplier',
    unpaid: 'Unpaid',
    overdue: 'Overdue',
    paid: 'Paid',
    invoices: 'invoices',
    mySubscriptions: 'My Subscriptions',
    lastReading: 'Last reading',
    viewAllInvoices: 'View All Invoices',
    noSubscriptions: 'No subscriptions found',
  },

  // Invoices
  invoices: {
    title: 'Invoices',
    invoice: 'Invoice',
    all: 'All',
    pending: 'Pending',
    sent: 'Sent',
    overdue: 'Overdue',
    partiallyPaid: 'Partially Paid',
    paid: 'Paid',
    unpaid: 'Unpaid',
    utilityType: 'Utility Type',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    grandTotal: 'Grand Total',
    subsidyDeduction: 'Subsidy Deduction',
    totalPayable: 'Total Payable',
    balanceDue: 'Balance Due',
    consumptionPeriod: 'Consumption Period',
    details: 'Details',
    paymentHistory: 'Payment History',
    downloadPdf: 'Download PDF',
    pay: 'Pay',
    filterByStatus: 'Filter by status',
    noInvoices: 'No invoices found',
    noInvoicesHint: 'Your invoices will appear here',
    notFound: 'Invoice not found',
    subsidyApplied: 'Subsidy Applied',
    subsidyDescription: 'Government subsidy has been applied to reduce your invoice amount',
    subsidyAmount: 'Subsidy Amount',
    subsidyType: 'Type',
    calculationMode: 'Calculation Mode',
    percentage: 'Percentage',
    unitRate: 'Unit Rate',
    description: 'Description',
    regulatoryReference: 'Regulatory Reference',
    // Penalty & overdue
    penaltyInvoice: 'Penalty Invoice',
    penaltyFor: 'Penalty for Invoice #{number}',
    penaltyDays: '{days} days overdue',
    penaltyRate: 'Daily rate: {rate}%',
    penaltyBreakdown: 'Penalty Breakdown',
    penaltyPeriodFrom: 'From',
    penaltyPeriodTo: 'To',
    penaltyPeriodDays: 'Days',
    penaltyPeriodBalance: 'Balance',
    penaltyPeriodDaily: 'Daily Amount',
    penaltyPeriodTotal: 'Period Total',
    overdueWarning: 'This invoice is overdue',
    overdueBy: '{days} days overdue',
    accruedPenalty: 'Accrued penalty',
    viewSourceInvoice: 'View Original Invoice',
    tab: {
      detail: 'Details',
      history: 'History',
    },
    history: {
      tab: 'History',
      statusTimeline: 'Status Timeline',
      corrections: 'Linked Corrections',
      activities: 'Activity Feed',
      from: 'from',
      noStatusLogs: 'No status changes recorded',
      noCorrections: 'No corrections linked to this invoice',
      noActivities: 'No activity recorded',
    },
    type: {
      subscription: 'Subscription',
      'one-time': 'One-time',
      'late-payment-penalty': 'Late Payment Penalty',
      'mandatory-inspection': 'Mandatory Inspection',
      regularization: 'Regularization',
    },
    status: {
      draft: 'Draft',
      pending: 'Pending',
      validated: 'Validated',
      sent: 'Sent',
      partially_paid: 'Partially Paid',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      corrected: 'Corrected',
    },
  },

  // Subscriptions
  subscriptions: {
    title: 'Subscriptions',
    contract: 'Contract',
    address: 'Address',
    startDate: 'Start Date',
    lastReading: 'Last reading',
    usage: 'Usage',
    usageHistory: 'Usage History',
    meters: 'Meters',
    noSubscriptions: 'No subscriptions found',
    notFound: 'Subscription not found',
    customer: 'Customer Info',
    customerName: 'Name',
    customerEmail: 'Email',
    customerPhone: 'Phone',
    customerTaxId: 'Tax ID',
    customerAddress: 'Billing Address',
    status: {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      cancelled: 'Cancelled',
      pending: 'Pending',
    },
  },

  // Utilities (API uses 'natural-gas' as the key)
  utilities: {
    'electricity': 'Electricity',
    'natural-gas': 'Natural Gas',
    'water': 'Water',
    'sewage': 'Sewage',
  },

  // Usage
  usage: {
    consumptionChart: 'Consumption History',
    period: 'Period',
    previousReading: 'Previous',
    currentReading: 'Current',
    consumption: 'Consumption',
    unit: 'Unit',
    readingType: 'Type',
    noData: 'No usage data available',
    type: {
      actual: 'Actual',
      estimated: 'Estimated',
    },
  },

  // Meters
  meters: {
    title: 'My Gas Meters',
    details: 'Meter Details',
    total: 'Total',
    lastReading: 'Last Reading',
    noMeters: 'No meters found',
    noMetersDescription: 'Your gas meters will appear here once registered.',
    notFound: 'Meter not found',
    noReadings: 'No readings recorded',
    noActivities: 'No activity recorded',

    // Fields
    type: 'Type',
    manufacturer: 'Manufacturer',
    currentIndex: 'Current Index',
    previousIndex: 'Previous Index',
    installedDate: 'Installed Date',
    verificationDate: 'Verification Date',
    sealNumber: 'Seal Number',
    readingDate: 'Reading Date',
    consumption: 'Consumption',
    source: 'Source',
    readingHistory: 'Reading History',
    activities: 'Activity Log',

    // Submit Reading
    submitReading: 'Submit Reading',
    enterReading: 'Enter New Reading',
    currentIndexHint: 'Enter the value shown on your meter display',
    notes: 'Notes (optional)',
    notesHint: 'Add any additional notes about this reading',
    estimatedConsumption: 'Estimated Consumption',
    readingSubmitted: 'Reading Submitted!',
    readingSubmittedDescription: 'Your meter reading has been successfully recorded.',
    backToMeter: 'Back to Meter',
    submitError: 'Failed to submit reading',

    // Status
    status: {
      active: 'Active',
      pending: 'Pending',
      detached: 'Detached',
      replaced: 'Replaced',
      decommissioned: 'Decommissioned',
    },

    // Types
    types: {
      traditional: 'Traditional',
      smart: 'Smart',
      volumetric: 'Volumetric',
      thermal: 'Thermal',
    },

    // Reading Source
    readingSource: {
      customer: 'Self-Reading',
      manual: 'Manual',
      automatic: 'Automatic',
      estimated: 'Estimated',
    },

    // Validation
    validation: {
      indexMustBeHigher: 'Index must be higher than previous reading',
      indexTooHigh: 'Index seems too high. Please verify.',
    },

    // Warnings
    warnings: {
      highConsumption: 'Consumption seems unusually high. Please verify the reading.',
      zeroConsumption: 'No consumption detected. Verify the reading is correct.',
    },

    // Tips
    tips: {
      title: 'Tips for Reading',
      tip1: 'Read all digits on the meter display from left to right.',
      tip2: 'Ignore any red digits or digits after the decimal point.',
      tip3: 'Take a photo of your meter for reference.',
    },
  },

  // Payment
  payment: {
    payInvoice: 'Pay Invoice',
    amount: 'Amount to pay',
    cardDetails: 'Card Details',
    payNow: 'Pay {amount}',
    securePayment: 'Secure payment via Stripe',
    success: 'Payment successful!',
    successTitle: 'Payment Complete',
    successMessage: 'Thank you for your payment. Your invoice has been paid.',
    viewInvoices: 'View Invoices',
    error: 'Payment Error',
    failed: 'Payment failed. Please try again.',
    initError: 'Failed to initialize payment. Please try again.',
    alreadyPaid: 'This invoice has already been paid.',
    method: {
      card: 'Card',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      other: 'Other',
    },
  },

  // Tenancy errors (keyed by error.message_key from BE)
  tenancyError: {
    tenant_unknown: 'We couldn\'t find your account. Please check your link or contact support.',
    tenant_inactive: 'Your account is currently inactive. Please contact support for assistance.',
    tenant_archived: 'This account has been archived. Please contact support if you need access.',
    tenant_unavailable: 'The service is temporarily unavailable. Please try again shortly.',
    tenant_required: 'Please use your personalised link to access this portal.',
    tenant_required_for_route: 'Please use your personalised link to access this page.',
    landlord_required: 'This page is not available through the customer portal.',
    broadcast_no_tenant: 'Real-time updates are unavailable. Please refresh to see the latest data.',
    unknown_workspace_page: {
      title: 'Workspace not available',
      description: 'We couldn\'t open this workspace. The address may be wrong, or your provider may have suspended access. Please double-check the link or contact your provider.',
      cta: 'Back to main site',
    },
    no_workspace_landing: {
      title: 'You\'re on the main site',
      description: 'This portal is reached through your provider\'s personalised link. Please use the link your provider sent you.',
      example: 'Example: yourprovider.colab-client.app',
      cta: 'Visit our website',
    },
  },

  // UI Primitives
  ui: {
    emptyState: {
      defaultTitle: 'Nothing here yet',
      defaultSubtitle: 'Data will appear here once available.',
    },
    confirmDialog: {
      defaultTitle: 'Are you sure?',
      defaultOk: 'Confirm',
      defaultCancel: 'Cancel',
    },
  },

  // Profile
  profile: {
    title: 'My Profile',
    customer: 'Customer',
    email: 'Email',
    phone: 'Phone',
    changePassword: 'Change Password',
    changePasswordNotImplemented: 'Password change coming soon',
    mySuppliers: 'My Suppliers',
    tabs: {
      settings: 'Settings',
      contact: 'Contact Preferences',
      devices: 'Devices',
    },
  },

  // Profile Settings tab
  profileSettings: {
    saving: 'Saving...',
    saved: 'Saved',
    loadError: 'Failed to load settings',
    saveError: 'Failed to save settings',
    notifications: {
      title: 'Notification Preferences',
      hint: 'Choose how you want to receive notifications for each category',
      category: 'Category',
      email: 'Email',
      sms: 'SMS',
      push: 'Push',
      categories: {
        invoice: 'Invoices',
        payment: 'Payments',
        reading: 'Meter Readings',
        subscription: 'Subscriptions',
        maintenance: 'Maintenance',
        alert: 'Alerts',
        general: 'General',
      },
    },
    localization: {
      title: 'Language & Timezone',
      language: 'Language',
      timezone: 'Timezone',
    },
    channels: {
      title: 'Communication Channels',
      preferredChannel: 'Preferred Channel',
      emailOverride: 'Email Override',
      emailOverrideHint: 'Leave blank to use your account email',
      phoneOverride: 'Phone Override',
      phoneOverrideHint: 'Leave blank to use your account phone',
      options: {
        email: 'Email',
        sms: 'SMS',
        any: 'Any',
      },
    },
  },

  // Contact Settings section
  contactSettings: {
    title: 'Contact Preferences',
    hint: 'Customize how you receive communications as a contact',
    billingEmail: 'Billing Email Override',
    billingEmailHint: 'Invoices will be sent to this email instead of your account email',
    preferredChannel: 'Preferred Notification Channel',
    receiveLabel: 'Receive notifications for:',
    receiveInvoices: 'Invoices',
    receiveAlerts: 'Alerts',
    receiveReadings: 'Reading Reminders',
    loadError: 'Failed to load contact preferences',
    saveError: 'Failed to save contact preferences',
  },

  // Registered Devices section
  registeredDevices: {
    title: 'Registered Devices',
    hint: 'Devices registered for push notifications',
    noDevices: 'No devices registered',
    platform: 'Platform',
    lastUsed: 'Last used',
    registered: 'Registered',
    loadError: 'Failed to load devices',
    revokeTitle: 'Revoke Device',
    revokeMessage: 'Remove push notifications for "{name}"? You can re-register by logging in again.',
    revokeConfirm: 'Revoke',
  },

  // Errors / not found
  errors: {
    notFound: 'Oops. Nothing here...',
    goHome: 'Go Home',
  },

  // Forgot password (page-level strings)
  forgotPassword: {
    hint: 'Enter your email address and we will send you a password reset link.',
    emailLabel: 'Email',
    checkEmail: 'Check your email for password reset instructions.',
    submit: 'Send Link',
    backToLogin: 'Back to login',
    emailRequired: 'Please enter your email address',
    genericError: 'An error occurred',
  },

  // Notifications / alert center
  notifications: {
    loadMore: 'Load more',
    markAllRead: 'Mark all as read',
    close: 'Close',
    markRead: 'Mark as read',
    bellLabel: 'Notifications ({count} unread)',
    preferences: 'Notification preferences',
  },

  // Alert preferences page
  alertPreferences: {
    title: 'Notification Preferences',
    browserSection: 'Browser Notifications',
    browserHint: 'Receive desktop notifications even when the app is not open',
    enableBrowser: 'Enable Notifications',
    browserBlocked: 'Notifications have been blocked. Enable them in your browser settings.',
    enableAll: 'Enable All',
    disableAll: 'Disable All',
    save: 'Save Preferences',
    viewDetails: 'View details',
    addTitle: 'Add Notification Preference',
    alertType: 'Alert Type',
    channels: 'Notification Channels',
    channelEmail: 'Email',
    channelSms: 'SMS',
    channelInApp: 'In-App',
    quietHoursStart: 'Quiet From',
    quietHoursEnd: 'Quiet Until',
    deleteConfirmTitle: 'Remove Preference',
    deleteConfirmMessage: 'Remove this notification preference?',
    dismiss: 'Dismiss',
  },

  // Payments (cancel/success redirect pages)
  payments: {
    redirecting: 'Redirecting to payment...',
    error: 'Payment error',
    errorMessage: 'An error occurred while processing your payment. Please try again.',

    success: {
      title: 'Payment Successful!',
      message: 'Your payment has been processed successfully.',
      verifying: 'Verifying payment status...',
      viewInvoice: 'View Invoice',
      backToInvoices: 'Back to Invoices',
    },

    cancel: {
      title: 'Payment Cancelled',
      message: 'Your payment was cancelled. You can try again anytime.',
      tryAgain: 'Try Again',
      backToInvoices: 'Back to Invoices',
    },

    receipt: {
      number: 'Receipt Number',
      amount: 'Amount Paid',
      status: 'Status',
    },

    status: {
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
    },
  },

  // OTP Login (passwordless flow — OtpLoginPage)
  otp: {
    identifier: 'Email or Phone',
    identifierHint: 'Enter your email or phone number',
    titleIdentifier: 'Sign in without a password',
    subtitleIdentifier: 'Enter your email or phone number to receive a one-time code',
    titleVerify: 'Enter your code',
    subtitleVerify: 'Enter the one-time code we sent you',
    sentTo: 'Code sent to',
    verify: 'Verify & Sign In',
    resend: 'Resend Code',
    codeSent: 'Code sent successfully',
    invalidCode: 'Invalid code. Please try again.',
    errorSendingCode: 'Failed to send code. Please try again.',
    usePassword: 'Sign in with password',
    accountNumber: 'Account number',
    loginSuccess: 'Login successful',
  },
};
