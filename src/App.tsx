import React, { useState, useEffect } from 'react';
import { Banana, Apple, Cherry, Grape, Diamond as Lemon, Tangent as Orange, Cherry as Strawberry, Search as Peach, AlertCircle, Plus, Trash2, Search, SortAsc, Refrigerator, Store, Home, Save, Download, Upload, Filter } from 'lucide-react';

interface Fruit {
  id: string;
  name: string;
  purchaseDate: string;
  daysUntilSpoiled: number;
  icon: React.ReactNode;
  quantity: number;
  location: 'fridge' | 'pantry' | 'counter';
  category: 'berries' | 'citrus' | 'tropical' | 'stone' | 'other';
  price?: number;
  notes?: string;
}

const FRUIT_TYPES = [
  { name: 'Banana', icon: <Banana className="w-6 h-6" />, spoilDays: 5, category: 'tropical' },
  { name: 'Apple', icon: <Apple className="w-6 h-6" />, spoilDays: 14, category: 'other' },
  { name: 'Cherry', icon: <Cherry className="w-6 h-6" />, spoilDays: 7, category: 'stone' },
  { name: 'Grape', icon: <Grape className="w-6 h-6" />, spoilDays: 7, category: 'berries' },
  { name: 'Lemon', icon: <Lemon className="w-6 h-6" />, spoilDays: 21, category: 'citrus' },
  { name: 'Orange', icon: <Orange className="w-6 h-6" />, spoilDays: 14, category: 'citrus' },
  { name: 'Strawberry', icon: <Strawberry className="w-6 h-6" />, spoilDays: 5, category: 'berries' },
  { name: 'Peach', icon: <Peach className="w-6 h-6" />, spoilDays: 5, category: 'stone' },
] as const;

const STORAGE_LOCATIONS = [
  { id: 'fridge', name: 'Refrigerator', icon: <Refrigerator className="w-5 h-5" /> },
  { id: 'pantry', name: 'Pantry', icon: <Store className="w-5 h-5" /> },
  { id: 'counter', name: 'Counter', icon: <Home className="w-5 h-5" /> },
] as const;

const CATEGORIES = [
  { id: 'berries', name: 'Berries' },
  { id: 'citrus', name: 'Citrus' },
  { id: 'tropical', name: 'Tropical' },
  { id: 'stone', name: 'Stone Fruits' },
  { id: 'other', name: 'Other' },
] as const;

function App() {
  const [fruits, setFruits] = useState<Fruit[]>(() => {
    const saved = localStorage.getItem('fruits');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedFruit, setSelectedFruit] = useState(FRUIT_TYPES[0]);
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<'fridge' | 'pantry' | 'counter'>('counter');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'expiry' | 'price'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [customFruitName, setCustomFruitName] = useState('');
  const [customSpoilDays, setCustomSpoilDays] = useState(7);
  const [customCategory, setCustomCategory] = useState<typeof CATEGORIES[number]['id']>('other');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem('fruits', JSON.stringify(fruits));
  }, [fruits]);

  const addFruit = () => {
    const newFruit: Fruit = {
      id: Math.random().toString(36).substr(2, 9),
      name: isAddingCustom ? customFruitName : selectedFruit.name,
      purchaseDate: new Date().toISOString().split('T')[0],
      daysUntilSpoiled: isAddingCustom ? customSpoilDays : selectedFruit.spoilDays,
      icon: isAddingCustom ? <AlertCircle className="w-6 h-6" /> : selectedFruit.icon,
      quantity,
      location,
      category: isAddingCustom ? customCategory : selectedFruit.category,
      price: price || undefined,
      notes: notes.trim() || undefined,
    };
    setFruits([...fruits, newFruit]);
    resetForm();
  };

  const resetForm = () => {
    setQuantity(1);
    setLocation('counter');
    setNotes('');
    setPrice('');
    setCustomFruitName('');
    setCustomSpoilDays(7);
    setCustomCategory('other');
    setIsAddingCustom(false);
  };

  const removeFruit = (id: string) => {
    setFruits(fruits.filter(fruit => fruit.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFruit(id);
    } else {
      setFruits(fruits.map(fruit => 
        fruit.id === id ? { ...fruit, quantity: newQuantity } : fruit
      ));
    }
  };

  const getDaysRemaining = (purchaseDate: string, daysUntilSpoiled: number) => {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const diffTime = Math.ceil((today.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilSpoiled - diffTime;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(fruits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fruit-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedFruits = JSON.parse(e.target?.result as string);
          setFruits(importedFruits);
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getTotalValue = () => {
    return fruits.reduce((sum, fruit) => sum + (fruit.price || 0) * fruit.quantity, 0);
  };

  const getExpiringCount = () => {
    return fruits.filter(fruit => {
      const daysRemaining = getDaysRemaining(fruit.purchaseDate, fruit.daysUntilSpoiled);
      return daysRemaining <= 2 && daysRemaining > 0;
    }).length;
  };

  const filteredAndSortedFruits = fruits
    .filter(fruit => {
      const matchesSearch = fruit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fruit.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || fruit.category === filterCategory;
      const matchesLocation = filterLocation === 'all' || fruit.location === filterLocation;
      const daysRemaining = getDaysRemaining(fruit.purchaseDate, fruit.daysUntilSpoiled);
      const matchesExpired = !showExpiredOnly || daysRemaining <= 0;
      
      return matchesSearch && matchesCategory && matchesLocation && matchesExpired;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      } else if (sortBy === 'price') {
        return ((b.price || 0) * b.quantity) - ((a.price || 0) * a.quantity);
      }
      return getDaysRemaining(a.purchaseDate, a.daysUntilSpoiled) - 
             getDaysRemaining(b.purchaseDate, b.daysUntilSpoiled);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-8 h-8 text-green-600" />
              Fruit Spoiler Tracker
            </h1>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Export Data"
              >
                <Download className="w-5 h-5" />
              </button>
              <label className="p-2 text-gray-600 hover:text-gray-800 cursor-pointer" title="Import Data">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importData}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">Total Items</h3>
              <p className="text-2xl">{fruits.reduce((sum, f) => sum + f.quantity, 0)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">Expiring Soon</h3>
              <p className="text-2xl">{getExpiringCount()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">Total Value</h3>
              <p className="text-2xl">${getTotalValue().toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="flex gap-4 mb-4">
              {isAddingCustom ? (
                <>
                  <input
                    type="text"
                    placeholder="Custom fruit name"
                    className="flex-1 p-2 border rounded-lg"
                    value={customFruitName}
                    onChange={(e) => setCustomFruitName(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Days until spoiled"
                    className="w-32 p-2 border rounded-lg"
                    value={customSpoilDays}
                    onChange={(e) => setCustomSpoilDays(parseInt(e.target.value))}
                    min="1"
                  />
                  <select
                    className="w-40 p-2 border rounded-lg"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as typeof CATEGORIES[number]['id'])}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <select 
                  className="flex-1 p-2 border rounded-lg"
                  value={selectedFruit.name}
                  onChange={(e) => setSelectedFruit(FRUIT_TYPES.find(f => f.name === e.target.value)!)}
                >
                  {FRUIT_TYPES.map((fruit) => (
                    <option key={fruit.name} value={fruit.name}>
                      {fruit.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
              >
                {isAddingCustom ? 'Use Preset Fruit' : 'Add Custom Fruit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-lg"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={location}
                  onChange={(e) => setLocation(e.target.value as 'fridge' | 'pantry' | 'counter')}
                >
                  {STORAGE_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-lg"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                />
              </div>
            </div>

            <button
              onClick={addFruit}
              disabled={isAddingCustom && !customFruitName.trim()}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              <Plus className="w-5 h-5" />
              Add Fruit
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search fruits..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="p-2 border rounded-lg"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'expiry' | 'price')}
            >
              <option value="date">Sort by Date</option>
              <option value="expiry">Sort by Expiry</option>
              <option value="price">Sort by Value</option>
            </select>
            <select
              className="p-2 border rounded-lg"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="p-2 border rounded-lg"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="all">All Locations</option>
              {STORAGE_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowExpiredOnly(!showExpiredOnly)}
              className={`px-4 py-2 rounded-lg border ${
                showExpiredOnly ? 'bg-red-100 border-red-200' : 'bg-white border-gray-200'
              }`}
            >
              Show Expired Only
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedFruits.map((fruit) => {
              const daysRemaining = getDaysRemaining(fruit.purchaseDate, fruit.daysUntilSpoiled);
              const isExpired = daysRemaining <= 0;
              const isWarning = daysRemaining <= 2 && !isExpired;
              const location = STORAGE_LOCATIONS.find(loc => loc.id === fruit.location);
              const category = CATEGORIES.find(cat => cat.id === fruit.category);

              return (
                <div
                  key={fruit.id}
                  className={`p-4 rounded-lg border ${
                    isExpired
                      ? 'bg-red-50 border-red-200'
                      : isWarning
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {fruit.icon}
                      <span className="font-semibold">{fruit.name}</span>
                    </div>
                    <button
                      onClick={() => removeFruit(fruit.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-sm text-gray-600">
                      Purchased: {new Date(fruit.purchaseDate).toLocaleDateString()}
                    </div>
                    {location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        • {location.icon} {location.name}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Category: {category?.name}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => updateQuantity(fruit.id, fruit.quantity - 1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="text-sm">Quantity: {fruit.quantity}</span>
                    <button
                      onClick={() => updateQuantity(fruit.id, fruit.quantity + 1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  {fruit.price && (
                    <div className="text-sm text-gray-600 mb-2">
                      Value: ${(fruit.price * fruit.quantity).toFixed(2)} (${fruit.price.toFixed(2)} each)
                    </div>
                  )}
                  {fruit.notes && (
                    <div className="text-sm text-gray-600 mb-2">
                      Notes: {fruit.notes}
                    </div>
                  )}
                  <div
                    className={`mt-2 font-medium ${
                      isExpired
                        ? 'text-red-600'
                        : isWarning
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {isExpired
                      ? 'Expired!'
                      : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAndSortedFruits.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {searchTerm || filterCategory !== 'all' || filterLocation !== 'all'
                ? 'No fruits found matching your filters.'
                : 'No fruits added yet. Add some fruits to track their freshness!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;