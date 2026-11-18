export type Language = 'bn' | 'en';

export interface Translations {
  appName: string;
  appTagline: string;
  tabs: {
    cashOut: string;
    sendMoney: string;
    npsb: string;
    settings: string;
  };
  common: {
    yourBalance: string;
    desiredCashOut: string;
    wantToSend: string;
    transferAmount: string;
    optionalBalance: string;
    optionalBalanceHint: string;
    maxWithdrawable: string;
    maxSendable: string;
    maxTransferable: string;
    requestedAmount: string;
    cashOutCharge: string;
    serviceCharge: string;
    transactionFee: string;
    totalDeduction: string;
    totalRequired: string;
    remainingBalance: string;
    recipientReceives: string;
    effectiveRate: string;
    perThousand: string;
    flatCharge: string;
    free: string;
    bestValue: string;
    youSave: string;
    clear: string;
    reset: string;
    copy: string;
    copied: string;
    swapMode: string;
    wholeTaka: string;
    preciseMode: string;
    affordable: string;
    insufficientBalance: string;
    shortBy: string;
    unavailable: string;
    available: string;
    officialDefault: string;
    customized: string;
    restoreDefaults: string;
    verifiedDate: string;
    source: string;
    enterAmountPrompt: string;
    invalidInput: string;
    confirmInApp: string;
    verifiedRoute: string;
    cappedAtMax: string;
    monthlyResetNote: string;
    themeLight: string;
    themeDark: string;
  };
  cashOut: {
    bkash: string;
    nagad: string;
    modeAvailable: string;
    modeDesired: string;
    normalAgent: string;
    priyoAgent: string;
    priyoMonthlyTitle: string;
    priyoMonthlyUsed: string;
    priyoAllowance: string;
    priyoUsed: string;
    priyoRemaining: string;
    priyoDiscountActive: string;
    priyoExhaustedNote: string;
    priyoCrossingNote: string;
    atmSectionTitle: string;
    atmRevealBadge: string;
    atmSourceRegular: string;
    atmSourceRemittance: string;
    atmRemittanceBalanceLabel: string;
    atmRemittanceNote: string;
    atmDenominationNote: string;
    atmMinFeeNote: string;
    atmUnavailableBelowMin: string;
    atmUnavailableNeedFee: string;
    atmUnavailableMultiple: string;
    atmUnavailableExceedsMax: string;
    atmUnavailableNoRemittance: string;
    nagadRegular: string;
    nagadIslamic: string;
    nagadApp: string;
    nagadUssd: string;
    nagadVatNote: string;
  };
  sendMoney: {
    modeSendExact: string;
    modeFromBalance: string;
    bkashToBkash: string;
    nagadToNagad: string;
    nagadIslamic: string;
    normalNumber: string;
    priyoNumber: string;
    monthlySendUsed: string;
    priyoFreeRemaining: string;
    tierNormalSmallFree: string;
    tierPriyoFree: string;
    tierFiveBdt: string;
    tierTenBdt: string;
    crossedPriyo25k: string;
    crossedMonthly50k: string;
    nagadAppChannel: string;
    nagadUssdChannel: string;
    flatFeeNote: string;
    nagadCashbackNote: string;
    belowMinNote: string;
    aboveMaxNote: string;
  };
  npsb: {
    channelNpsb: string;
    channelDirectBank: string;
    directBankBadge: string;
    directBankRateLabel: string;
    partnerRate10: string;
    standardRate125: string;
    modeTransferAmount: string;
    modeFromBalance: string;
    fromWallet: string;
    toDestination: string;
    bankLabel: string;
    verifiedNpsbNote: string;
    confirmProviderNote: string;
    directBankWarning: string;
    senderWallet: string;
    recipientTarget: string;
    limitRange: string;
    belowMin: string;
    aboveMax: string;
    insufficientForMin: string;
  };
  settings: {
    title: string;
    subtitle: string;
    editRatesTitle: string;
    sourcesTitle: string;
    verifyAppWarning: string;
    resetAll: string;
    resetSuccess: string;
    customBadge: string;
    officialBadge: string;
    configurableBadge: string;
    verifiedBadge: string;
    bkashSection: string;
    nagadSection: string;
    npsbSection: string;
    monthlyTrackersTitle: string;
    clearMonthlyUsage: string;
  };
  footer: {
    disclaimer: string;
    privacy: string;
    offlineReady: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  bn: {
    appName: 'ChargeCalculator',
    appTagline: 'বিকাশ, নগদ ও এনপিএসবি নির্ভুল চার্জ ক্যালকুলেটর',
    tabs: {
      cashOut: 'ক্যাশ আউট',
      sendMoney: 'সেন্ড মানি',
      npsb: 'এনপিএসবি / ব্যাংক',
      settings: 'রেট ও সেটিংস',
    },
    common: {
      yourBalance: 'আপনার ব্যালান্স',
      desiredCashOut: 'যত টাকা তুলতে চান',
      wantToSend: 'টাকা পাঠাতে চান',
      transferAmount: 'ট্রান্সফার পরিমাণ',
      optionalBalance: 'আপনার ব্যালান্স (ঐচ্ছিক)',
      optionalBalanceHint: 'ব্যালান্স পর্যাপ্ত কি না যাচাই করতে লিখুন',
      maxWithdrawable: 'সর্বোচ্চ তুলতে পারবেন',
      maxSendable: 'সর্বোচ্চ পাঠাতে পারবেন',
      maxTransferable: 'সর্বোচ্চ ট্রান্সফার করতে পারবেন',
      requestedAmount: 'নির্ধারিত পরিমাণ',
      cashOutCharge: 'ক্যাশ আউট চার্জ',
      serviceCharge: 'সার্ভিস চার্জ',
      transactionFee: 'লেনদেন চার্জ',
      totalDeduction: 'মোট কেটে নেওয়া হবে',
      totalRequired: 'মোট প্রয়োজন',
      remainingBalance: 'অবশিষ্ট ব্যালান্স',
      recipientReceives: 'প্রাপক পাবেন',
      effectiveRate: 'কার্যকর হার',
      perThousand: 'প্রতি ১,০০০ টাকায়',
      flatCharge: 'নির্দিষ্ট চার্জ',
      free: 'ফ্রি',
      bestValue: 'সবচেয়ে সাশ্রয়ী',
      youSave: 'সাশ্রয় হবে',
      clear: 'মুছুন',
      reset: 'রিসেট',
      copy: 'কপি করুন',
      copied: 'কপি হয়েছে',
      swapMode: 'মোড বদলান',
      wholeTaka: 'পূর্ণ টাকা',
      preciseMode: 'দশমিকসহ',
      affordable: 'ব্যালান্স পর্যাপ্ত আছে',
      insufficientBalance: 'ব্যালান্স অপর্যাপ্ত',
      shortBy: 'আরও প্রয়োজন',
      unavailable: 'প্রযোজ্য নয়',
      available: 'উপলব্ধ',
      officialDefault: 'অফিশিয়াল রেট',
      customized: 'কাস্টমাইজড',
      restoreDefaults: 'ডিফল্ট রেট ফিরিয়ে আনুন',
      verifiedDate: 'সর্বশেষ যাচাই',
      source: 'উৎস',
      enterAmountPrompt: 'হিসাব দেখতে টাকার পরিমাণ লিখুন',
      invalidInput: 'সঠিক সংখ্যা লিখুন',
      confirmInApp: 'অ্যাপে রুট যাচাই করুন',
      verifiedRoute: 'যাচাইকৃত রুট',
      cappedAtMax: 'প্রতি লেনদেনের সর্বোচ্চ সীমায় নির্ধারিত',
      monthlyResetNote: 'প্রতি ক্যালেন্ডার মাসে স্বয়ংক্রিয়ভাবে রিসেট হয় (আপনার অ্যাকাউন্টের সাথে সংযুক্ত নয়)',
      themeLight: 'লাইট',
      themeDark: 'ডার্ক',
    },
    cashOut: {
      bkash: 'বিকাশ',
      nagad: 'নগদ',
      modeAvailable: 'ব্যালান্স থেকে হিসাব',
      modeDesired: 'নির্দিষ্ট ক্যাশ আউট',
      normalAgent: 'সাধারণ এজেন্ট',
      priyoAgent: 'প্রিয় এজেন্ট',
      priyoMonthlyTitle: 'প্রিয় এজেন্ট মাসিক লিমিট (ঐচ্ছিক)',
      priyoMonthlyUsed: 'এই মাসে ব্যবহৃত পরিমাণ',
      priyoAllowance: 'মাসিক ডিসকাউন্ট লিমিট',
      priyoUsed: 'ব্যবহৃত',
      priyoRemaining: 'বাকি ডিসকাউন্ট লিমিট',
      priyoDiscountActive: 'প্রিয় এজেন্ট ডিসকাউন্ট রেট প্রযোজ্য',
      priyoExhaustedNote: 'মাসিক ৫০,০০০ টাকার প্রিয় এজেন্ট লিমিট শেষ—তাই সাধারণ এজেন্ট রেট প্রযোজ্য হয়েছে।',
      priyoCrossingNote:
        'এই লেনদেনটি আপনার অবশিষ্ট মাসিক প্রিয় লিমিট অতিক্রম করেছে। বিকাশের নিয়ম অনুযায়ী পুরো লেনদেনের ওপর সাধারণ এজেন্ট রেট প্রযোজ্য হয়েছে (আংশিক ডিসকাউন্ট নয়)।',
      atmSectionTitle: 'এটিএম ক্যাশ আউট',
      atmRevealBadge: '৩,০০০+ টাকা ব্যালান্স',
      atmSourceRegular: 'সাধারণ ব্যালান্স',
      atmSourceRemittance: 'বৈধ রেমিট্যান্স ব্যালান্স',
      atmRemittanceBalanceLabel: 'যোগ্য রেমিট্যান্স ব্যালান্স (ঐচ্ছিক)',
      atmRemittanceNote: 'সাধারণ ওয়ালেট ব্যালান্সে ৭.০০ টাকা/হাজার রেমিট্যান্স রেট প্রযোজ্য নয়।',
      atmDenominationNote: '৫০০ টাকার গুণিতকে হিসাবকৃত',
      atmMinFeeNote: 'সর্বনিম্ন তোলার জন্য চার্জসহ ব্যালান্স থাকতে হবে',
      atmUnavailableBelowMin: 'এটিএম থেকে সর্বনিম্ন ৩,০০০ টাকা তুলতে হয়।',
      atmUnavailableNeedFee: 'সর্বনিম্ন উত্তোলন ও এটিএম চার্জ মিলে পর্যাপ্ত ব্যালান্স নেই।',
      atmUnavailableMultiple: 'এটিএম উত্তোলনের পরিমাণ অবশ্যই ৫০০ টাকার গুণিতক হতে হবে।',
      atmUnavailableExceedsMax: 'প্রতি লেনদেনে এটিএমের সর্বোচ্চ সীমা অতিক্রম করেছে।',
      atmUnavailableNoRemittance: 'বৈধ রেমিট্যান্স ব্যালান্স শূন্য।',
      nagadRegular: 'সাধারণ অ্যাকাউন্ট',
      nagadIslamic: 'নগদ ইসলামিক',
      nagadApp: 'নগদ অ্যাপ',
      nagadUssd: 'ইউএসএসডি (*১৬৭#)',
      nagadVatNote: 'সকল নগদ ক্যাশ আউট চার্জ ভ্যাটসহ হিসাবকৃত।',
    },
    sendMoney: {
      modeSendExact: 'নির্দিষ্ট টাকা পাঠাব',
      modeFromBalance: 'ব্যালান্স থেকে পাঠাব',
      bkashToBkash: 'বিকাশ → বিকাশ',
      nagadToNagad: 'নগদ → নগদ',
      nagadIslamic: 'নগদ ইসলামিক',
      normalNumber: 'সাধারণ নম্বর',
      priyoNumber: 'প্রিয় নম্বর',
      monthlySendUsed: 'এই মাসে সেন্ড মানি ব্যবহৃত (ঐচ্ছিক)',
      priyoFreeRemaining: 'ফ্রি লিমিট বাকি',
      tierNormalSmallFree: '৫০ টাকা পর্যন্ত ফ্রি লেনদেন',
      tierPriyoFree: 'প্রিয় নম্বরে ২৫,০০০ টাকা পর্যন্ত ফ্রি',
      tierFiveBdt: 'নির্দিষ্ট ৫ টাকা চার্জ স্ল্যাব',
      tierTenBdt: '৫০,০০০+ মাসিক সীমা — ১০ টাকা চার্জ',
      crossedPriyo25k: 'মাসিক ২৫,০০০ টাকা প্রিয় ফ্রি সীমা অতিক্রম করায় ৫ টাকা চার্জ প্রযোজ্য।',
      crossedMonthly50k: 'মাসিক ৫০,০০০ টাকা সীমা অতিক্রম করায় ১০ টাকা চার্জ প্রযোজ্য।',
      nagadAppChannel: 'নগদ অ্যাপ',
      nagadUssdChannel: 'ইউএসএসডি (*১৬৭#)',
      flatFeeNote: 'শতকরা নয়—প্রতি লেনদেনে নির্দিষ্ট ফ্ল্যাট চার্জ প্রযোজ্য।',
      nagadCashbackNote: 'নগদ অ্যাপে মাসের প্রথম ২ লেনদেনে প্রোমোশনাল ক্যাশব্যাক থাকতে পারে (অ্যাপে নিশ্চিত করুন)।',
      belowMinNote: 'সর্বনিম্ন সেন্ড মানি সীমার নিচে।',
      aboveMaxNote: 'প্রতি লেনদেনের সর্বোচ্চ সীমার ওপরে।',
    },
    npsb: {
      channelNpsb: 'এনপিএসবি (০.৮৫%)',
      channelDirectBank: 'সরাসরি বিকাশ → ব্যাংক (নন-এনপিএসবি)',
      directBankBadge: 'নন-এনপিএসবি ব্যাংক-নির্দিষ্ট রেট',
      directBankRateLabel: 'ব্যাংক চার্জ রেট নির্বাচন করুন',
      partnerRate10: '৳১০.০০ / ১,০০০ (১.০০%)',
      standardRate125: '৳১২.৫০ / ১,০০০ (১.২৫%)',
      modeTransferAmount: 'ট্রান্সফার পরিমাণ',
      modeFromBalance: 'ব্যালান্স থেকে হিসাব',
      fromWallet: 'প্রেরক ওয়ালেট',
      toDestination: 'প্রাপক ব্যাংক / ওয়ালেট',
      bankLabel: 'ব্যাংক অ্যাকাউন্ট',
      verifiedNpsbNote: 'যাচাইকৃত এনপিএসবি রেট: প্রতি ১,০০০ টাকায় ৮.৫০ টাকা (০.৮৫%)। বিকাশ সীমা ৩০০–২৫,০০০ টাকা।',
      confirmProviderNote:
        'এই রুটের প্রাপ্যতা ও লেনদেন সীমা প্রোভাইডার অ্যাপে নিশ্চিত করুন; অযাচাইকৃত সীমা অনুমান করা হয়নি।',
      directBankWarning:
        'এটি এনপিএসবি নয়—পার্টনার ব্যাংক অনুযায়ী চার্জ ১০.০০ বা ১২.৫০ টাকা/হাজার হতে পারে।',
      senderWallet: 'প্রেরক',
      recipientTarget: 'প্রাপক',
      limitRange: 'লেনদেন সীমা',
      belowMin: 'সর্বনিম্ন ট্রান্সফার সীমার নিচে।',
      aboveMax: 'প্রতি লেনদেনের সর্বোচ্চ সীমার ওপরে।',
      insufficientForMin: 'সর্বনিম্ন ট্রান্সফার ও চার্জ মেটানোর মতো ব্যালান্স নেই।',
    },
    settings: {
      title: 'চার্জ রেট ও নীতিমালা',
      subtitle: 'সকল অফিশিয়াল ডিফল্ট রেট দেখুন, প্রয়োজনে কাস্টমাইজ করুন বা রিসেট করুন।',
      editRatesTitle: 'কনফিগারেবল রেটসমূহ',
      sourcesTitle: 'অফিশিয়াল সূত্র ও যাচাইকরণ',
      verifyAppWarning:
        'গুরুত্বপূর্ণ: লেনদেন নিশ্চিত করার আগে অনুগ্রহ করে বিকাশ, নগদ বা সংশ্লিষ্ট ব্যাংকের অফিশিয়াল অ্যাপে বর্তমান চার্জ যাচাই করে নিন।',
      resetAll: 'সব ডিফল্ট রেট ফিরিয়ে আনুন',
      resetSuccess: 'সকল রেট অফিশিয়াল ডিফল্টে ফিরিয়ে আনা হয়েছে।',
      customBadge: 'কাস্টম',
      officialBadge: 'অফিশিয়াল ডিফল্ট',
      configurableBadge: 'কনফিগারেবল',
      verifiedBadge: 'যাচাইকৃত',
      bkashSection: 'বিকাশ রেট ও সীমা',
      nagadSection: 'নগদ ও নগদ ইসলামিক রেট',
      npsbSection: 'এনপিএসবি ও সরাসরি ব্যাংক রেট',
      monthlyTrackersTitle: 'মাসিক ব্যবহারের ডেটা',
      clearMonthlyUsage: 'মাসিক ব্যবহারের হিসাব শূন্য করুন',
    },
    footer: {
      disclaimer:
        'ChargeCalculator একটি স্বাধীন হিসাবকারী অ্যাপ—বিকাশ, নগদ, রকেট বা কোনো ব্যাংকের সাথে এর অফিশিয়াল সম্পর্ক নেই।',
      privacy: 'কোনো পিন, ওটিপি বা অ্যাকাউন্ট তথ্য নেওয়া হয় না। সব হিসাব আপনার ডিভাইসেই সম্পন্ন হয়।',
      offlineReady: 'অফলাইন পিডব্লিউএ সমর্থিত',
    },
  },
  en: {
    appName: 'ChargeCalculator',
    appTagline: 'Accurate Bangladesh MFS, ATM & NPSB Fee Calculator',
    tabs: {
      cashOut: 'Cash Out',
      sendMoney: 'Send Money',
      npsb: 'NPSB / Bank',
      settings: 'Rates & Settings',
    },
    common: {
      yourBalance: 'Your Balance',
      desiredCashOut: 'Desired Cash Out',
      wantToSend: 'Amount to Send',
      transferAmount: 'Transfer Amount',
      optionalBalance: 'Your Wallet Balance (Optional)',
      optionalBalanceHint: 'Enter balance to check affordability',
      maxWithdrawable: 'Maximum Withdrawable',
      maxSendable: 'Maximum Sendable',
      maxTransferable: 'Maximum Transferable',
      requestedAmount: 'Requested Amount',
      cashOutCharge: 'Cash-Out Charge',
      serviceCharge: 'Service Charge',
      transactionFee: 'Transaction Fee',
      totalDeduction: 'Total Wallet Deduction',
      totalRequired: 'Total Required',
      remainingBalance: 'Remaining Balance',
      recipientReceives: 'Recipient Receives',
      effectiveRate: 'Effective Rate',
      perThousand: 'per BDT 1,000',
      flatCharge: 'Flat Fee',
      free: 'Free',
      bestValue: 'Best Value',
      youSave: 'You Save',
      clear: 'Clear',
      reset: 'Reset',
      copy: 'Copy',
      copied: 'Copied',
      swapMode: 'Swap Mode',
      wholeTaka: 'Whole Taka',
      preciseMode: 'Precise (.00)',
      affordable: 'Sufficient balance',
      insufficientBalance: 'Insufficient balance',
      shortBy: 'Short by',
      unavailable: 'Unavailable',
      available: 'Available',
      officialDefault: 'Official Default',
      customized: 'Customized',
      restoreDefaults: 'Restore Default Rates',
      verifiedDate: 'Last Verified',
      source: 'Source',
      enterAmountPrompt: 'Enter an amount to see instant calculations',
      invalidInput: 'Enter a valid amount',
      confirmInApp: 'Confirm route in app',
      verifiedRoute: 'Verified Route',
      cappedAtMax: 'Capped at per-transaction maximum',
      monthlyResetNote: 'Resets automatically every calendar month (local estimate, not linked to your wallet)',
      themeLight: 'Light',
      themeDark: 'Dark',
    },
    cashOut: {
      bkash: 'bKash',
      nagad: 'Nagad',
      modeAvailable: 'Available Balance',
      modeDesired: 'Desired Cash Out',
      normalAgent: 'Normal Agent',
      priyoAgent: 'Priyo Agent',
      priyoMonthlyTitle: 'Priyo Agent Monthly Allowance (Optional)',
      priyoMonthlyUsed: 'Used This Month',
      priyoAllowance: 'Monthly Discounted Limit',
      priyoUsed: 'Used',
      priyoRemaining: 'Remaining Allowance',
      priyoDiscountActive: 'Priyo Agent discounted rate active',
      priyoExhaustedNote:
        'Monthly BDT 50,000 Priyo allowance is exhausted — Normal Agent rate applies.',
      priyoCrossingNote:
        'This transaction crosses your remaining monthly Priyo allowance. Per bKash policy, Normal Agent rate applies to the entire crossing transaction (no blended fee).',
      atmSectionTitle: 'ATM Cash Out',
      atmRevealBadge: 'Balance ≥ 3,000',
      atmSourceRegular: 'Regular Balance',
      atmSourceRemittance: 'Eligible Remittance',
      atmRemittanceBalanceLabel: 'Eligible Remittance Funds (Optional)',
      atmRemittanceNote: 'Standard wallet funds do not qualify for the BDT 7.00/1,000 remittance rate.',
      atmDenominationNote: 'Calculated in BDT 500 multiples',
      atmMinFeeNote: 'Minimum balance required including ATM fee',
      atmUnavailableBelowMin: 'Minimum ATM withdrawal is BDT 3,000.',
      atmUnavailableNeedFee: 'Balance must cover minimum withdrawal plus ATM charge.',
      atmUnavailableMultiple: 'ATM withdrawal must be a multiple of BDT 500.',
      atmUnavailableExceedsMax: 'Exceeds per-transaction ATM withdrawal limit.',
      atmUnavailableNoRemittance: 'Eligible remittance balance is zero.',
      nagadRegular: 'Regular Account',
      nagadIslamic: 'Nagad Islamic',
      nagadApp: 'Nagad App',
      nagadUssd: 'USSD (*167#)',
      nagadVatNote: 'All Nagad cash-out rates include VAT.',
    },
    sendMoney: {
      modeSendExact: 'I Want to Send',
      modeFromBalance: 'I Have This Balance',
      bkashToBkash: 'bKash → bKash',
      nagadToNagad: 'Nagad → Nagad',
      nagadIslamic: 'Nagad Islamic',
      normalNumber: 'Normal Number',
      priyoNumber: 'Priyo Number',
      monthlySendUsed: 'Monthly Send Money Used (Optional)',
      priyoFreeRemaining: 'Free Limit Left',
      tierNormalSmallFree: 'Free transfer up to BDT 50',
      tierPriyoFree: 'Free up to BDT 25,000/month to Priyo numbers',
      tierFiveBdt: 'Flat BDT 5 transaction fee tier',
      tierTenBdt: 'Above BDT 50,000/month — Flat BDT 10 fee',
      crossedPriyo25k: 'Crosses the BDT 25,000 monthly Priyo free tier — BDT 5 charge applies.',
      crossedMonthly50k: 'Crosses the BDT 50,000 monthly threshold — BDT 10 charge applies.',
      nagadAppChannel: 'Nagad App',
      nagadUssdChannel: 'USSD (*167#)',
      flatFeeNote: 'Flat per-transaction fee — not a percentage charge.',
      nagadCashbackNote: 'Nagad App may offer promotional cashback on the first 2 monthly transfers (check app).',
      belowMinNote: 'Below minimum send money limit.',
      aboveMaxNote: 'Exceeds per-transaction send money limit.',
    },
    npsb: {
      channelNpsb: 'NPSB (0.85%)',
      channelDirectBank: 'Direct bKash → Bank (Non-NPSB)',
      directBankBadge: 'Non-NPSB Bank-Specific Rate',
      directBankRateLabel: 'Select Bank-Specific Rate',
      partnerRate10: 'BDT 10.00 / 1,000 (1.00%)',
      standardRate125: 'BDT 12.50 / 1,000 (1.25%)',
      modeTransferAmount: 'Transfer Amount',
      modeFromBalance: 'From Balance',
      fromWallet: 'Sender Wallet',
      toDestination: 'Recipient Bank / Wallet',
      bankLabel: 'Bank Account',
      verifiedNpsbNote:
        'Verified NPSB rate: BDT 8.50 per 1,000 (0.85%). Published bKash NPSB range: BDT 300–25,000.',
      confirmProviderNote:
        'Confirm route availability and limits in the provider app; unverified limits are not assumed.',
      directBankWarning:
        'Non-NPSB direct transfer — bank-specific charges (BDT 10.00 or 12.50 per 1,000) apply.',
      senderWallet: 'Sender',
      recipientTarget: 'Recipient',
      limitRange: 'Transaction Range',
      belowMin: 'Below minimum transfer limit.',
      aboveMax: 'Exceeds per-transaction maximum limit.',
      insufficientForMin: 'Balance is insufficient for the minimum transfer plus fee.',
    },
    settings: {
      title: 'Rates & Policy Configuration',
      subtitle: 'Inspect official default rates, edit custom rates, or restore defaults anytime.',
      editRatesTitle: 'Configurable Rates',
      sourcesTitle: 'Official Sources & Verification',
      verifyAppWarning:
        'Important: Always confirm actual transaction charges inside your bKash, Nagad, or bank app before transacting.',
      resetAll: 'Restore All Defaults',
      resetSuccess: 'All rates restored to official defaults.',
      customBadge: 'Custom',
      officialBadge: 'Official Default',
      configurableBadge: 'Configurable',
      verifiedBadge: 'Verified',
      bkashSection: 'bKash Rates & Limits',
      nagadSection: 'Nagad & Nagad Islamic Rates',
      npsbSection: 'NPSB & Direct Bank Transfer Rates',
      monthlyTrackersTitle: 'Monthly Usage Trackers',
      clearMonthlyUsage: 'Reset Monthly Usage Counters',
    },
    footer: {
      disclaimer:
        'ChargeCalculator is an independent financial calculation utility and is not officially affiliated with bKash, Nagad, Rocket, or any bank.',
      privacy: 'We never ask for PIN, OTP, passwords, or account credentials. All calculations run locally on your device.',
      offlineReady: 'Offline PWA Ready',
    },
  },
};
