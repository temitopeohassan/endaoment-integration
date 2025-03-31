type OrgAddress = {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
};

export type OrgListing = {
  id: string | null;
  ein: string | null;
  name: string;
  description: string | null;
  address: OrgAddress;
  website: string | null;
  logo: string;
  nteeCode: string;
  nteeDescription: string;
  isCompliant: boolean;
  lifetimeContributionsUsdc: string;
  donationsReceived: number;
  grantsReceived: number;
};

export type Daf = {
  id: string;
  name: string;
  type: string;
  description: string;
  logo: string;
  usdcBalance: string;
  inTransitBuyUsdcAmount: string;
  inTransitSellUsdcAmount: string;
  processingTransfersTotalUsdc: string;
};

export type WireInstructions = {
  beneficiary: {
    name: string;
    accountNumber: string;
    typeOfAccount: string;
    address: string;
  };
  receivingBank: {
    abaRoutingNumber: string;
    name: string;
    address: string;
  };
};
