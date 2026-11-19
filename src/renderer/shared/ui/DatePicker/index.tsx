import React, { useState, useEffect, useRef } from 'react';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD ou vazio
  onChange: (value: string) => void; // Retorna YYYY-MM-DD ou vazio
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  showActions?: boolean;
}

const NATIVE_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseIso(isoStr: string): { year: number; month: number; day: number } | null {
  if (!isoStr) return null;
  const parts = isoStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

function toIsoStr(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// Converte YYYY-MM-DD para DD/MM/AAAA exibível
function formatIsoToBr(isoStr: string): string {
  if (!isoStr) return '';
  const parsed = parseIso(isoStr);
  if (!parsed) return isoStr;
  const dd = String(parsed.day).padStart(2, '0');
  const mm = String(parsed.month + 1).padStart(2, '0');
  return `${dd}/${mm}/${parsed.year}`;
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

  return toIsoStr(year, month - 1, day);
}

function isDateDisabled(year: number, month: number, day: number, minDate?: Date, maxDate?: Date): boolean {
  const current = new Date(year, month, day);
  if (minDate) {
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    if (current < min) return true;
  }
  if (maxDate) {
    const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    if (current > max) return true;
  }
  return false;
}

export function DatePicker({
  value = '',
  onChange,
  placeholder = 'dd/mm/aaaa',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  align = 'left',
  size = 'md',
  showActions = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatIsoToBr(value));

  const today = new Date();
  const parsedInitial = parseIso(value);

  const [viewYear, setViewYear] = useState(parsedInitial ? parsedInitial.year : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedInitial ? parsedInitial.month : today.getMonth());

  const containerRef = useRef<HTMLDivElement>(null);
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 300 && spaceAbove > 300) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setInputValue(formatIsoToBr(value));
    const parsed = parseIso(value);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
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

  // Fechar ao teclar Esc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Anos disponíveis
  const currentYear = today.getFullYear();
  const minYear = minDate ? minDate.getFullYear() : Math.min(1930, currentYear - 70);
  const maxYear = maxDate ? maxDate.getFullYear() : currentYear + 10;

  const yearOptions: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }
  if (!yearOptions.includes(viewYear)) {
    yearOptions.push(viewYear);
    yearOptions.sort((a, b) => b - a);
  }

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
        const parts = parseIso(iso);
        if (parts && !isDateDisabled(parts.year, parts.month, parts.day, minDate, maxDate)) {
          onChange(iso);
          setViewYear(parts.year);
          setViewMonth(parts.month);
        }
      }
    } else if (formatted.length === 0) {
      onChange('');
    }
  };

  const handleInputBlur = () => {
    if (!inputValue) return;
    const iso = parseBrToIso(inputValue);
    if (!iso) {
      setInputValue(formatIsoToBr(value));
      return;
    }
    const parts = parseIso(iso);
    if (!parts || isDateDisabled(parts.year, parts.month, parts.day, minDate, maxDate)) {
      setInputValue(formatIsoToBr(value));
    }
  };

  const handleSelectDay = (day: number) => {
    if (isDateDisabled(viewYear, viewMonth, day, minDate, maxDate)) return;
    const isoStr = toIsoStr(viewYear, viewMonth, day);
    onChange(isoStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    if (isDateDisabled(y, m, d, minDate, maxDate)) return;
    const todayIso = toIsoStr(y, m, d);
    setViewYear(y);
    setViewMonth(m);
    onChange(todayIso);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setInputValue('');
    setIsOpen(false);
  };

  const isPrevMonthDisabled = Boolean(
    minDate &&
      (viewYear < minDate.getFullYear() ||
        (viewYear === minDate.getFullYear() && viewMonth <= minDate.getMonth()))
  );

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
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
  const sizeClasses = size === 'sm' ? 'pl-3 pr-8 py-1.5 text-xs' : 'pl-3.5 pr-9 py-2 text-xs';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input de exibição com ícone */}
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full bg-[#110e06] border border-[#38342b] focus:border-[#e9c340] outline-none rounded-md font-mono text-[#eae2d3] placeholder-[#99907b] transition-colors cursor-pointer ${sizeClasses} ${inputClassName}`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`absolute right-2 text-[#99907b] hover:text-[#e9c340] transition-colors p-1 cursor-pointer ${
            isOpen ? 'text-[#e9c340]' : ''
          }`}
          aria-label="Abrir calendário"
          title="Abrir calendário"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {/* Popover Calendário Customizado com Design System */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-50 w-72 bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl p-3.5 font-inter select-none animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Header do Popover (Navegação de Mês e Ano) */}
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <button
              type="button"
              disabled={isPrevMonthDisabled}
              onClick={handlePrevMonth}
              className={`p-1 rounded-md transition-all ${
                isPrevMonthDisabled
                  ? 'text-[#99907b]/25 cursor-not-allowed'
                  : 'text-[#99907b] hover:text-[#eae2d3] hover:bg-[#2d2a20] cursor-pointer'
              }`}
              title="Mês anterior"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5 font-sora font-semibold text-xs text-[#eae2d3]">
              {/* Seletor de Mês */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-[#110e06] border border-[#38342b] text-[#e9c340] text-xs font-mono font-medium rounded-md px-2 py-1 outline-none focus:border-[#e9c340] cursor-pointer"
              >
                {NATIVE_MONTHS.map((m, idx) => {
                  const monthDisabled = Boolean(
                    minDate && viewYear === minDate.getFullYear() && idx < minDate.getMonth()
                  );
                  return (
                    <option key={m} value={idx} disabled={monthDisabled}>
                      {m}
                    </option>
                  );
                })}
              </select>

              {/* Seletor de Ano */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-[#110e06] border border-[#38342b] text-[#e9c340] text-xs font-mono font-medium rounded-md px-2 py-1 outline-none focus:border-[#e9c340] cursor-pointer"
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
              title="Próximo mês"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
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

              const cellIso = toIsoStr(viewYear, viewMonth, day);
              const isSelected = cellIso === selectedIso;
              const isToday =
                day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();

              const disabledDay = isDateDisabled(viewYear, viewMonth, day, minDate, maxDate);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-full rounded flex items-center justify-center font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#e9c340] text-[#3c2f00] font-bold shadow-md cursor-pointer'
                      : disabledDay
                      ? 'text-[#99907b]/25 line-through cursor-not-allowed opacity-40'
                      : isToday
                      ? 'border border-[#e9c340]/80 text-[#e9c340] hover:bg-[#2d2a20] cursor-pointer'
                      : 'text-[#eae2d3] hover:bg-[#2d2a20] hover:text-[#e9c340] cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Rodapé com Ações "Limpar" e "Hoje" */}
          {showActions && (
            <div className="flex items-center justify-between border-t border-[#38342b] mt-3 pt-2 px-1 text-xs font-mono">
              <button
                type="button"
                onClick={handleClear}
                className="text-[#99907b] hover:text-[#ffb4ab] transition-colors cursor-pointer py-1"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[#e9c340] hover:text-[#d4af37] font-semibold transition-colors cursor-pointer py-1"
              >
                Hoje
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
