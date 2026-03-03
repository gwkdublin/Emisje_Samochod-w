import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Car, Zap, Settings, Upload, Plus, Trash2, Info, AlertCircle, ChevronDown, ChevronUp, Activity, Flame
} from 'lucide-react';

// --- DANE DOMYŚLNE I SŁOWNIKI ---

const defaultEnergySources = [
  { id: 'hard_coal', name: 'Węgiel kamienny', factor: 820, color: '#374151' },
  { id: 'lignite', name: 'Węgiel brunatny', factor: 1050, color: '#78350f' },
  { id: 'natural_gas', name: 'Gaz ziemny', factor: 490, color: '#60a5fa' },
  { id: 'biomass', name: 'Biomasa', factor: 230, color: '#4ade80' },
  { id: 'biogas', name: 'Biogaz', factor: 50, color: '#22c55e' },
  { id: 'nuclear', name: 'Energetyka jądrowa', factor: 12, color: '#facc15' },
  { id: 'wind_onshore', name: 'Wiatr (Ląd)', factor: 11, color: '#0ea5e9' },
  { id: 'wind_offshore', name: 'Wiatr (Morze)', factor: 12, color: '#0284c7' },
  { id: 'solar', name: 'Słońce (PV)', factor: 45, color: '#fbbf24' },
  { id: 'hydro', name: 'Woda', factor: 24, color: '#3b82f6' },
  { id: 'other', name: 'Inne (np. olej, szczytowo-pompowe)', factor: 300, color: '#9ca3af' }
];

const defaultCars = [
  { id: '1', name: 'Kompaktowy ICE (Benzyna)', type: 'ICE', prodEmissions: 5500, batteryCap: 0, batteryProdFactor: 0, consumptionWltp: 5.5, consumptionActual: 6.5, winterIncreasePercent: 15, fuelType: 'gasoline', electricShare: 0, evConsumptionWltp: 0, evConsumptionActual: 0, batteryReplacementMileage: 0 },
  { id: '2', name: 'Kompaktowy EV (50 kWh)', type: 'EV', prodEmissions: 6000, batteryCap: 50, batteryProdFactor: 100, consumptionWltp: 14.5, consumptionActual: 16.5, winterIncreasePercent: 25, fuelType: 'electricity', electricShare: 100, evConsumptionWltp: 0, evConsumptionActual: 0, batteryReplacementMileage: 250000 },
  { id: '3', name: 'Duży SUV EV (90 kWh)', type: 'EV', prodEmissions: 8000, batteryCap: 90, batteryProdFactor: 100, consumptionWltp: 19.0, consumptionActual: 22.0, winterIncreasePercent: 25, fuelType: 'electricity', electricShare: 100, evConsumptionWltp: 0, evConsumptionActual: 0, batteryReplacementMileage: 300000 },
  { id: '4', name: 'Hybryda PHEV (Kompakt)', type: 'Hybrid', prodEmissions: 6000, batteryCap: 12, batteryProdFactor: 100, consumptionWltp: 1.5, consumptionActual: 4.5, winterIncreasePercent: 15, fuelType: 'gasoline', electricShare: 40, evConsumptionWltp: 15.0, evConsumptionActual: 18.0, batteryReplacementMileage: 0 }
];

const defaultScenarios = [
  {
    id: 'wem_kpeik',
    name: 'Scenariusz WEM (KPEiK)',
    years: [
      {
        year: 2025,
        profiles: {
          average: { hard_coal: 38, lignite: 22, natural_gas: 9, wind_onshore: 14, solar: 12, hydro: 1, biomass: 3, wind_offshore: 0, nuclear: 0, biogas: 1, other: 0 },
          day: { hard_coal: 30, lignite: 20, natural_gas: 8, wind_onshore: 10, solar: 25, hydro: 1, biomass: 5, wind_offshore: 0, nuclear: 0, biogas: 1, other: 0 },
          night: { hard_coal: 45, lignite: 25, natural_gas: 10, wind_onshore: 18, solar: 0, hydro: 1, biomass: 1, wind_offshore: 0, nuclear: 0, biogas: 0, other: 0 }
        }
      },
      {
        year: 2030,
        profiles: {
          average: { hard_coal: 20, lignite: 15, natural_gas: 12, wind_onshore: 18, wind_offshore: 10, solar: 18, hydro: 1, biomass: 5, nuclear: 0, biogas: 1, other: 0 },
          day: { hard_coal: 15, lignite: 15, natural_gas: 10, wind_onshore: 15, wind_offshore: 10, solar: 28, hydro: 1, biomass: 5, nuclear: 0, biogas: 1, other: 0 },
          night: { hard_coal: 25, lignite: 15, natural_gas: 15, wind_onshore: 22, wind_offshore: 10, solar: 0, hydro: 1, biomass: 10, nuclear: 0, biogas: 2, other: 0 }
        }
      },
      {
        year: 2040,
        profiles: {
          average: { hard_coal: 0, lignite: 0, natural_gas: 5, nuclear: 20, wind_onshore: 25, wind_offshore: 20, solar: 20, hydro: 2, biomass: 5, biogas: 3, other: 0 },
          day: { hard_coal: 0, lignite: 0, natural_gas: 5, nuclear: 20, wind_onshore: 20, wind_offshore: 20, solar: 30, hydro: 2, biomass: 2, biogas: 1, other: 0 },
          night: { hard_coal: 0, lignite: 0, natural_gas: 5, nuclear: 20, wind_onshore: 30, wind_offshore: 20, solar: 0, hydro: 2, biomass: 15, biogas: 8, other: 0 }
        }
      }
    ]
  }
];

const defaultFuels = {
  gasoline: 2.8,
  diesel: 3.2
};

export default function App() {
  // --- STANY APLIKACJI ---
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Stany Dashboardu
  const [cars, setCars] = useState(defaultCars);
  const [selectedCarIds, setSelectedCarIds] = useState(['1', '2', '3', '4']);
  const [lifespan, setLifespan] = useState(15);
  const [baseYear, setBaseYear] = useState(2025);
  const [globalMileage, setGlobalMileage] = useState(15000);
  const [winterMonths, setWinterMonths] = useState(4); // Nowy parametr: Miesiące zimowe
  
  // Stany Scenariuszy i Miksu
  const [scenarios, setScenarios] = useState(defaultScenarios);
  const [activeScenarioId, setActiveScenarioId] = useState(defaultScenarios[0].id);
  const [chargingProfile, setChargingProfile] = useState('average');
  const [fuels, setFuels] = useState(defaultFuels);
  
  // Stany Intensywności Źródeł (Edytowalne z nowej zakładki)
  const [energySources, setEnergySources] = useState(defaultEnergySources);

  // Stany widoku edycji (Zakładka Miks)
  const [editingScenarioId, setEditingScenarioId] = useState(defaultScenarios[0].id);
  const [expandedYear, setExpandedYear] = useState(null);

  // Stany dla formularzy aut
  const [newCar, setNewCar] = useState({ 
    name: '', type: 'EV', prodEmissions: 6000, batteryCap: 0, batteryProdFactor: 100, 
    consumptionWltp: 14.5, consumptionActual: 16.5, winterIncreasePercent: 20, fuelType: 'electricity', 
    electricShare: 100, evConsumptionWltp: 14.5, evConsumptionActual: 16.5, batteryReplacementMileage: 0 
  });
  const [csvError, setCsvError] = useState('');

  // Stan dla własnego modala
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null, inputValue: '', inputType: 'text' });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // --- LOGIKA BIZNESOWA (MIKS ENERGETYCZNY) ---

  const calculateEmissionFactor = (profile) => {
    if (!profile) return 0;
    let totalEmission = 0;
    let totalPercent = 0;
    
    energySources.forEach(source => {
      const percent = profile[source.id] || 0;
      totalEmission += (percent / 100) * source.factor;
      totalPercent += percent;
    });

    return totalPercent > 0 ? (totalEmission / (totalPercent / 100)) : 0;
  };

  const getSumaProcentow = (profile: any) => {
    if (!profile) return 0;
    return Object.values(profile).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  };

  const getGridFactorForYear = (targetYear, scenarioId, profileType) => {
    const scenario = scenarios.find(s => s.id === scenarioId) || scenarios[0];
    const sortedYears = [...scenario.years].sort((a, b) => a.year - b.year);
    if (sortedYears.length === 0) return 0;

    const getFactor = (yearData) => calculateEmissionFactor(yearData.profiles[profileType] || yearData.profiles.average);

    if (targetYear <= sortedYears[0].year) return getFactor(sortedYears[0]);
    if (targetYear >= sortedYears[sortedYears.length - 1].year) return getFactor(sortedYears[sortedYears.length - 1]);

    for (let i = 0; i < sortedYears.length - 1; i++) {
      if (targetYear >= sortedYears[i].year && targetYear <= sortedYears[i + 1].year) {
        const y1 = getFactor(sortedYears[i]);
        const y2 = getFactor(sortedYears[i + 1]);
        const x1 = sortedYears[i].year;
        const x2 = sortedYears[i + 1].year;
        return y1 + ((targetYear - x1) / (x2 - x1)) * (y2 - y1);
      }
    }
    return 0;
  };

  // --- GENEROWANIE DANYCH DO WYKRESU LCA ---
  const chartData = useMemo(() => {
    const data = [];
    const activeCars = cars.filter(c => selectedCarIds.includes(c.id));
    
    const winterRatio = winterMonths / 12;
    const getEffectiveConsumption = (actual, winterIncrease) => {
      return actual * (1 + (winterIncrease / 100) * winterRatio);
    };

    for (let year = 0; year <= lifespan; year++) {
      const currentCalendarYear = baseYear + year;
      const dataPoint = { 
        name: year === 0 ? 'Start' : `Rok ${year}`, 
        calendarYear: currentCalendarYear,
        gridFactor: getGridFactorForYear(currentCalendarYear, activeScenarioId, chargingProfile)
      };

      activeCars.forEach(car => {
        const initialEmissions = car.prodEmissions + (car.batteryCap * car.batteryProdFactor);
        
        if (year === 0) {
          dataPoint[car.name] = initialEmissions;
        } else {
          let previousTotal = data[year - 1][car.name];
          let yearlyEmissions = 0;
          const distanceInHundreds = globalMileage / 100;

          if (car.type === 'ICE') {
            const fuelEmissionFactor = car.fuelType === 'gasoline' ? fuels.gasoline : fuels.diesel;
            const effectiveCons = getEffectiveConsumption(car.consumptionActual, car.winterIncreasePercent);
            yearlyEmissions = distanceInHundreds * effectiveCons * fuelEmissionFactor;
          } 
          else if (car.type === 'EV') {
            const gridKgPerKwh = getGridFactorForYear(currentCalendarYear, activeScenarioId, chargingProfile) / 1000;
            const effectiveCons = getEffectiveConsumption(car.consumptionActual, car.winterIncreasePercent);
            yearlyEmissions = distanceInHundreds * effectiveCons * gridKgPerKwh;
          }
          else if (car.type === 'Hybrid') {
            const fuelEmissionFactor = car.fuelType === 'gasoline' ? fuels.gasoline : fuels.diesel;
            const gridKgPerKwh = getGridFactorForYear(currentCalendarYear, activeScenarioId, chargingProfile) / 1000;
            
            const evShareRatio = car.electricShare / 100;
            const iceShareRatio = 1 - evShareRatio;

            const effectiveEvCons = getEffectiveConsumption(car.evConsumptionActual || 18, car.winterIncreasePercent);
            const effectiveIceCons = getEffectiveConsumption(car.consumptionActual, car.winterIncreasePercent);

            const evEmissions = (distanceInHundreds * evShareRatio) * effectiveEvCons * gridKgPerKwh;
            const iceEmissions = (distanceInHundreds * iceShareRatio) * effectiveIceCons * fuelEmissionFactor;
            
            yearlyEmissions = evEmissions + iceEmissions;
          }

          let batteryReplacementEmissions = 0;
          if (car.type !== 'ICE' && car.batteryReplacementMileage && car.batteryReplacementMileage > 0) {
            const currentMileage = year * globalMileage;
            const previousMileage = (year - 1) * globalMileage;
            const currentReplacements = Math.floor(currentMileage / car.batteryReplacementMileage);
            const previousReplacements = Math.floor(previousMileage / car.batteryReplacementMileage);
            if (currentReplacements > previousReplacements) {
              batteryReplacementEmissions = (currentReplacements - previousReplacements) * (car.batteryCap * car.batteryProdFactor);
            }
          }

          dataPoint[car.name] = previousTotal + yearlyEmissions + batteryReplacementEmissions;
        }
      });
      data.push(dataPoint);
    }
    return data;
  }, [cars, selectedCarIds, lifespan, baseYear, scenarios, activeScenarioId, chargingProfile, fuels, globalMileage, winterMonths, energySources]);

  // --- HANDLERY (SCENARIUSZE I ŹRÓDŁA) ---
  
  const handleUpdateMixValue = (year, profileType, sourceId, value) => {
    setScenarios(prev => prev.map(s => {
      if (s.id !== editingScenarioId) return s;
      return {
        ...s,
        years: s.years.map(y => {
          if (y.year !== year) return y;
          return {
            ...y,
            profiles: {
              ...y.profiles,
              [profileType]: { ...y.profiles[profileType], [sourceId]: Number(value) }
            }
          };
        })
      };
    }));
  };

  const handleUpdateEnergySourceFactor = (id, newFactor) => {
    setEnergySources(prev => prev.map(src => src.id === id ? { ...src, factor: Number(newFactor) } : src));
  };

  const handleAddYearToScenario = () => {
    setModal({
      isOpen: true, type: 'prompt', inputType: 'number', title: 'Dodaj nowy rok', message: 'Podaj rok (np. 2035):', inputValue: '2035',
      onConfirm: (val) => {
        const newYear = parseInt(val);
        if (!newYear || isNaN(newYear)) return;
        
        const currentScenario = scenarios.find(s => s.id === editingScenarioId);
        if (currentScenario && currentScenario.years.find(y => y.year === newYear)) {
          setTimeout(() => setModal({ isOpen: true, type: 'alert', title: 'Błąd', message: 'Ten rok już istnieje w scenariuszu!' }), 300);
          return;
        }
        
        setScenarios(prev => prev.map(s => {
          if (s.id !== editingScenarioId) return s;
          const prevYear = [...s.years].sort((a,b) => b.year - a.year).find(y => y.year < newYear) || s.years[0];
          const emptyProfile = {};
          energySources.forEach(src => emptyProfile[src.id] = 0);
          const newYearObj = {
            year: newYear,
            profiles: prevYear ? JSON.parse(JSON.stringify(prevYear.profiles)) : { average: {...emptyProfile}, day: {...emptyProfile}, night: {...emptyProfile} }
          };
          return { ...s, years: [...s.years, newYearObj].sort((a,b) => a.year - b.year) };
        }));
        setExpandedYear(newYear);
      }
    });
  };

  const handleAddScenario = () => {
    setModal({
      isOpen: true, type: 'prompt', inputType: 'text', title: 'Nowy scenariusz', message: 'Podaj nazwę nowego scenariusza:', inputValue: 'Mój nowy scenariusz',
      onConfirm: (name) => {
        if (!name.trim()) return;
        const newId = `scen_${Date.now()}`;
        const emptyProfile = {};
        energySources.forEach(src => emptyProfile[src.id] = 0);
        const newScenario = {
          id: newId, name: name.trim(),
          years: [ { year: 2025, profiles: { average: {...emptyProfile}, day: {...emptyProfile}, night: {...emptyProfile} } } ]
        };
        setScenarios([...scenarios, newScenario]);
        setEditingScenarioId(newId);
        setExpandedYear(2025);
      }
    });
  };

  const handleDeleteYear = (year) => {
    setModal({
      isOpen: true, type: 'confirm', title: 'Usuwanie', message: `Czy na pewno usunąć rok ${year}?`,
      onConfirm: () => {
        setScenarios(prev => prev.map(s => {
          if (s.id !== editingScenarioId) return s;
          return { ...s, years: s.years.filter(y => y.year !== year) };
        }));
      }
    });
  };

  // --- POZOSTAŁE HANDLERY (AUTA, CSV) ---
  const handleToggleCarSelection = (id) => {
    if (selectedCarIds.includes(id)) {
      setSelectedCarIds(prev => prev.filter(carId => carId !== id));
    } else {
      if (selectedCarIds.length >= 50) {
        setModal({ isOpen: true, type: 'alert', title: 'Limit', message: 'Można porównywać maksymalnie 50 pojazdów naraz.' });
        return;
      }
      setSelectedCarIds(prev => [...prev, id]);
    }
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    const newId = Date.now().toString();
    setCars([...cars, { ...newCar, id: newId }]);
    setSelectedCarIds([...selectedCarIds, newId]);
    setNewCar({ ...newCar, name: '' });
  };

  const handleDeleteCar = (id) => {
    setCars(cars.filter(c => c.id !== id));
    setSelectedCarIds(selectedCarIds.filter(cId => cId !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') return;
        const text = result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error("Plik jest pusty lub brakuje danych.");
        const newCarsFromCsv = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,;]/);
          if (cols.length < 13) continue;
          newCarsFromCsv.push({
            id: `csv-${Date.now()}-${i}`,
            name: cols[0].trim(),
            type: cols[1].trim(),
            prodEmissions: parseFloat(cols[2]) || 0,
            batteryCap: parseFloat(cols[3]) || 0,
            batteryProdFactor: parseFloat(cols[4]) || 0,
            consumptionWltp: parseFloat(cols[5]) || 0,
            consumptionActual: parseFloat(cols[6]) || 0,
            winterIncreasePercent: parseFloat(cols[7]) || 0,
            fuelType: cols[8].trim().toLowerCase() || 'gasoline',
            electricShare: cols[9] ? parseFloat(cols[9]) : (cols[1].trim() === 'EV' ? 100 : 0),
            evConsumptionWltp: cols[10] ? parseFloat(cols[10]) : 0,
            evConsumptionActual: cols[11] ? parseFloat(cols[11]) : 0,
            batteryReplacementMileage: cols[12] ? parseFloat(cols[12]) : 0,
          });
        }
        setCars([...cars, ...newCarsFromCsv]);
        setCsvError('');
        setModal({ isOpen: true, type: 'alert', title: 'Sukces', message: `Zaimportowano ${newCarsFromCsv.length} pojazdów.` });
      } catch (err) {
        setCsvError("Błąd parsowania pliku CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // --- KOMPONENTY WIDOKÓW ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Scenariusz energetyczny</label>
            <select value={activeScenarioId} onChange={e => setActiveScenarioId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-800 outline-none">
              {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Profil ładowania EV</label>
            <select value={chargingProfile} onChange={e => setChargingProfile(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-800 outline-none">
              <option value="average">Zawsze / Miks Średni</option>
              <option value="day">Tylko w Dzień (Fotowoltaika)</option>
              <option value="night">Tylko w Nocy (Baza / Wiatr)</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 pl-0 md:pl-6 w-full md:w-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cykl życia: {lifespan} lat</label>
            <input type="range" min="1" max="30" value={lifespan} onChange={(e) => setLifespan(parseInt(e.target.value))} className="w-24 md:w-32 accent-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Przebieg: {globalMileage.toLocaleString()} km</label>
            <input type="range" min="1000" max="100000" step="1000" value={globalMileage} onChange={(e) => setGlobalMileage(parseInt(e.target.value))} className="w-24 md:w-32 accent-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-blue-600">Miesiące zimowe: {winterMonths}</label>
            <input type="range" min="0" max="12" step="1" value={winterMonths} onChange={(e) => setWinterMonths(parseInt(e.target.value))} className="w-24 md:w-32 accent-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Skumulowane Emisje CO₂e (kg)</h2>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickMargin={10} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `${(val/1000).toFixed(0)}t`} />
              <Tooltip 
                formatter={(value) => [`${Math.round(value).toLocaleString()} kg`, '']}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    const year = payload[0].payload.calendarYear;
                    const factor = Math.round(payload[0].payload.gridFactor);
                    return `${label} (${year}) - Sieć: ${factor} g/kWh`;
                  }
                  return label;
                }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {cars.filter(c => selectedCarIds.includes(c.id)).map((car) => {
                let color = '#ef4444'; 
                if (car.type === 'EV') color = '#10b981';
                else if (car.type === 'Hybrid') color = '#3b82f6';
                return (
                  <Line key={car.id} type="monotone" dataKey={car.name} stroke={color} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Porównywane pojazdy ({selectedCarIds.length}/50)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {cars.map(car => (
            <div key={car.id} onClick={() => handleToggleCarSelection(car.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center space-x-3
                ${selectedCarIds.includes(car.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
            >
              <div className={`w-3 h-3 rounded-full ${car.type === 'EV' ? 'bg-emerald-500' : car.type === 'ICE' ? 'bg-red-500' : 'bg-blue-500'}`} />
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-gray-800 text-sm truncate">{car.name}</p>
                <p className="text-xs text-gray-500">{car.type}</p>
              </div>
              <input type="checkbox" checked={selectedCarIds.includes(car.id)} readOnly className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVehiclesList = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-blue-900 flex items-center"><Upload className="w-5 h-5 mr-2" /> Import z pliku (CSV)</h3>
          <p className="text-sm text-blue-700 mt-1">Wgraj plik CSV. Oczekiwane kolumny:</p>
          <code className="text-xs mt-1 block bg-blue-100 p-2 rounded text-blue-800">name, type, prodEmissions, batteryCap, batteryProdFactor, consumptionWltp, consumptionActual, winterIncreasePercent, fuelType, electricShare, evConsumptionWltp, evConsumptionActual, batteryReplacementMileage</code>
          {csvError && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {csvError}</p>}
        </div>
        <label className="mt-4 sm:mt-0 bg-white border-2 border-blue-500 text-blue-600 px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-blue-50 transition-colors inline-block">
          Wybierz plik .csv
          <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Plus className="w-5 h-5 mr-2" /> Dodaj nowy pojazd</h3>
        <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa pojazdu</label>
            <input required type="text" value={newCar.name} onChange={e => setNewCar({...newCar, name: e.target.value})} className="w-full p-2 border rounded-md outline-none" placeholder="np. Toyota bZ4X" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ napędu</label>
            <select value={newCar.type} onChange={e => setNewCar({...newCar, type: e.target.value})} className="w-full p-2 border rounded-md outline-none">
              <option value="EV">Elektryczny (EV)</option>
              <option value="ICE">Spalinowy (ICE)</option>
              <option value="Hybrid">Hybrydowy (PHEV/HEV)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prod. platformy (kg CO2e)</label>
            <input required type="number" value={newCar.prodEmissions} onChange={e => setNewCar({...newCar, prodEmissions: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
          </div>
          
          {newCar.type !== 'ICE' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bateria (kWh)</label>
                <input required type="number" value={newCar.batteryCap} onChange={e => setNewCar({...newCar, batteryCap: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emisja bat. (kg/kWh)</label>
                <input required type="number" value={newCar.batteryProdFactor} onChange={e => setNewCar({...newCar, batteryProdFactor: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Wymiana bat. po (km, 0=brak)</label>
                <input required type="number" min="0" step="1000" value={newCar.batteryReplacementMileage} onChange={e => setNewCar({...newCar, batteryReplacementMileage: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zużycie WLTP (L / kWh)</label>
            <input required type="number" step="0.1" value={newCar.consumptionWltp} onChange={e => setNewCar({...newCar, consumptionWltp: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-blue-800 font-semibold">Zużycie Faktyczne</label>
            <input required type="number" step="0.1" value={newCar.consumptionActual} onChange={e => setNewCar({...newCar, consumptionActual: Number(e.target.value)})} className="w-full p-2 border-2 border-blue-200 rounded-md bg-blue-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-indigo-800 font-semibold">Wzrost zimą (%)</label>
            <input required type="number" step="0.1" value={newCar.winterIncreasePercent} onChange={e => setNewCar({...newCar, winterIncreasePercent: Number(e.target.value)})} className="w-full p-2 border-2 border-indigo-200 rounded-md bg-indigo-50" />
          </div>

          {(newCar.type === 'ICE' || newCar.type === 'Hybrid') ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ paliwa ICE</label>
              <select value={newCar.fuelType} onChange={e => setNewCar({...newCar, fuelType: e.target.value})} className="w-full p-2 border rounded-md outline-none">
                <option value="gasoline">Benzyna</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>
          ) : (
            <div></div> /* Spacer */
          )}

          {newCar.type === 'Hybrid' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Udział EV (%)</label>
                <input required type="number" min="0" max="100" value={newCar.electricShare} onChange={e => setNewCar({...newCar, electricShare: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zużycie EV WLTP (kWh)</label>
                <input required type="number" step="0.1" value={newCar.evConsumptionWltp} onChange={e => setNewCar({...newCar, evConsumptionWltp: Number(e.target.value)})} className="w-full p-2 border rounded-md" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-blue-800 font-semibold">Zużycie EV Faktyczne</label>
                <input required type="number" step="0.1" value={newCar.evConsumptionActual} onChange={e => setNewCar({...newCar, evConsumptionActual: Number(e.target.value)})} className="w-full p-2 border-2 border-blue-200 rounded-md bg-blue-50" />
              </div>
            </>
          )}

          <div className="col-span-1 md:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium">Dodaj Pojazd</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Nazwa</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Bateria</th>
                <th className="px-4 py-3">Z. WLTP</th>
                <th className="px-4 py-3">Z. Fakt. (+ Zima %)</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, idx) => (
                <tr key={car.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{car.name}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${car.type==='EV'?'bg-emerald-100 text-emerald-800':car.type==='ICE'?'bg-red-100 text-red-800':'bg-blue-100 text-blue-800'}`}>{car.type}</span></td>
                  <td className="px-4 py-3">{car.type !== 'ICE' ? `${car.batteryCap} kWh` : '-'}</td>
                  <td className="px-4 py-3">{car.consumptionWltp}</td>
                  <td className="px-4 py-3 font-semibold text-blue-900">{car.consumptionActual} <span className="text-xs text-gray-400 font-normal ml-1">(+{car.winterIncreasePercent}%)</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteCar(car.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEnergyMix = () => {
    const activeEditingScenario = scenarios.find(s => s.id === editingScenarioId) || scenarios[0];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-emerald-600"/> Scenariusze</h3>
              <div className="space-y-2 mb-4">
                {scenarios.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => { setEditingScenarioId(s.id); setExpandedYear(s.years[0]?.year); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors border
                      ${editingScenarioId === s.id ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <button onClick={handleAddScenario} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center">
                <Plus className="w-4 h-4 mr-1"/> Dodaj scenariusz
              </button>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Flame className="w-5 h-5 text-gray-500 mr-2" /> Emisyjność Paliw</h3>
              <p className="text-xs text-gray-500 mb-4">Wartości Well-to-Wheel (kg CO₂e / litr).</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benzyna (Gasoline)</label>
                  <input type="number" step="0.1" value={fuels.gasoline} onChange={e => setFuels({...fuels, gasoline: Number(e.target.value)})} className="w-full p-2 border rounded-md outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diesel</label>
                  <input type="number" step="0.1" value={fuels.diesel} onChange={e => setFuels({...fuels, diesel: Number(e.target.value)})} className="w-full p-2 border rounded-md outline-none text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center"><Zap className="w-6 h-6 text-yellow-500 mr-2" /> Edycja: {activeEditingScenario.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Zdefiniuj udział źródeł produkcji w poszczególnych latach (w %). Wartości interpolują się automatycznie.</p>
                </div>
                <button onClick={handleAddYearToScenario} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                  <Plus className="w-4 h-4 mr-1"/> Dodaj rok
                </button>
              </div>

              <div className="space-y-4">
                {[...activeEditingScenario.years].sort((a,b)=>a.year - b.year).map((yearData) => {
                  const isExpanded = expandedYear === yearData.year;
                  const factorAvg = Math.round(calculateEmissionFactor(yearData.profiles.average));
                  const factorDay = Math.round(calculateEmissionFactor(yearData.profiles.day));
                  const factorNight = Math.round(calculateEmissionFactor(yearData.profiles.night));
                  
                  return (
                    <div key={yearData.year} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        onClick={() => setExpandedYear(isExpanded ? null : yearData.year)}
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-emerald-50 border-b border-gray-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center">
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500 mr-2" /> : <ChevronDown className="w-5 h-5 text-gray-500 mr-2" />}
                          <h3 className="text-lg font-bold text-gray-800">Rok {yearData.year}</h3>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="text-gray-600 hidden md:inline">Średnio: <strong className={factorAvg < 200 ? 'text-emerald-600' : ''}>{factorAvg} g/kWh</strong></span>
                          <span className="text-gray-600 hidden md:inline">Dzień: <strong className={factorDay < 200 ? 'text-emerald-600' : ''}>{factorDay} g/kWh</strong></span>
                          <span className="text-gray-600 hidden md:inline">Noc: <strong className={factorNight < 200 ? 'text-emerald-600' : ''}>{factorNight} g/kWh</strong></span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteYear(yearData.year); }} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="border-b-2 border-gray-200">
                                <th className="pb-2 font-medium text-gray-700">Źródło energii</th>
                                <th className="pb-2 font-medium text-gray-700 text-center w-24">Emisja (LCA)<br/><span className="text-xs text-gray-400 font-normal">gCO₂e/kWh</span></th>
                                <th className="pb-2 font-semibold text-gray-900 text-center w-28 bg-gray-50 rounded-t-lg">Miks Średni (%)</th>
                                <th className="pb-2 font-semibold text-yellow-600 text-center w-28 bg-yellow-50 rounded-t-lg">W dzień (%)</th>
                                <th className="pb-2 font-semibold text-indigo-600 text-center w-28 bg-indigo-50 rounded-t-lg">W nocy (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {energySources.map(source => (
                                <tr key={source.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-2 flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: source.color}}></div>
                                    {source.name}
                                  </td>
                                  <td className="py-2 text-center text-gray-500">{source.factor}</td>
                                  <td className="py-1 px-1 bg-gray-50">
                                    <input type="number" min="0" max="100" value={yearData.profiles.average[source.id] || ''} onChange={(e) => handleUpdateMixValue(yearData.year, 'average', source.id, e.target.value)} className="w-full p-1.5 border rounded text-center text-sm outline-none focus:border-gray-500" />
                                  </td>
                                  <td className="py-1 px-1 bg-yellow-50">
                                    <input type="number" min="0" max="100" value={yearData.profiles.day[source.id] || ''} onChange={(e) => handleUpdateMixValue(yearData.year, 'day', source.id, e.target.value)} className="w-full p-1.5 border border-yellow-200 rounded text-center text-sm outline-none focus:border-yellow-500 bg-white" />
                                  </td>
                                  <td className="py-1 px-1 bg-indigo-50">
                                    <input type="number" min="0" max="100" value={yearData.profiles.night[source.id] || ''} onChange={(e) => handleUpdateMixValue(yearData.year, 'night', source.id, e.target.value)} className="w-full p-1.5 border border-indigo-200 rounded text-center text-sm outline-none focus:border-indigo-500 bg-white" />
                                  </td>
                                </tr>
                              ))}
                              
                              <tr className="font-bold bg-gray-50">
                                <td colSpan="2" className="py-3 text-right pr-4 text-gray-700">Suma (%):</td>
                                <td className={`py-3 text-center ${getSumaProcentow(yearData.profiles.average) !== 100 ? 'text-red-500' : 'text-emerald-600'}`}>{getSumaProcentow(yearData.profiles.average)}%</td>
                                <td className={`py-3 text-center ${getSumaProcentow(yearData.profiles.day) !== 100 ? 'text-red-500' : 'text-emerald-600'}`}>{getSumaProcentow(yearData.profiles.day)}%</td>
                                <td className={`py-3 text-center ${getSumaProcentow(yearData.profiles.night) !== 100 ? 'text-red-500' : 'text-emerald-600'}`}>{getSumaProcentow(yearData.profiles.night)}%</td>
                              </tr>
                              <tr>
                                <td colSpan="2" className="py-3 text-right pr-4 text-sm font-bold text-gray-800">Obliczona Emisyjność (g CO₂e/kWh):</td>
                                <td className="py-3 text-center font-bold text-gray-800 bg-gray-100 rounded-b-lg">{factorAvg}</td>
                                <td className="py-3 text-center font-bold text-yellow-800 bg-yellow-100 rounded-b-lg">{factorDay}</td>
                                <td className="py-3 text-center font-bold text-indigo-800 bg-indigo-100 rounded-b-lg">{factorNight}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEnergySources = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-gray-500 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Intensywność emisyjna źródeł energii</h2>
            <p className="text-sm text-gray-500 mt-1">Zdefiniuj ślad węglowy (LCA) dla każdego źródła energii elektrycznej. Wartości podawane w g CO₂e/kWh.</p>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3">Źródło energii</th>
                <th className="px-4 py-3 w-48 text-right">Wskaźnik (g CO₂e/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {energySources.map((source, idx) => (
                <tr key={source.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 flex items-center font-medium text-gray-800">
                    <div className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{backgroundColor: source.color}}></div>
                    {source.name}
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      min="0"
                      value={source.factor}
                      onChange={(e) => handleUpdateEnergySourceFactor(source.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-right focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-gray-700"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg flex items-start border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Modyfikacja tych parametrów globalnie wpływa na wszystkie scenariusze miksu energetycznego. Zmiany są uwzględniane w czasie rzeczywistym na wykresach LCA dla pojazdów wykorzystujących energię elektryczną.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-emerald-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">EV vs ICE <span className="text-emerald-600">LCA Dashboard</span></h1>
            </div>
          </div>
          <div className="flex space-x-8 mt-2 overflow-x-auto">
            <button onClick={() => setActiveTab('dashboard')} className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Wykresy i Analiza
            </button>
            <button onClick={() => setActiveTab('vehicles')} className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'vehicles' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Baza Pojazdów
            </button>
            <button onClick={() => setActiveTab('energy')} className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'energy' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Miks energetyczny - scenariusze
            </button>
            <button onClick={() => setActiveTab('sources')} className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'sources' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Intensywność emisyjna źródeł
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'vehicles' && renderVehiclesList()}
        {activeTab === 'energy' && renderEnergyMix()}
        {activeTab === 'sources' && renderEnergySources()}
      </main>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-gray-800">{modal.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{modal.message}</p>
            {modal.type === 'prompt' && (
              <input
                type={modal.inputType} value={modal.inputValue} onChange={e => setModal({...modal, inputValue: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded mb-4 outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus onKeyDown={e => { if (e.key === 'Enter') { if (modal.onConfirm) modal.onConfirm(modal.inputValue); closeModal(); } }}
              />
            )}
            <div className="flex justify-end space-x-3">
              {(modal.type === 'confirm' || modal.type === 'prompt') && (
                <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Anuluj</button>
              )}
              <button onClick={() => { if (modal.onConfirm) { if (modal.type === 'prompt') modal.onConfirm(modal.inputValue); else modal.onConfirm(); } closeModal(); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}