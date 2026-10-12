import React, { useState, useEffect } from 'react';
import type { ComandaItem, DescontoTipo } from '../../schemas/comanda.schema';
import type { Cliente } from '@modules/clientes/schemas/cliente.schema';
import { verificarElegibilidadeAniversario } from '../../utils/cupom.utils';

export interface ModalDescontoItemProps {
  aberto: boolean;
  onClose: () => void;
  item: ComandaItem | null;
  cliente: Cliente | null;
  itemComAniversarioId: string | null;
  onAplicarAniversario: (itemId: string) => void;
  onAplicarManual: (itemId: string, tipo: DescontoTipo, valor: number) => void;
  onRemoverDesconto: (itemId: string) => void;
}

export function ModalDescontoItem({
  aberto,
  onClose,
  item,
  cliente,
  itemComAniversarioId,
  onAplicarAniversario,
  onAplicarManual,
  onRemoverDesconto,
}: ModalDescontoItemProps) {
  if (!aberto || !item) return null;

  const totalLinhaBruto = item.quantidade * item.valorUnitario;
  const elegibilidade = verificarElegibilidadeAniversario(cliente);
  const outroItemJaUsaAniversario =
    Boolean(itemComAniversarioId) && itemComAniversarioId !== item.id;
  const esteItemUsaAniversario = item.desconto?.origem === 'aniversario';
  const esteItemUsaManual = item.desconto?.origem === 'manual';

  const [tipoManual, setTipoManual] = useState<DescontoTipo>(
    item.desconto?.origem === 'manual' ? item.desconto.tipo : 'percentual'
  );
  const [valorManual, setValorManual] = useState<string>(
    item.desconto?.origem === 'manual' ? String(item.desconto.valor) : ''
  );
  const [erroValidacao, setErroValidacao] = useState<string>('');

  useEffect(() => {
    if (item.desconto?.origem === 'manual') {
      setTipoManual(item.desconto.tipo);
      setValorManual(String(item.desconto.valor));
    } else {
      setTipoManual('percentual');
      setValorManual('');
    }
    setErroValidacao('');
  }, [item]);

  const numVal = parseFloat(valorManual) || 0;
  const prevDescontoEmReais =
    tipoManual === 'percentual'
      ? (totalLinhaBruto * Math.min(100, Math.max(0, numVal))) / 100
      : Math.min(totalLinhaBruto, Math.max(0, numVal));

  const handleSalvarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (numVal <= 0) {
      setErroValidacao('Informe um valor de desconto maior que zero.');
      return;
    }

    if (tipoManual === 'percentual' && numVal > 100) {
      setErroValidacao('O percentual máximo de desconto é de 100%.');
      return;
    }

    if (tipoManual === 'valor_fixo' && numVal > totalLinhaBruto) {
      setErroValidacao(
        `O desconto máximo permitido para este item é de R$ ${totalLinhaBruto.toFixed(2)}.`
      );
      return;
    }

    onAplicarManual(item.id, tipoManual, numVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#1f1b13] border border-[#38342b] rounded-xl shadow-2xl p-6 space-y-5 text-[#eae2d3] font-inter">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#38342b]">
          <div>
            <h3 className="font-sora font-bold text-base text-[#eae2d3]">
              Desconto no Serviço
            </h3>
            <p className="text-xs text-[#99907b] mt-0.5 truncate max-w-[280px]">
              {item.descricao} — Total bruto: R$ {totalLinhaBruto.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#99907b] hover:text-[#eae2d3] p-1 text-sm font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Opção 1: Cupom de Aniversário (10%) */}
        <div className="bg-[#110e06] border border-[#38342b] rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-sora font-semibold text-xs text-[#e9c340] flex items-center gap-1.5">
              <span>🎂</span> Cupom de Aniversário (10%)
            </span>
            {esteItemUsaAniversario && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold">
                Aplicado
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#99907b]">
            Desconto fixo de 10% para o cliente no mês de seu aniversário (uso único por ano).
          </p>

          {elegibilidade.elegivel ? (
            outroItemJaUsaAniversario ? (
              <div className="text-[11px] text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded p-2">
                O cupom de aniversário já está aplicado em outro serviço desta comanda (limite de 1 por comanda).
              </div>
            ) : esteItemUsaAniversario ? (
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-xs text-[#10b981] font-semibold">
                  Economia de R$ {(totalLinhaBruto * 0.1).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onRemoverDesconto(item.id);
                    onClose();
                  }}
                  className="px-3 py-1 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded text-xs transition-colors cursor-pointer"
                >
                  Remover Aniversário
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onAplicarAniversario(item.id);
                  onClose();
                }}
                className="w-full py-2 bg-[#e9c340] hover:bg-[#b8960c] text-[#3c2f00] font-sora font-bold text-xs rounded-md shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🎂</span>
                <span>Aplicar Cupom de Aniversário (-10% • R$ {(totalLinhaBruto * 0.1).toFixed(2)})</span>
              </button>
            )
          ) : (
            <div className="text-[11px] text-[#99907b] bg-[#16130b] border border-[#38342b]/60 rounded p-2">
              {elegibilidade.motivo === 'ja_utilizado_neste_ano'
                ? 'Este cliente já utilizou o cupom de aniversário no ano atual.'
                : elegibilidade.motivo === 'nao_e_mes_aniversario'
                ? 'Cliente não faz aniversário no mês atual.'
                : 'Cliente sem data de nascimento cadastrada.'}
            </div>
          )}
        </div>

        {/* Opção 2: Desconto Manual / Avulso */}
        <form onSubmit={handleSalvarManual} className="bg-[#110e06] border border-[#38342b] rounded-lg p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-sora font-semibold text-xs text-[#eae2d3] flex items-center gap-1.5">
              <span>🏷️</span> Desconto Manual / Avulso
            </span>
            {esteItemUsaManual && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#e9c340]/20 text-[#e9c340] border border-[#e9c340]/40 font-bold">
                Aplicado
              </span>
            )}
          </div>

          <p className="text-[11px] text-[#99907b]">
            Ajuste de preço avulso decidido pela recepção para este serviço.
          </p>

          {/* Seletor Tipo: % ou R$ */}
          <div className="grid grid-cols-2 gap-2 bg-[#16130b] p-1 rounded-md border border-[#38342b]">
            <button
              type="button"
              onClick={() => setTipoManual('percentual')}
              className={`py-1 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                tipoManual === 'percentual'
                  ? 'bg-[#e9c340] text-[#3c2f00] shadow'
                  : 'text-[#99907b] hover:text-[#eae2d3]'
              }`}
            >
              % Percentual
            </button>
            <button
              type="button"
              onClick={() => setTipoManual('valor_fixo')}
              className={`py-1 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                tipoManual === 'valor_fixo'
                  ? 'bg-[#e9c340] text-[#3c2f00] shadow'
                  : 'text-[#99907b] hover:text-[#eae2d3]'
              }`}
            >
              R$ Valor Fixo
            </button>
          </div>

          {/* Campo de Valor */}
          <div className="space-y-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#99907b]">
                {tipoManual === 'percentual' ? '%' : 'R$'}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                max={tipoManual === 'percentual' ? 100 : totalLinhaBruto}
                placeholder={tipoManual === 'percentual' ? 'Ex: 15' : 'Ex: 20.00'}
                value={valorManual}
                onChange={(e) => {
                  setValorManual(e.target.value);
                  setErroValidacao('');
                }}
                className="w-full bg-[#16130b] border border-[#38342b] focus:border-[#e9c340] rounded px-8 py-2 text-xs font-mono text-[#eae2d3] outline-none transition-colors"
              />
            </div>
            {numVal > 0 && (
              <span className="block text-[11px] font-mono text-[#e9c340] text-right">
                Desconto efetivo: R$ {prevDescontoEmReais.toFixed(2)} → Novo total:{' '}
                R$ {Math.max(0, totalLinhaBruto - prevDescontoEmReais).toFixed(2)}
              </span>
            )}
            {erroValidacao && (
              <span className="block text-[11px] text-[#ffb4ab] font-medium mt-1">
                {erroValidacao}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 bg-[#2d2a20] hover:bg-[#3d392f] border border-[#38342b] hover:border-[#e9c340] text-[#eae2d3] text-xs font-semibold rounded-md transition-all cursor-pointer"
            >
              Aplicar Desconto Manual
            </button>
            {esteItemUsaManual && (
              <button
                type="button"
                onClick={() => {
                  onRemoverDesconto(item.id);
                  onClose();
                }}
                className="px-3 py-2 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-md text-xs transition-colors cursor-pointer"
              >
                Remover
              </button>
            )}
          </div>
        </form>

        {/* Rodapé Fechar */}
        <div className="flex justify-end pt-2 border-t border-[#38342b]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#16130b] hover:bg-[#2d2a20] border border-[#38342b] text-[#99907b] hover:text-[#eae2d3] text-xs rounded-md transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
