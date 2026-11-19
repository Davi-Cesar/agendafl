import React, { useState, useEffect, useRef } from 'react';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'> {
  value: number | string | undefined | null;
  onChange?: (val: number) => void;
  onRawChange?: (rawStr: string, numVal: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  hideSpinners?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  selectOnFocus?: boolean;
  startEmptyIfZero?: boolean;
  allowDecimals?: boolean;
}

export function NumberInput({
  value,
  onChange,
  onRawChange,
  min = 0,
  max,
  step = 1,
  placeholder = '0',
  hideSpinners = false,
  prefix,
  suffix,
  className = '',
  inputClassName = '',
  selectOnFocus = true,
  startEmptyIfZero = true,
  allowDecimals = true,
  disabled = false,
  readOnly = false,
  onFocus,
  onBlur,
  onKeyDown,
  ...restProps
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Determina string inicial
  const formatInitial = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === '') return '';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
    if (isNaN(num)) return '';
    if (num === 0 && startEmptyIfZero) return '';
    return String(val);
  };

  const [displayValue, setDisplayValue] = useState<string>(() => formatInitial(value));

  // Sincroniza com alterações externas de `value`
  useEffect(() => {
    const currentNum = displayValue === '' ? 0 : parseFloat(displayValue.replace(',', '.')) || 0;
    const incomingNum =
      value === undefined || value === null || value === ''
        ? 0
        : typeof value === 'number'
        ? value
        : parseFloat(String(value).replace(',', '.')) || 0;

    // Se o usuário está digitando ativamente e o valor numérico é equivalente, não substitui
    if (isFocused && currentNum === incomingNum) {
      return;
    }

    if (value === undefined || value === null || value === '') {
      setDisplayValue('');
    } else if (incomingNum === 0 && startEmptyIfZero && !isFocused) {
      setDisplayValue('');
    } else {
      setDisplayValue(String(value));
    }
  }, [value, isFocused, startEmptyIfZero]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value;

    if (text === '') {
      setDisplayValue('');
      onChange?.(0);
      onRawChange?.('', 0);
      return;
    }

    // Remove zeros à esquerda que antecedem outro dígito (ex: "05" -> "5", mas "0.5" ou "0,5" é mantido)
    text = text.replace(/^0+(?=\d)/, '');

    // Validação de caracteres numéricos
    const regex = allowDecimals ? /^-?\d*[.,]?\d*$/ : /^-?\d*$/;
    if (!regex.test(text)) {
      return;
    }

    setDisplayValue(text);

    const normalized = text.replace(',', '.');
    if (normalized === '' || normalized === '-' || normalized === '.') {
      onChange?.(0);
      onRawChange?.(text, 0);
    } else {
      const parsed = parseFloat(normalized);
      if (!isNaN(parsed)) {
        onChange?.(parsed);
        onRawChange?.(text, parsed);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (selectOnFocus) {
      e.target.select();
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (displayValue === '') {
      onChange?.(0);
      onRawChange?.('', 0);
    } else {
      const parsed = parseFloat(displayValue.replace(',', '.'));
      if (isNaN(parsed)) {
        setDisplayValue(startEmptyIfZero ? '' : '0');
        onChange?.(0);
        onRawChange?.(startEmptyIfZero ? '' : '0', 0);
      } else {
        let clamped = parsed;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;

        if (clamped !== parsed) {
          const clampedStr = String(clamped);
          setDisplayValue(clampedStr);
          onChange?.(clamped);
          onRawChange?.(clampedStr, clamped);
        }
      }
    }

    onBlur?.(e);
  };

  const handleStep = (direction: 1 | -1) => {
    if (disabled || readOnly) return;

    const currentNum = displayValue === '' ? 0 : parseFloat(displayValue.replace(',', '.')) || 0;
    let next = currentNum + direction * step;

    // Ajusta precisão de decimais para evitar 0.30000000000000004
    const stepDecimals = step.toString().split('.')[1]?.length || 0;
    if (stepDecimals > 0) {
      next = parseFloat(next.toFixed(stepDecimals));
    }

    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;

    const nextStr = String(next);
    setDisplayValue(nextStr);
    onChange?.(next);
    onRawChange?.(nextStr, next);

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep(-1);
    }
    onKeyDown?.(e);
  };

  const currentNumeric = displayValue === '' ? 0 : parseFloat(displayValue.replace(',', '.')) || 0;
  const isUpDisabled = max !== undefined && currentNumeric >= max;
  const isDownDisabled = min !== undefined && currentNumeric <= min;

  return (
    <div
      className={`group relative flex items-center bg-[#110e06] border border-[#38342b] focus-within:border-[#e9c340] rounded-md transition-colors overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {prefix && (
        <div className="flex items-center pl-3 pr-1 text-[#99907b] text-xs font-mono shrink-0 select-none pointer-events-none">
          {prefix}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`flex-1 min-w-0 bg-transparent text-[#eae2d3] font-mono outline-none border-none placeholder-[#99907b]/60 selection:bg-[#e9c340]/30 selection:text-[#eae2d3] ${
          prefix ? 'pl-1' : 'pl-3'
        } ${suffix || !hideSpinners ? 'pr-1' : 'pr-3'} py-1.5 text-xs ${inputClassName}`}
        {...restProps}
      />

      {suffix && (
        <div className="flex items-center pr-2 pl-1 text-[#99907b] text-xs font-mono shrink-0 select-none pointer-events-none">
          {suffix}
        </div>
      )}

      {!hideSpinners && !disabled && !readOnly && (
        <div className="flex flex-col h-full w-6 border-l border-[#38342b] shrink-0 select-none divide-y divide-[#38342b]/80 self-stretch">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleStep(1)}
            disabled={isUpDisabled}
            className="flex-1 flex items-center justify-center text-[#99907b] hover:text-[#e9c340] hover:bg-[#1f1b13] active:bg-[#2d2a20] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Aumentar"
            aria-label="Aumentar valor"
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => handleStep(-1)}
            disabled={isDownDisabled}
            className="flex-1 flex items-center justify-center text-[#99907b] hover:text-[#e9c340] hover:bg-[#1f1b13] active:bg-[#2d2a20] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Diminuir"
            aria-label="Diminuir valor"
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
