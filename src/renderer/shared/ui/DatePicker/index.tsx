import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  value?: string; // YYYY-MM-DD ou vazio
  onChange: (value: string) => void; // Retorna YYYY-MM-DD ou vazio
  placeholder?: string;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

const NATIVE_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Converte YYYY-MM-DD para DD/MM/AAAA exibível
function formatIsoToBr(isoStr: string): string {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Converte DD/MM/AAAA para YYYY-MM-DD
function parseBrToIso(brStr: string): string | null {
  const digits = brStr.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  const day = parseInt(digits.slice(0, 2), 10);
  const month = parseInt(digits.slice(2, 4), 10);
  const year = parseInt(digits.slice(4, 8), 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return null;

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return null;
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function DatePicker({
  value = '',
  onChange,
  placeholder = 'dd/mm/aaaa',
  maxDate = new Date(),
  disabled = false,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatIsoToBr(value));

  // Mês e Ano sendo visualizados no popover do calendário
  const today = new Date();
  const initialDate = value ? new Date(`${value}T00:00:00`) : today;

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(formatIsoToBr(value));
    if (value) {
      const d = new Date(`${value}T00:00:00`);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Fechar popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Seleção rápida de anos (do ano 1930 até o ano atual)
  const currentMaxYear = maxDate ? maxDate.getFullYear() : today.getFullYear();
  const yearOptions = Array.from({ length: currentMaxYear - 1929 }, (_, i) => currentMaxYear - i);

  // Formatação do input manual DD/MM/AAAA
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = raw;
    if (raw.length > 2 && raw.length <= 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    } else if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    }

    setInputValue(formatted);

    if (formatted.length === 10) {
      const iso = parseBrToIso(formatted);
      if (iso) {
        const testDate = new Date(`${iso}T00:00:00`);
        if (maxDate && testDate > maxDate) {
          // Data futura não permitida
          return;
        }
        onChange(iso);
      }
    } else if (formatted.length === 0) {
      onChange('');
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const isoStr = `${viewYear}-${mm}-${dd}`;
    const selectedObj = new Date(`${isoStr}T00:00:00`);

    if (maxDate && selectedObj > maxDate) return;

    onChange(isoStr);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      const nextYear = viewYear + 1;
      if (maxDate && nextYear > maxDate.getFullYear()) return;
      setViewMonth(0);
      setViewYear(nextYear);
    } else {
      const testDate = new Date(viewYear, viewMonth + 1, 1);
      if (maxDate && testDate > maxDate && testDate.getMonth() !== maxDate.getMonth()) return;
      setViewMonth((m) => m + 1);
    }
  };

  // Gerar matriz de dias do mês
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push(d);
  }

  const selectedIso = value;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input de exibição com ícone */}
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md pl-3.5 pr-10 py-2 text-xs font-mono text-[#eae2d3] placeholder-[#99907b] transition-colors cursor-pointer"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-2.5 text-[#99907b] hover:text-[#e9c340] transition-colors p-1 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {/* Popover Calendário Customizado */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-[#1f1b13] border border-[#38342b] rounded-lg shadow-2xl p-4 font-inter animate-in fade-in zoom-in-95 duration-100">
          {/* Header do Popover (Navegação de Mês e Ano) */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] rounded-md transition-all cursor-pointer"
            >
              ‹
            </button>

            <div className="flex items-center gap-1.5 font-sora font-semibold text-xs text-[#eae2d3]">
              {/* Seletor de Mês */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-[#110e06] border border-[#38342b] text-[#e9c340] text-xs font-mono rounded px-1.5 py-1 outline-none cursor-pointer"
              >
                {NATIVE_MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Seletor de Ano */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-[#110e06] border border-[#38342b] text-[#e9c340] text-xs font-mono rounded px-1.5 py-1 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] rounded-md transition-all cursor-pointer"
            >
              ›
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 text-center gap-1 mb-1 text-[10px] font-mono font-semibold text-[#99907b] uppercase">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 gap-1 text-xs font-mono">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const cellIso = `${viewYear}-${mm}-${dd}`;
              const cellDate = new Date(`${cellIso}T00:00:00`);

              const isSelected = cellIso === selectedIso;
              const isToday =
                cellDate.getDate() === today.getDate() &&
                cellDate.getMonth() === today.getMonth() &&
                cellDate.getFullYear() === today.getFullYear();

              const isFuture = maxDate ? cellDate > maxDate : false;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-full rounded flex items-center justify-center font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-sm'
                      : isFuture
                      ? 'text-[#99907b]/30 cursor-not-allowed'
                      : isToday
                      ? 'border border-[#e9c340] text-[#e9c340] hover:bg-[#2d2a20]'
                      : 'text-[#eae2d3] hover:bg-[#2d2a20] hover:text-[#e9c340]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
