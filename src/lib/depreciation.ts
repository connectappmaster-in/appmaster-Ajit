import { Asset, DepreciationEntry, DepreciationSchedule } from "@/types/asset";
import { format, getYear, getMonth, getDaysInYear } from "date-fns";

export function calculateDepreciation(asset: Asset): DepreciationSchedule[] {
  const schedules: DepreciationSchedule[] = [];

  if (asset.usedFor.includes('Companies Act') && asset.usefulLifeYears) {
    schedules.push(calculateCompaniesActDepreciation(asset));
  }

  if (asset.usedFor.includes('IT Act') && asset.depreciationRatePercent) {
    schedules.push(calculateITActDepreciation(asset));
  }

  return schedules;
}

function calculateCompaniesActDepreciation(asset: Asset): DepreciationSchedule {
  const entries: DepreciationEntry[] = [];
  const purchaseValue = asset.purchaseValue;
  const usefulLife = asset.usefulLifeYears!;
  const residualPercent = asset.residualValuePercent || 5;
  const residualValue = (purchaseValue * residualPercent) / 100;
  const depreciableValue = purchaseValue - residualValue;
  
  const capitalizationDate = new Date(asset.capitalizationDate);
  const capitalizationYear = getYear(capitalizationDate);
  const capitalizationMonth = getMonth(capitalizationDate);
  
  // Calculate pro-rata for first year
  const monthsInFirstYear = 12 - capitalizationMonth;
  const proRataFactor = monthsInFirstYear / 12;
  
  let currentValue = purchaseValue;
  
  for (let year = 0; year < usefulLife; year++) {
    const actualYear = capitalizationYear + year;
    let depreciation: number;
    
    if (asset.depreciationMethod === 'SLM') {
      // Straight Line Method
      const annualDepreciation = depreciableValue / usefulLife;
      depreciation = year === 0 ? annualDepreciation * proRataFactor : annualDepreciation;
    } else {
      // Written Down Value Method
      const rate = (1 - Math.pow(residualValue / purchaseValue, 1 / usefulLife)) * 100;
      depreciation = (currentValue * rate) / 100;
      if (year === 0) {
        depreciation = depreciation * proRataFactor;
      }
    }
    
    const openingValue = currentValue;
    const closingValue = Math.max(openingValue - depreciation, residualValue);
    depreciation = openingValue - closingValue;
    
    entries.push({
      year: actualYear,
      openingValue,
      depreciation,
      closingValue,
      isProRata: year === 0 && proRataFactor < 1
    });
    
    currentValue = closingValue;
    
    if (closingValue <= residualValue) break;
  }

  const totalDepreciation = entries.reduce((sum, entry) => sum + entry.depreciation, 0);
  
  return {
    type: 'Companies Act',
    entries,
    totalDepreciation,
    currentWDV: currentValue
  };
}

function calculateITActDepreciation(asset: Asset): DepreciationSchedule {
  const entries: DepreciationEntry[] = [];
  const purchaseValue = asset.purchaseValue;
  const rate = asset.depreciationRatePercent! / 100;
  
  const capitalizationDate = new Date(asset.capitalizationDate);
  const capitalizationYear = getYear(capitalizationDate);
  const capitalizationMonth = getMonth(capitalizationDate);
  
  // If purchased on or after 1st October, apply 50% rate in first year
  const isAfterOctober = capitalizationMonth >= 9; // October is month 9 (0-indexed)
  const firstYearRate = isAfterOctober ? rate * 0.5 : rate;
  
  let currentValue = purchaseValue;
  const maxYears = 20; // Reasonable limit for IT Act depreciation
  
  for (let year = 0; year < maxYears && currentValue > 1; year++) {
    const actualYear = capitalizationYear + year;
    const applicableRate = year === 0 ? firstYearRate : rate;
    const depreciation = currentValue * applicableRate;
    
    const openingValue = currentValue;
    const closingValue = Math.max(openingValue - depreciation, 0);
    
    entries.push({
      year: actualYear,
      openingValue,
      depreciation: openingValue - closingValue,
      closingValue,
      isProRata: year === 0 && isAfterOctober
    });
    
    currentValue = closingValue;
  }

  const totalDepreciation = entries.reduce((sum, entry) => sum + entry.depreciation, 0);
  
  return {
    type: 'IT Act',
    entries,
    totalDepreciation,
    currentWDV: currentValue
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}