
import React, { useState, useEffect, useMemo } from 'react';
import { generateYearSchedule, MONTH_NAMES, getDayKey } from './utils';
import { Period } from './types';
import AssignmentSelector from './components/AssignmentSelector';
import { 
  PrinterIcon, 
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

const SPREADSHEET_ID = '1cGSg9J7W6Fv94bzCoEOVHFXeObiAsYlIxXu_gktcHpg';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

const App: React.FC = () => {
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth());
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  
  // Store assignments as: [dateKey]: { [period]: { [slotIndex]: name } }
  const [assignments, setAssignments] = useState<Record<string, Record<string, Record<number, string>>>>(() => {
    const saved = localStorage.getItem('escala_2026_assignments_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [personList, setPersonList] = useState<string[]>(() => {
    const saved = localStorage.getItem('escala_2026_persons');
    return saved ? JSON.parse(saved) : [];
  });

  const schedule = useMemo(() => generateYearSchedule(2026), []);
  const activeMonth = schedule[activeMonthIndex];

  // Fetch names from Google Sheets
  useEffect(() => {
    const fetchNames = async () => {
      setIsLoadingNames(true);
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        
        // Simple CSV parser: split by lines, take first column, remove quotes and empty lines
        const names = csvText
          .split(/\r?\n/)
          .map(line => {
            const firstColumn = line.split(',')[0];
            return firstColumn ? firstColumn.replace(/^"|"$/g, '').trim() : '';
          })
          .filter(name => name.length > 0 && name.toLowerCase() !== 'nome'); // Filter header if exists

        // Merge with existing list to not lose manually added names, then sort
        setPersonList(prev => {
          const combined = Array.from(new Set([...prev, ...names]));
          return combined.sort((a, b) => a.localeCompare(b));
        });
      } catch (error) {
        console.error('Erro ao buscar nomes da planilha:', error);
      } finally {
        setIsLoadingNames(false);
      }
    };

    fetchNames();
  }, []);

  useEffect(() => {
    localStorage.setItem('escala_2026_assignments_v2', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('escala_2026_persons', JSON.stringify(personList));
  }, [personList]);

  const handleAssign = (dateKey: string, period: Period, slotIndex: number, name: string) => {
    setAssignments(prev => {
      const dayData = prev[dateKey] || {};
      const periodData = dayData[period] || {};
      
      return {
        ...prev,
        [dateKey]: {
          ...dayData,
          [period]: {
            ...periodData,
            [slotIndex]: name
          }
        }
      };
    });

    if (name.trim() && !personList.includes(name.trim())) {
      setPersonList(prev => [...prev, name.trim()].sort());
    }
  };

  const clearMonth = () => {
    if (window.confirm(`Deseja limpar todos os nomes de ${activeMonth.name}?`)) {
      const newAssignments = { ...assignments };
      activeMonth.days.forEach(day => {
        delete newAssignments[getDayKey(day.date)];
      });
      setAssignments(newAssignments);
    }
  };

  const printSchedule = () => window.print();

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 no-print shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-gray-800 tracking-tighter uppercase italic">
              Escala <span className="text-indigo-600">2026</span>
            </h1>
            {isLoadingNames && (
              <div className="flex items-center space-x-1 ml-4 px-2 py-1 bg-indigo-50 text-indigo-500 rounded text-[9px] font-bold animate-pulse">
                <CloudArrowDownIcon className="w-3 h-3" />
                <span>SINCRONIZANDO NOMES...</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={printSchedule}
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              title="Imprimir"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={clearMonth}
              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
              title="Limpar Mês"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="max-w-5xl mx-auto px-2 overflow-x-auto border-t">
          <nav className="flex space-x-1 py-3 px-2">
            {MONTH_NAMES.map((name, index) => (
              <button
                key={name}
                onClick={() => setActiveMonthIndex(index)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all
                  ${activeMonthIndex === index 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-gray-400 hover:bg-gray-100'}`}
              >
                {name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
        <div className="flex items-center justify-between no-print mb-4 px-2">
           <button 
              disabled={activeMonthIndex === 0}
              onClick={() => setActiveMonthIndex(prev => prev - 1)}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter italic">
              {activeMonth.name}
            </h2>
            <button 
              disabled={activeMonthIndex === 11}
              onClick={() => setActiveMonthIndex(prev => prev + 1)}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
        </div>

        {activeMonth.days.map((day) => {
          const dateKey = getDayKey(day.date);
          const isSunday = day.date.getDay() === 0;
          const dayName = isSunday ? 'DOMINGO' : 'QUARTA-FEIRA';
          const headerColor = isSunday ? 'bg-[#0ea86e]' : 'bg-[#2b64f1]';
          const dateStr = day.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

          return (
            <div key={dateKey} className="bg-white rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden print:break-inside-avoid">
              {/* Day Header */}
              <div className={`${headerColor} px-8 py-4 text-center`}>
                <h3 className="text-white text-lg font-black tracking-[0.2em] uppercase flex items-center justify-center space-x-3">
                  <span>{dayName}</span>
                  <span className="opacity-60">—</span>
                  <span>{dateStr}</span>
                </h3>
              </div>

              {/* Day Content */}
              <div className="px-6 py-6 space-y-6">
                {day.periods.map((period, pIndex) => (
                  <div key={period} className={`flex items-start ${pIndex < day.periods.length - 1 ? 'border-b border-gray-50 pb-6' : ''}`}>
                    {/* Period Label */}
                    <div className="w-20 pt-2 shrink-0">
                       <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.15em] leading-none block border-r border-gray-100">
                         {period === Period.MORNING ? 'MANHÃ' : 'NOITE'}
                       </span>
                    </div>

                    {/* Selector Slots */}
                    <div className="flex-1 grid grid-cols-2 gap-4 pl-6">
                      {[0, 1].map((slotIndex) => (
                        <AssignmentSelector
                          key={slotIndex}
                          availableNames={personList}
                          currentValue={assignments[dateKey]?.[period]?.[slotIndex] || ''}
                          onSelect={(name) => handleAssign(dateKey, period, slotIndex, name)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* Print only Footer */}
      <footer className="hidden print:block fixed bottom-4 w-full text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
        Escala Ministerial 2026 - v2.0 Layout Visual
      </footer>
    </div>
  );
};

export default App;
