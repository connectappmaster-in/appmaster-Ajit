export interface Asset {
  id: string;
  name: string;
  purchaseDate: string;
  capitalizationDate: string;
  purchaseValue: number;
  location: string;
  department: string;
  status: 'Active' | 'Disposed';
  disposalDate?: string;
  disposalValue?: number;
  categoryName: string;
  usedFor: ('Companies Act' | 'IT Act')[];
  usefulLifeYears?: number;
  residualValuePercent?: number;
  depreciationMethod?: 'SLM' | 'WDV';
  depreciationRatePercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepreciationEntry {
  year: number;
  openingValue: number;
  depreciation: number;
  closingValue: number;
  isProRata?: boolean;
}

export interface DepreciationSchedule {
  type: 'Companies Act' | 'IT Act';
  entries: DepreciationEntry[];
  totalDepreciation: number;
  currentWDV: number;
}

export interface AssetFormData {
  name: string;
  purchaseDate: string;
  capitalizationDate: string;
  purchaseValue: number | '';
  location: string;
  department: string;
  status: 'Active' | 'Disposed';
  disposalDate: string;
  disposalValue: number | '';
  categoryName: string;
  usedFor: ('Companies Act' | 'IT Act')[];
  usefulLifeYears: number | '';
  residualValuePercent: number | '';
  depreciationMethod: 'SLM' | 'WDV';
  depreciationRatePercent: number | '';
}