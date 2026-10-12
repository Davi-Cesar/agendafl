import { useUpdateStore } from '@shared/lib/update.store';

export function useUpdateBannerController() {
  const status = useUpdateStore((s) => s.status);
  const versao = useUpdateStore((s) => s.versao);
  const percentual = useUpdateStore((s) => s.percentual);
  const dispensado = useUpdateStore((s) => s.dispensado);
  const instalar = useUpdateStore((s) => s.instalar);
  const dispensar = useUpdateStore((s) => s.dispensar);

  const visivel = !dispensado && (status === 'downloading' || status === 'ready');

  return {
    status,
    versao,
    percentual,
    visivel,
    handleReiniciar: instalar,
    handleDispensar: dispensar,
  };
}
