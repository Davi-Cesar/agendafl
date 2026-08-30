import React from 'react';
import { useDetalhesComandaViewController } from './controller';

export function DetalhesComandaView({ dados }: { dados: any }) {
  const controller = useDetalhesComandaViewController(dados);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#16130b] text-[#eae2d3] font-inter overflow-y-auto p-6">
      <header className="flex items-center justify-between border-b border-[#38342b] pb-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs font-mono text-[#99907b] hover:text-[#e9c340] flex items-center gap-1 transition-colors cursor-pointer"
            onClick={controller.handleVoltar}
          >
            &larr; Voltar para Agenda
          </button>
          <h1 className="font-sora font-bold text-xl text-[#eae2d3]">
            Comanda {controller.dados?.comandaNumero || '#0000'}
          </h1>
          <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-mono text-[11px] px-2.5 py-0.5 rounded-md uppercase font-semibold">
            FINALIZADA
          </span>
        </div>
      </header>

      <div className="max-w-xl bg-[#1f1b13] border border-[#38342b] rounded-lg p-6 space-y-4">
        <h3 className="font-sora font-semibold text-base text-[#e9c340] mb-4">Resumo da Comanda Concluída</h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between border-b border-[#38342b] pb-2">
            <span className="text-[#99907b] font-mono">CLIENTE</span>
            <span className="font-medium text-[#eae2d3]">{controller.dados?.clienteNome}</span>
          </div>
          <div className="flex justify-between border-b border-[#38342b] pb-2">
            <span className="text-[#99907b] font-mono">PROFISSIONAL</span>
            <span className="text-[#eae2d3]">{controller.dados?.profissionalNome}</span>
          </div>
          <div className="flex justify-between border-b border-[#38342b] pb-2">
            <span className="text-[#99907b] font-mono">SERVIÇO</span>
            <span className="text-[#eae2d3]">{controller.dados?.servico}</span>
          </div>
          <div className="flex justify-between border-b border-[#38342b] pb-2">
            <span className="text-[#99907b] font-mono">HORÁRIO</span>
            <span className="font-mono text-[#eae2d3]">{controller.dados?.horarioInicio} às {controller.dados?.horarioFim}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-[#99907b] font-mono">STATUS FINANCEIRO</span>
            <span className="text-[#10b981] font-semibold">Finalizada e registrada no Caixa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
