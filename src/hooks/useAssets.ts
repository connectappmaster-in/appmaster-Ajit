import { useState, useEffect } from 'react';
import { Asset, AssetFormData } from '@/types/asset';
import { calculateDepreciation } from '@/lib/depreciation';

const STORAGE_KEY = 'asset-manager-assets';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  // Load assets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAssets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }, []);

  // Save assets to localStorage whenever assets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    } catch (error) {
      console.error('Failed to save assets:', error);
    }
  }, [assets]);

  const addAsset = async (formData: AssetFormData): Promise<Asset> => {
    setLoading(true);
    try {
      const asset: Asset = {
        id: generateId(),
        name: formData.name,
        purchaseDate: formData.purchaseDate,
        capitalizationDate: formData.capitalizationDate,
        purchaseValue: Number(formData.purchaseValue),
        location: formData.location,
        department: formData.department,
        status: formData.status,
        disposalDate: formData.disposalDate || undefined,
        disposalValue: formData.disposalValue ? Number(formData.disposalValue) : undefined,
        categoryName: formData.categoryName,
        usedFor: formData.usedFor,
        usefulLifeYears: formData.usefulLifeYears ? Number(formData.usefulLifeYears) : undefined,
        residualValuePercent: formData.residualValuePercent ? Number(formData.residualValuePercent) : undefined,
        depreciationMethod: formData.depreciationMethod,
        depreciationRatePercent: formData.depreciationRatePercent ? Number(formData.depreciationRatePercent) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAssets(prev => [...prev, asset]);
      return asset;
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async (id: string, formData: AssetFormData): Promise<Asset | null> => {
    setLoading(true);
    try {
      const asset: Asset = {
        id,
        name: formData.name,
        purchaseDate: formData.purchaseDate,
        capitalizationDate: formData.capitalizationDate,
        purchaseValue: Number(formData.purchaseValue),
        location: formData.location,
        department: formData.department,
        status: formData.status,
        disposalDate: formData.disposalDate || undefined,
        disposalValue: formData.disposalValue ? Number(formData.disposalValue) : undefined,
        categoryName: formData.categoryName,
        usedFor: formData.usedFor,
        usefulLifeYears: formData.usefulLifeYears ? Number(formData.usefulLifeYears) : undefined,
        residualValuePercent: formData.residualValuePercent ? Number(formData.residualValuePercent) : undefined,
        depreciationMethod: formData.depreciationMethod,
        depreciationRatePercent: formData.depreciationRatePercent ? Number(formData.depreciationRatePercent) : undefined,
        createdAt: assets.find(a => a.id === id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAssets(prev => prev.map(a => a.id === id ? asset : a));
      return asset;
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      setAssets(prev => prev.filter(a => a.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const getAsset = (id: string): Asset | undefined => {
    return assets.find(asset => asset.id === id);
  };

  const getDepreciationSchedules = (id: string) => {
    const asset = getAsset(id);
    return asset ? calculateDepreciation(asset) : [];
  };

  // Statistics
  const stats = {
    totalAssets: assets.length,
    activeAssets: assets.filter(a => a.status === 'Active').length,
    disposedAssets: assets.filter(a => a.status === 'Disposed').length,
    totalPurchaseValue: assets.reduce((sum, a) => sum + a.purchaseValue, 0),
    totalCurrentWDV: assets.reduce((sum, asset) => {
      const schedules = calculateDepreciation(asset);
      const companiesActSchedule = schedules.find(s => s.type === 'Companies Act');
      return sum + (companiesActSchedule?.currentWDV || asset.purchaseValue);
    }, 0),
  };

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    getAsset,
    getDepreciationSchedules,
    stats,
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}