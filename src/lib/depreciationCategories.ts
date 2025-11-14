// Depreciation categories and rates

export const companiesActCategories = {
  "Buildings (Factory)": { usefulLife: 30, rate: 3.17, method: "SLM" as const },
  "Buildings (Other)": { usefulLife: 60, rate: 1.58, method: "SLM" as const },
  "Plant & Machinery (General)": { usefulLife: 15, rate: 10, method: "WDV" as const },
  "Computers / Servers": { usefulLife: 3, rate: 31.67, method: "WDV" as const },
  "Furniture & Fixtures": { usefulLife: 10, rate: 9.5, method: "WDV" as const },
  "Motor Vehicles": { usefulLife: 8, rate: 11.88, method: "WDV" as const },
  "Office Equipment": { usefulLife: 5, rate: 19, method: "WDV" as const },
};

export const incomeTaxActCategories = {
  "Buildings (Residential)": { usefulLife: 20, rate: 5, method: "WDV" as const },
  "Buildings (Commercial)": { usefulLife: 10, rate: 10, method: "WDV" as const },
  "Furniture & Fittings": { usefulLife: 10, rate: 10, method: "WDV" as const },
  "Plant & Machinery (General)": { usefulLife: 7, rate: 15, method: "WDV" as const },
  "Motor Cars (non-commercial)": { usefulLife: 7, rate: 15, method: "WDV" as const },
  "Computers & Software": { usefulLife: 3, rate: 40, method: "WDV" as const },
  "Books (Professionals)": { usefulLife: 2, rate: 60, method: "WDV" as const },
};

export type ApplicableLaw = "Companies Act" | "Income Tax Act" | "Both";
export type DepreciationMethod = "SLM" | "WDV";

export const getCategories = (law: ApplicableLaw) => {
  if (law === "Companies Act") return companiesActCategories;
  if (law === "Income Tax Act") return incomeTaxActCategories;
  return { ...companiesActCategories, ...incomeTaxActCategories };
};
