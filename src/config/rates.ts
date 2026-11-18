/**
 * Centralized, strongly-typed financial rate and rule configuration.
 *
 * All per-thousand rates are represented as decimal BDT per BDT 1,000
 * (converted to integer poisha inside the calculation engine to eliminate
 * floating-point inaccuracies).
 *
 * Reference verification date: November 18, 2026
 */

export const VERIFIED_DATE = '2026-11-18';
export const VERIFIED_DATE_DISPLAY_EN = 'November 18, 2026';
export const VERIFIED_DATE_DISPLAY_BN = '১৮ নভেম্বর, ২০২৬';

export type VerificationStatus = 'verified' | 'configurable';

export interface RateSourceMeta {
  id: string;
  labelEn: string;
  labelBn: string;
  sourceName: string;
  sourceUrl: string;
  verifiedDate: string;
  status: VerificationStatus;
  noteEn?: string;
  noteBn?: string;
}

export interface RateConfig {
  bkash: {
    cashOut: {
      normalAgentPerThousand: number; // BDT 18.50 per 1,000
      priyoAgentPerThousand: number; // BDT 13.95 per 1,000
      priyoMonthlyAllowanceBdt: number; // BDT 50,000 per calendar month
      regularAtmPerThousand: number; // BDT 14.90 per 1,000
      remittanceAtmPerThousand: number; // BDT 7.00 per 1,000
      atmMinBdt: number; // BDT 3,000
      atmMultipleBdt: number; // BDT 500
      atmMaxPerTxnBdt: number; // BDT 20,000 (configurable; some partner bank ATMs cap at 10,000)
    };
    sendMoney: {
      normalFreeMaxBdt: number; // Up to BDT 50 free for normal numbers
      priyoFreeMonthlyLimitBdt: number; // Up to BDT 25,000/month free for Priyo numbers
      tier1FeeBdt: number; // BDT 5 flat fee
      tier1MonthlyCeilingBdt: number; // Up to BDT 50,000/month
      tier2FeeBdt: number; // BDT 10 flat fee above BDT 50,000/month
    };
    directBank: {
      standardPerThousand: number; // BDT 12.50 per 1,000 (non-NPSB bank-specific)
      partnerPerThousand: number; // BDT 10.00 per 1,000 (non-NPSB partner bank-specific)
      minBdt: number; // BDT 50
      maxBdt: number; // BDT 50,000
    };
  };
  nagad: {
    cashOut: {
      regularAppPerThousand: number; // BDT 12.99 per 1,000
      regularUssdPerThousand: number; // BDT 15.00 per 1,000
      islamicAppPerThousand: number; // BDT 15.00 per 1,000
      islamicUssdPerThousand: number; // BDT 15.00 per 1,000
    };
    sendMoney: {
      regularAppFlatFeeBdt: number; // BDT 5.00 flat
      regularUssdFlatFeeBdt: number; // BDT 5.00 flat
      islamicAppFlatFeeBdt: number; // BDT 5.00 flat
      islamicUssdFlatFeeBdt: number; // BDT 5.00 flat
      minBdt: number; // BDT 10
      maxBdt: number; // BDT 50,000
    };
  };
  npsb: {
    mfsToBankOrMfsPerThousand: number; // BDT 8.50 per 1,000 (0.85%)
    bkashMinBdt: number; // BDT 300 (verified published bKash NPSB min)
    bkashMaxBdt: number; // BDT 25,000 (verified published bKash NPSB max)
    otherProviderMinBdt: number | null; // Do not fabricate unverified limits
    otherProviderMaxBdt: number | null; // Do not fabricate unverified limits
  };
}

export const DEFAULT_RATES: RateConfig = {
  bkash: {
    cashOut: {
      normalAgentPerThousand: 18.5,
      priyoAgentPerThousand: 13.95,
      priyoMonthlyAllowanceBdt: 50000,
      regularAtmPerThousand: 14.9,
      remittanceAtmPerThousand: 7.0,
      atmMinBdt: 3000,
      atmMultipleBdt: 500,
      atmMaxPerTxnBdt: 20000,
    },
    sendMoney: {
      normalFreeMaxBdt: 50,
      priyoFreeMonthlyLimitBdt: 25000,
      tier1FeeBdt: 5,
      tier1MonthlyCeilingBdt: 50000,
      tier2FeeBdt: 10,
    },
    directBank: {
      standardPerThousand: 12.5,
      partnerPerThousand: 10.0,
      minBdt: 50,
      maxBdt: 50000,
    },
  },
  nagad: {
    cashOut: {
      regularAppPerThousand: 12.99,
      regularUssdPerThousand: 15.0,
      islamicAppPerThousand: 15.0,
      islamicUssdPerThousand: 15.0,
    },
    sendMoney: {
      regularAppFlatFeeBdt: 5.0,
      regularUssdFlatFeeBdt: 5.0,
      islamicAppFlatFeeBdt: 5.0,
      islamicUssdFlatFeeBdt: 5.0,
      minBdt: 10,
      maxBdt: 50000,
    },
  },
  npsb: {
    mfsToBankOrMfsPerThousand: 8.5,
    bkashMinBdt: 300,
    bkashMaxBdt: 25000,
    otherProviderMinBdt: null,
    otherProviderMaxBdt: null,
  },
};

export const RATE_SOURCES: RateSourceMeta[] = [
  {
    id: 'bkash-cashout',
    labelEn: 'bKash Normal Agent Cash Out (BDT 18.50 / 1,000)',
    labelBn: 'বিকাশ সাধারণ এজেন্ট ক্যাশ আউট (১৮.৫০ টাকা / ১,০০০)',
    sourceName: 'bKash Official — Cash Out',
    sourceUrl: 'https://www.bkash.com/en/products-services/cashout',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
  },
  {
    id: 'bkash-priyo-agent',
    labelEn: 'bKash Priyo Agent (BDT 13.95 / 1,000 up to BDT 50,000/mo)',
    labelBn: 'বিকাশ প্রিয় এজেন্ট (১৩.৯৫ টাকা / ১,০০০, মাসিক ৫০,০০০ টাকা পর্যন্ত)',
    sourceName: 'bKash Official — Cash Out from Agent',
    sourceUrl: 'https://www.bkash.com/en/products-services/cashout-from-agent',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
    noteEn: 'Transactions crossing the remaining monthly allowance incur the Normal Agent rate on the entire transaction.',
    noteBn: 'অবশিষ্ট মাসিক লিমিট অতিক্রমকারী লেনদেনে পুরো লেনদেনের ওপর সাধারণ এজেন্ট চার্জ প্রযোজ্য হয়।',
  },
  {
    id: 'bkash-atm',
    labelEn: 'bKash Regular ATM Cash Out (BDT 14.90 / 1,000)',
    labelBn: 'বিকাশ সাধারণ এটিএম ক্যাশ আউট (১৪.৯০ টাকা / ১,০০০)',
    sourceName: 'bKash Official — Cash Out from ATM',
    sourceUrl: 'https://www.bkash.com/en/products-services/cash-out-from-atm',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
    noteEn: 'Minimum BDT 3,000 in BDT 500 multiples. Per-transaction ceiling depends on partner bank ATM (default BDT 20,000, configurable).',
    noteBn: 'সর্বনিম্ন ৩,০০০ টাকা এবং ৫০০ টাকার গুণিতকে তুলতে হয়। প্রতি লেনদেনের সর্বোচ্চ সীমা পার্টনার ব্যাংক এটিএম অনুযায়ী ভিন্ন হতে পারে।',
  },
  {
    id: 'bkash-remittance-atm',
    labelEn: 'bKash Eligible Remittance ATM (BDT 7.00 / 1,000)',
    labelBn: 'বিকাশ রেমিট্যান্স এটিএম ক্যাশ আউট (৭.০০ টাকা / ১,০০০)',
    sourceName: 'bKash Official — Remittance Cash Out from ATM',
    sourceUrl: 'https://www.bkash.com/en/products-services/remittance/remittance-cash-out-from-atm',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
    noteEn: 'Only eligible foreign remittance funds qualify for the BDT 7.00/1,000 ATM rate.',
    noteBn: 'শুধুমাত্র বৈধভাবে প্রাপ্ত রেমিট্যান্স ব্যালান্সের ক্ষেত্রে ৭.০০ টাকা/হাজার রেট প্রযোজ্য।',
  },
  {
    id: 'bkash-send-money',
    labelEn: 'bKash Send Money (Priyo Free ≤25k, BDT 5 / BDT 10 tiers)',
    labelBn: 'বিকাশ সেন্ড মানি (প্রিয় নম্বরে ২৫,০০০ ফ্রি, ৫ ও ১০ টাকা চার্জ)',
    sourceName: 'bKash Official — Send Money & Priyo Number',
    sourceUrl: 'https://www.bkash.com/en/products-services/send-money/send-money-to-priyo-number',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
    noteEn: 'Normal number small transfers up to BDT 50 are free; BDT 5 up to 50k monthly, BDT 10 above 50k monthly.',
    noteBn: 'সাধারণ নম্বরে ৫০ টাকা পর্যন্ত ফ্রি; মাসিক ৫০,০০০ টাকা পর্যন্ত ৫ টাকা এবং এর বেশি হলে ১০ টাকা।',
  },
  {
    id: 'bkash-npsb',
    labelEn: 'NPSB Interoperable Transfer (BDT 8.50 / 1,000 = 0.85%)',
    labelBn: 'এনপিএসবি ইন্টারঅপারেবল ট্রান্সফার (৮.৫০ টাকা / ১,০০০ = ০.৮৫%)',
    sourceName: 'bKash NPSB & Bangladesh Bank',
    sourceUrl: 'https://www.bkash.com/en/page/npsb-b2b-b2mfs',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
    noteEn: 'bKash published NPSB range: BDT 300 to BDT 25,000 per transaction. Other MFS provider routes are configurable; confirm availability in provider app.',
    noteBn: 'বিকাশ এনপিএসবি সীমা: প্রতি লেনদেনে ৩০০ থেকে ২৫,০০০ টাকা। অন্যান্য প্রোভাইডারের রুট প্রাপ্যতা অ্যাপে যাচাই করুন।',
  },
  {
    id: 'bkash-direct-bank',
    labelEn: 'Direct bKash-to-Bank (Non-NPSB: BDT 10.00 / 12.50 per 1,000)',
    labelBn: 'সরাসরি বিকাশ থেকে ব্যাংক (নন-এনপিএসবি: ১০.০০ / ১২.৫০ টাকা প্রতি ১,০০০)',
    sourceName: 'bKash Official — bKash to Bank',
    sourceUrl: 'https://www.bkash.com/en/products-services/bkash-to-bank',
    verifiedDate: VERIFIED_DATE,
    status: 'configurable',
    noteEn: 'Non-NPSB direct bank transfer charges depend on the destination partner bank (typically BDT 10.00 or BDT 12.50 per 1,000).',
    noteBn: 'নন-এনপিএসবি সরাসরি ব্যাংক ট্রান্সফার চার্জ নির্ধারিত ব্যাংকের ওপর নির্ভর করে (সাধারণত ১০.০০ বা ১২.৫০ টাকা/হাজার)।',
  },
  {
    id: 'nagad-regular',
    labelEn: 'Nagad Regular (App 12.99 / USSD 15.00; Send Money BDT 5 flat)',
    labelBn: 'নগদ সাধারণ (অ্যাপ ১২.৯৯ / ইউএসএসডি ১৫.০০; সেন্ড মানি ৫ টাকা নির্দিষ্ট)',
    sourceName: 'Nagad Official — Limit & Charges',
    sourceUrl: 'https://nagad.com.bd/en/limit-charges/',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
    noteEn: 'All Nagad cash-out rates include VAT. Send Money is a flat BDT 5 charge (promotional app cashback may apply to initial monthly transactions).',
    noteBn: 'নগদের ক্যাশ আউট চার্জ ভ্যাটসহ। সেন্ড মানি প্রতি লেনদেনে নির্দিষ্ট ৫ টাকা (অ্যাপে প্রথম ২ লেনদেনে ক্যাশব্যাক অফার থাকতে পারে)।',
  },
  {
    id: 'nagad-islamic',
    labelEn: 'Nagad Islamic (Cash Out 15.00 / 1,000; Send Money BDT 5 flat)',
    labelBn: 'নগদ ইসলামিক (ক্যাশ আউট ১৫.০০ / ১,০০০; সেন্ড মানি ৫ টাকা নির্দিষ্ট)',
    sourceName: 'Nagad Islamic — Limit & Charges',
    sourceUrl: 'https://nagadislamic.com.bd/en/limit-and-charges/',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
    noteEn: 'Shariah-compliant Nagad Islamic channel rates are configurable in Settings if updated by Nagad.',
    noteBn: 'নগদ ইসলামিক চ্যানেলের হার পরিবর্তন হলে সেটিংস থেকে সহজেই কাস্টমাইজ করা যাবে।',
  },
  {
    id: 'bangladesh-bank',
    labelEn: 'Bangladesh Bank Interoperable Payment Policy',
    labelBn: 'বাংলাদেশ ব্যাংক ইন্টারঅপারেবল পেমেন্ট নীতিমালা',
    sourceName: 'Bangladesh Bank Official',
    sourceUrl: 'https://www.bb.org.bd/',
    verifiedDate: VERIFIED_DATE,
    status: 'verified',
  },
];

export function cloneRates(rates: RateConfig): RateConfig {
  return JSON.parse(JSON.stringify(rates)) as RateConfig;
}
