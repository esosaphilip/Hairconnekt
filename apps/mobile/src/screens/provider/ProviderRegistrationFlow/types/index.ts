export type Step = 1 | 2 | 3 | 4 | 5;

export interface RNFile {
    uri: string;
    name: string;
}

export interface FormData {
    // Step 1: Basic Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    marketingEmails: boolean;

    // Step 2: Business Info
    businessName: string;
    businessTypes: string[];
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    state: string;
    showOnMap: boolean;
    serviceRadius: number;
    businessLicense: string;
    taxId: string;

    // Step 3: Services & Expertise
    serviceCategories: string[];
    yearsExperience: number;
    languages: string[];
    specializations: string[];

    // Step 4: Verification
    idDocument: RNFile | null;
    businessDocument: RNFile | null;
    certificates: RNFile[];
    profilePicture: RNFile | null;
    portfolioImages: RNFile[];
}
