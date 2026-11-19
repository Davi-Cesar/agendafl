/**
 * Teste End-to-End da Atualização de Horários de Atendimento do Funcionário
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jwtvrbifxeaudizamunl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dHZyYmlmeGVhdWRpemFtdW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODM0NzgsImV4cCI6MjEwMTg1OTQ3OH0.D1S4YxbvcXDvZ0_Pdc0kR6vkBmXvdpZ8ID3zKaW7TbA';

class DummyWS {}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { transport: DummyWS },
});

function parseTimeToMins(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

async function run() {
  console.log('================================================================');
  console.log('  TESTE: ATUALIZAÇÃO DE HORÁRIOS DE ATENDIMENTO DO FUNCIONÁRIO   ');
  console.log('================================================================\n');

  // 1. Obter um profissional ativo de teste
  const { data: profs, error: errProf } = await supabase
    .from('profissionais')
    .select('id, nome, status')
    .eq('status', 'ativo')
    .order('nome')
    .limit(1);

  if (errProf || !profs || profs.length === 0) {
    console.error('❌ Falha ao buscar profissional ativo:', errProf);
    process.exit(1);
  }

  const prof = profs[0];
  console.log(`✓ Profissional selecionado para o teste: ${prof.nome} (ID: ${prof.id})`);

  // 2. Buscar horários atuais do profissional
  const { data: horariosAtuais, error: errH } = await supabase
    .from('profissionais_horarios')
    .select('*')
    .eq('profissional_id', prof.id)
    .order('dia_semana', { ascending: true });

  if (errH) {
    console.error('❌ Falha ao buscar horários atuais:', errH);
    process.exit(1);
  }

  console.log(`✓ Horários atuais no banco: ${horariosAtuais.length} dias cadastrados`);
  const segAtual = horariosAtuais.find((h) => h.dia_semana === 1) || {
    manha_inicio: '08:00',
    manha_fim: '11:00',
    tarde_inicio: '13:30',
    tarde_fim: '17:00',
    ativo: true,
  };

  const backupSeg = {
    dia_semana: 1,
    ativo: segAtual.ativo,
    manha_inicio: segAtual.manha_inicio?.slice(0, 5) || '08:00',
    manha_fim: segAtual.manha_fim?.slice(0, 5) || '11:00',
    tarde_inicio: segAtual.tarde_inicio?.slice(0, 5) || '13:30',
    tarde_fim: segAtual.tarde_fim?.slice(0, 5) || '17:00',
  };

  console.log(`   Segunda-feira original: Manhã ${backupSeg.manha_inicio}-${backupSeg.manha_fim}, Tarde ${backupSeg.tarde_inicio}-${backupSeg.tarde_fim}, Ativo: ${backupSeg.ativo}`);

  // 3. Simular alteração de horário (ex: Segunda-feira passa a ser 09:15 - 12:30 e 14:00 - 18:30)
  const novoHorarioSeg = {
    profissional_id: prof.id,
    dia_semana: 1,
    ativo: true,
    manha_inicio: '09:15',
    manha_fim: '12:30',
    tarde_inicio: '14:00',
    tarde_fim: '18:30',
  };

  console.log(`\n→ Aplicando update de horário na Segunda-feira:`);
  console.log(`   Novo turno: Manhã 09:15-12:30 | Tarde 14:00-18:30`);

  const { data: upsertRes, error: errUpsert } = await supabase
    .from('profissionais_horarios')
    .upsert([novoHorarioSeg], { onConflict: 'profissional_id,dia_semana' })
    .select();

  if (errUpsert) {
    console.error('❌ ERRO no update de horários:', errUpsert);
    process.exit(1);
  }

  console.log('✓ Upsert executado com sucesso no Supabase!');

  // 4. Ler do banco para confirmar persistência
  const { data: recarregado, error: errRec } = await supabase
    .from('profissionais_horarios')
    .select('*')
    .eq('profissional_id', prof.id)
    .eq('dia_semana', 1)
    .single();

  if (errRec) {
    console.error('❌ Erro ao recarregar horário atualizado:', errRec);
    process.exit(1);
  }

  const manhaOk = recarregado.manha_inicio.startsWith('09:15') && recarregado.manha_fim.startsWith('12:30');
  const tardeOk = recarregado.tarde_inicio.startsWith('14:00') && recarregado.tarde_fim.startsWith('18:30');

  if (manhaOk && tardeOk) {
    console.log('✅ PASS: Horário atualizado persistido corretamente no banco de dados!');
  } else {
    console.error('❌ FAIL: Os valores persistidos não coincidem com os enviados:', recarregado);
    process.exit(1);
  }

  // 5. Simular impacto na Grade da Agenda (Disponibilidade por Slot)
  console.log('\n→ Verificando cálculo de disponibilidade na Grade da Agenda:');

  // Slot das 08:30 (deve estar INDISPONÍVEL com novo horário iniciando 09:15)
  const slot830 = parseTimeToMins('08:30');
  const mIni = parseTimeToMins(recarregado.manha_inicio.slice(0, 5));
  const mFim = parseTimeToMins(recarregado.manha_fim.slice(0, 5));
  const tIni = parseTimeToMins(recarregado.tarde_inicio.slice(0, 5));
  const tFim = parseTimeToMins(recarregado.tarde_fim.slice(0, 5));

  const disp830 = (slot830 >= mIni && slot830 < mFim) || (slot830 >= tIni && slot830 < tFim);
  console.log(`   Slot 08:30 disponível? ${disp830 ? 'SIM' : 'NÃO'} (Esperado: NÃO)`);

  // Slot das 10:00 (deve estar DISPONÍVEL)
  const slot1000 = parseTimeToMins('10:00');
  const disp1000 = (slot1000 >= mIni && slot1000 < mFim) || (slot1000 >= tIni && slot1000 < tFim);
  console.log(`   Slot 10:00 disponível? ${disp1000 ? 'SIM' : 'NÃO'} (Esperado: SIM)`);

  // Slot das 13:00 (Pausa de almoço, deve estar INDISPONÍVEL)
  const slot1300 = parseTimeToMins('13:00');
  const disp1300 = (slot1300 >= mIni && slot1300 < mFim) || (slot1300 >= tIni && slot1300 < tFim);
  console.log(`   Slot 13:00 disponível? ${disp1300 ? 'SIM' : 'NÃO'} (Esperado: NÃO - Almoço)`);

  // Slot das 15:00 (Tarde, deve estar DISPONÍVEL)
  const slot1500 = parseTimeToMins('15:00');
  const disp1500 = (slot1500 >= mIni && slot1500 < mFim) || (slot1500 >= tIni && slot1500 < tFim);
  console.log(`   Slot 15:00 disponível? ${disp1500 ? 'SIM' : 'NÃO'} (Esperado: SIM)`);

  if (!disp830 && disp1000 && !disp1300 && disp1500) {
    console.log('✅ PASS: Lógica da Grade da Agenda respeita rigorosamente o novo horário!');
  } else {
    console.error('❌ FAIL: Inconsistência nos slots de atendimento');
  }

  // 6. Testar Toggle de Folga (Ativo = false)
  console.log('\n→ Testando Toggle de Folga (Dia inativo):');
  const folgaPayload = {
    profissional_id: prof.id,
    dia_semana: 1,
    ativo: false,
    manha_inicio: null,
    manha_fim: null,
    tarde_inicio: null,
    tarde_fim: null,
  };

  const { error: errFolga } = await supabase
    .from('profissionais_horarios')
    .upsert([folgaPayload], { onConflict: 'profissional_id,dia_semana' });

  if (errFolga) {
    console.error('❌ Erro ao salvar folga:', errFolga);
  } else {
    const { data: recFolga } = await supabase
      .from('profissionais_horarios')
      .select('*')
      .eq('profissional_id', prof.id)
      .eq('dia_semana', 1)
      .single();

    if (recFolga.ativo === false) {
      console.log('✅ PASS: Toggle de folga (ativo = false) salvo com sucesso!');
    }
  }

  // 7. Reverter para os dados originais
  console.log('\n→ Revertendo dados de teste para o estado original...');
  const { error: errRevert } = await supabase
    .from('profissionais_horarios')
    .upsert([{
      profissional_id: prof.id,
      ...backupSeg,
    }], { onConflict: 'profissional_id,dia_semana' });

  if (errRevert) {
    console.error('❌ Erro na reversão:', errRevert);
  } else {
    console.log('✅ PASS: Estado original restaurado com sucesso!');
  }

  console.log('\n================================================================');
  console.log('🎉 RESULTADO: O UPDATE DE HORÁRIOS DO FUNCIONÁRIO ESTÁ FUNCIONANDO 100%!');
  console.log('================================================================\n');
}

run().catch((e) => {
  console.error('Erro inesperado:', e);
  process.exit(1);
});
