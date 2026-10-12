import React from 'react';
import { useUpdateBannerController } from './controller';

/**
 * Aviso discreto no canto da tela: mostra o progresso do download da nova versão
 * e, quando pronta, oferece "Reiniciar e atualizar". Não bloqueia o atendimento.
 */
export function UpdateBanner() {
  const controller = useUpdateBannerController();

  if (!controller.visivel) return null;

  const pronto = controller.status === 'ready';

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 w-[300px] bg-surface-high border border-primary/40 rounded-md shadow-lg p-4 font-inter text-on-surface"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sora font-semibold text-sm text-primary">
            {pronto ? 'Atualização pronta' : 'Baixando atualização'}
          </p>
          <p className="text-xs text-on-variant mt-0.5">
            {pronto
              ? `A versão ${controller.versao} está pronta para instalar.`
              : `Nova versão ${controller.versao} (${controller.percentual}%)`}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dispensar aviso"
          className="text-outline hover:text-on-surface text-sm leading-none cursor-pointer"
          onClick={controller.handleDispensar}
        >
          ×
        </button>
      </div>

      {!pronto && (
        <div className="mt-3 h-1.5 w-full bg-surface-highest rounded-sm overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${controller.percentual}%` }}
          />
        </div>
      )}

      {pronto && (
        <button
          type="button"
          className="mt-3 w-full bg-primary hover:bg-primary-dark text-on-primary font-sora font-bold text-xs py-2 rounded-md transition-colors cursor-pointer"
          onClick={controller.handleReiniciar}
        >
          Reiniciar e atualizar
        </button>
      )}
    </div>
  );
}
