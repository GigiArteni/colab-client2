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

  // Profile
  profile: {
    title: 'My Profile',
    customer: 'Customer',
    email: 'Email',
    phone: 'Phone',
    changePassword: 'Change Password',
    changePasswordNotImplemented: 'Password change coming soon',
    mySuppliers: 'My Suppliers',
  },
};
