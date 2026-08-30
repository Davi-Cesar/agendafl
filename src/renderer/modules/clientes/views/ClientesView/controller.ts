import { useState } from 'react';

export function useClientesViewController() {
  const [busca, setBusca] = useState('');
  return { busca, setBusca };
}
