import { ApplicableLaw, DepreciationMethod } from "./depreciationCategories";

export interface AssetInput {
  assetName: string;
  applicableLaw: ApplicableLaw;
  assetCategory: string;
  purchaseDate: Date;
  originalCost: number;
  usefulLife: number;
  residualValuePct: number;
  depreciationRate: number;
  depreciationMethod: DepreciationMethod;
  multiShiftUse: number;
  additionalDepreciationEligible: boolean;
  fyStartMonth: number;
  fyStartDay: number;
}

export interface Transaction {
  date: Date;
  type: "Addition" | "Disposal";
  amount: number;
}

export interface YearSchedule {
  year: number;
  financialYear: string;
  openingValue: number;
  additions: number;
  disposals: number;
  depreciation: number;
  additionalDepreciation: number;
  accumulatedDepreciation: number;
  closingValue: number;
}

const getDaysUsedInFirstYear = (purchaseDate: Date, fyStart: { month: number; day: number }): number => {
  const year = purchaseDate.getFullYear();
  const fyStartDate = new Date(year, fyStart.month - 1, fyStart.day);
  
  if (purchaseDate < fyStartDate) {
    fyStartDate.setFullYear(year - 1);
  }
  
  const fyEndDate = new Date(fyStartDate);
  fyEndDate.setFullYear(fyEndDate.getFullYear() + 1);
  
  const daysInYear = (fyEndDate.getTime() - fyStartDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysUsed = Math.max(0, (fyEndDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.min(daysUsed, daysInYear);
};

const getFinancialYear = (yearNumber: number, purchaseDate: Date, fyStart: { month: number; day: number }): string => {
  const year = purchaseDate.getFullYear();
  const fyStartDate = new Date(year, fyStart.month - 1, fyStart.day);
  
  if (purchaseDate < fyStartDate) {
    fyStartDate.setFullYear(year - 1);
  }
  
  const startYear = fyStartDate.getFullYear() + yearNumber - 1;
  const endYear = startYear + 1;
  
  return `FY ${startYear}-${endYear}`;
};

export const calculateCompaniesActSchedule = (
  asset: AssetInput,
  transactions: Transaction[] = [],
  years: number = 10
): YearSchedule[] => {
  const schedules: YearSchedule[] = [];
  let accumulatedDep = 0;
  let currentValue = asset.originalCost;
  
  const daysInFirstYear = getDaysUsedInFirstYear(asset.purchaseDate, {
    month: asset.fyStartMonth,
    day: asset.fyStartDay
  });
  
  const totalDaysInYear = 365;
  
  for (let year = 1; year <= years; year++) {
    const openingValue = currentValue;
    const isFirstYear = year === 1;
    
    // Calculate additions and disposals for this year
    let yearAdditions = 0;
    let yearDisposals = 0;
    
    // Multi-shift multiplier
    const multiShiftMultiplier = asset.multiShiftUse === 2 ? 1.5 : asset.multiShiftUse === 3 ? 2 : 1;
    
    let depreciation = 0;
    
    if (asset.depreciationMethod === "SLM") {
      const salvageValue = (asset.originalCost * asset.residualValuePct) / 100;
      const annualDep = (asset.originalCost - salvageValue) / asset.usefulLife;
      
      if (isFirstYear) {
        depreciation = annualDep * (daysInFirstYear / totalDaysInYear) * multiShiftMultiplier;
      } else {
        depreciation = annualDep * multiShiftMultiplier;
      }
    } else {
      // WDV method
      const rate = asset.depreciationRate / 100;
      
      if (isFirstYear) {
        depreciation = openingValue * rate * (daysInFirstYear / totalDaysInYear) * multiShiftMultiplier;
      } else {
        depreciation = openingValue * rate * multiShiftMultiplier;
      }
    }
    
    depreciation = Math.round(depreciation);
    accumulatedDep += depreciation;
    currentValue = openingValue - depreciation;
    
    // Ensure closing value doesn't go below residual value
    const minValue = (asset.originalCost * asset.residualValuePct) / 100;
    currentValue = Math.max(currentValue, minValue);
    
    schedules.push({
      year,
      financialYear: getFinancialYear(year, asset.purchaseDate, {
        month: asset.fyStartMonth,
        day: asset.fyStartDay
      }),
      openingValue: Math.round(openingValue),
      additions: Math.round(yearAdditions),
      disposals: Math.round(yearDisposals),
      depreciation,
      additionalDepreciation: 0,
      accumulatedDepreciation: Math.round(accumulatedDep),
      closingValue: Math.round(currentValue),
    });
    
    if (currentValue <= minValue) break;
  }
  
  return schedules;
};

export const calculateIncomeTaxActSchedule = (
  asset: AssetInput,
  transactions: Transaction[] = [],
  years: number = 10
): YearSchedule[] => {
  const schedules: YearSchedule[] = [];
  let accumulatedDep = 0;
  let currentValue = asset.originalCost;
  
  const daysInFirstYear = getDaysUsedInFirstYear(asset.purchaseDate, {
    month: asset.fyStartMonth,
    day: asset.fyStartDay
  });
  
  const usedLessThan180Days = daysInFirstYear < 180;
  
  for (let year = 1; year <= years; year++) {
    const openingValue = currentValue;
    const isFirstYear = year === 1;
    
    let yearAdditions = 0;
    let yearDisposals = 0;
    
    const blockValue = openingValue + yearAdditions - yearDisposals;
    
    // WDV depreciation
    let rate = asset.depreciationRate / 100;
    
    // Half-year rule for first year
    if (isFirstYear && usedLessThan180Days) {
      rate = rate / 2;
    }
    
    const depreciation = Math.round(blockValue * rate);
    
    // Additional depreciation (20%, or 10% if used < 180 days)
    let additionalDepreciation = 0;
    if (asset.additionalDepreciationEligible && isFirstYear) {
      const additionalRate = usedLessThan180Days ? 0.10 : 0.20;
      additionalDepreciation = Math.round(asset.originalCost * additionalRate);
    }
    
    const totalDepreciation = depreciation + additionalDepreciation;
    accumulatedDep += totalDepreciation;
    currentValue = blockValue - totalDepreciation;
    
    schedules.push({
      year,
      financialYear: getFinancialYear(year, asset.purchaseDate, {
        month: asset.fyStartMonth,
        day: asset.fyStartDay
      }),
      openingValue: Math.round(openingValue),
      additions: Math.round(yearAdditions),
      disposals: Math.round(yearDisposals),
      depreciation,
      additionalDepreciation,
      accumulatedDepreciation: Math.round(accumulatedDep),
      closingValue: Math.round(currentValue),
    });
    
    if (currentValue <= 0) break;
  }
  
  return schedules;
};
