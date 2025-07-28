import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFilteredData } from "@/hooks/useFilteredData";
import { useCommodityPrices } from "@/hooks/useCommodityPrices";
import { FinancialCard } from "@/components/ui/financial-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Gem, 
  Bitcoin, 
  Home, 
  Plus,
  Edit,
  Trash2,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Asset {
  id: string;
  type: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  total_value: number;
  auto_update: boolean;
}

export default function Assets() {
  const [assets, setAssets] = useState<(Asset & { date: string })[]>([]);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isEditingAsset, setIsEditingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDeletingAsset, setIsDeletingAsset] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const { formatCurrency, currency } = useCurrency();
  const { prices: commodityPrices, loading: pricesLoading } = useCommodityPrices();
  const [newAsset, setNewAsset] = useState({
    type: '',
    quantity: '',
    unit: '',
    price_per_unit: '',
    currency: 'USD',
    total_value: 0,
    auto_update: false,
  });

  const handleAddAsset = async () => {
    const asset = {
      ...newAsset,
      quantity: parseFloat(newAsset.quantity),
      price_per_unit: parseFloat(newAsset.price_per_unit),
      total_value: parseFloat(newAsset.quantity) * parseFloat(newAsset.price_per_unit)
    };
    const { data, error } = await supabase.from('assets').insert([asset]).select();
    if (error) {
      console.error('Error adding asset:', error);
    } else if (data) {
      setAssets([...assets, data[0]]);
      setIsAddingAsset(false);
      setNewAsset({
        type: '',
        quantity: '',
        unit: '',
        price_per_unit: '',
        currency: 'USD',
        total_value: 0,
        auto_update: false,
      });
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      const { data, error } = await supabase.from('assets').select('*');
      if (error) {
        console.error('Error fetching assets:', error);
      } else if (data) {
        const updatedAssets = data.map((asset: Asset & { date: string }) => {
          if (asset.type === 'silver' && asset.auto_update && commodityPrices.silver) {
            return {
              ...asset,
              price_per_unit: commodityPrices.silver,
              total_value: asset.quantity * commodityPrices.silver
            };
          } else if (asset.type === 'gold' && asset.auto_update && commodityPrices.gold) {
            return {
              ...asset,
              price_per_unit: commodityPrices.gold,
              total_value: asset.quantity * commodityPrices.gold
            };
          }
          return asset;
        });
        setAssets(updatedAssets);
      }
    };

    if (!pricesLoading) {
      fetchAssets();
    }
  }, [pricesLoading, commodityPrices]);

  // Filter assets by selected month
  const filteredAssetsByMonth = useFilteredData(assets);

  const totalAssetValue = filteredAssetsByMonth.reduce((sum, asset) => sum + asset.total_value, 0);
  const silverValue = filteredAssetsByMonth.filter(a => a.type === "silver").reduce((sum, a) => sum + a.total_value, 0);
  const cryptoValue = filteredAssetsByMonth.filter(a => a.type === "bitcoin").reduce((sum, a) => sum + a.total_value, 0);
  const realEstateValue = filteredAssetsByMonth.filter(a => a.type === "real_estate").reduce((sum, a) => sum + a.total_value, 0);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "silver":
        return <Gem className="h-5 w-5" />;
      case "bitcoin":
        return <Bitcoin className="h-5 w-5" />;
      case "real_estate":
        return <Home className="h-5 w-5" />;
      default:
        return <Gem className="h-5 w-5" />;
    }
  };

  const formatAssetType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const [editFormData, setEditFormData] = useState({
    type: '',
    quantity: 0,
    unit: '',
    price_per_unit: 0,
    currency: '',
    total_value: 0,
    auto_update: false,
  });

  const handleEditClick = (asset: Asset) => {
    setEditingAsset(asset);
    setEditFormData({
      type: asset.type,
      quantity: asset.quantity,
      unit: asset.unit,
      price_per_unit: asset.price_per_unit,
      currency: asset.currency,
      total_value: asset.total_value,
      auto_update: asset.auto_update,
    });
    setIsEditingAsset(true);
  };

  const handleDeleteClick = (asset: Asset) => {
    setDeletingAsset(asset);
    setIsDeletingAsset(true);
  };

  const handleDelete = async () => {
    if (!deletingAsset) return;
    await supabase.from('assets').delete().match({ id: deletingAsset.id });
    setAssets(assets.filter(asset => asset.id !== deletingAsset.id));
    setIsDeletingAsset(false);
    setDeletingAsset(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAsset) return;

    const payload = {
      ...editFormData,
      quantity: parseFloat(String(editFormData.quantity)),
      price_per_unit: parseFloat(String(editFormData.price_per_unit)),
      total_value:
        parseFloat(String(editFormData.quantity)) *
        parseFloat(String(editFormData.price_per_unit)),
    };

    const { data, error } = await supabase
      .from('assets')
      .update(payload)
      .match({ id: editingAsset.id })
      .select();

    if (error) {
      console.error('Error updating asset:', error);
      return;
    }

    setAssets(assets.map(asset => (asset.id === editingAsset.id ? data[0] : asset)));
    setIsEditingAsset(false);
    setEditingAsset(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Asset Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your non-cash assets like silver, crypto, and real estate
          </p>
        </div>
        
        <Dialog open={isAddingAsset} onOpenChange={setIsAddingAsset}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-financial w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Asset</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Track a new asset in your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select value={newAsset.type} onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" step="0.001" placeholder="0.00" value={newAsset.quantity} onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={newAsset.unit} onValueChange={(value) => setNewAsset({ ...newAsset, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grams">Grams</SelectItem>
                      <SelectItem value="ounces">Ounces</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="shares">Shares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="price-per-unit">Price per Unit</Label>
                <Input id="price-per-unit" type="number" step="0.01" placeholder="0.00" value={newAsset.price_per_unit} onChange={(e) => setNewAsset({ ...newAsset, price_per_unit: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingAsset(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary" onClick={handleAddAsset}>
                  Add Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          variant="asset"
          title="Total Assets"
          value={formatCurrency(totalAssetValue, 'USD')}
          subtitle="All tracked assets"
          icon={<Gem className="h-5 w-5" />}
          trend={{
            value: "+3.7%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="default"
          title="Silver Value"
          value={formatCurrency(silverValue, 'USD')}
          subtitle="Precious metals"
          icon={<Gem className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="default"
          title="Crypto Value" 
          value={formatCurrency(cryptoValue, 'USD')}
          subtitle="Digital assets"
          icon={<Bitcoin className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="default"
          title="Real Estate"
          value={formatCurrency(realEstateValue, 'USD')}
          subtitle="Property value"
          icon={<Home className="h-5 w-5" />}
        />
      </div>

      {/* Asset List */}
      <div className="bg-gradient-card rounded-lg border border-border shadow-card">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Asset Portfolio</h2>
          <p className="text-muted-foreground">Your tracked assets and their current values</p>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid gap-4">
            {filteredAssetsByMonth.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-asset/10 rounded-lg">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{formatAssetType(asset.type)}</CardTitle>
                        <CardDescription className="text-sm">
                          {asset.quantity} {asset.unit} @ {formatCurrency(asset.price_per_unit, asset.currency as 'USD' | 'TRY')}/{asset.unit}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold">{formatCurrency(asset.total_value, asset.currency as 'USD' | 'TRY')}</div>
                        {asset.auto_update && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            Auto-updated
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditClick(asset)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteClick(asset)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the asset.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {editingAsset && (
        <Dialog open={isEditingAsset} onOpenChange={setIsEditingAsset}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>
                Update the details of your asset.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select name="type" value={editFormData.type} onValueChange={(value) => handleInputChange({ target: { name: 'type', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="bitcoin">Bitcoin</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input name="quantity" type="number" step="0.001" value={editFormData.quantity} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select name="unit" value={editFormData.unit} onValueChange={(value) => handleInputChange({ target: { name: 'unit', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="ounces">Ounces</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="shares">Shares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_per_unit">Price per Unit</Label>
                    <Input name="price_per_unit" type="number" step="0.01" value={editFormData.price_per_unit} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select name="currency" value={editFormData.currency} onValueChange={(value) => handleInputChange({ target: { name: 'currency', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="TRY">TRY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditingAsset(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-primary">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}