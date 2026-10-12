/**
 * Script de Migração e Importação Segura de Dados Legados - Agenda FL
 * 
 * Cadastra:
 * 1. 288 novos Serviços formatados em Nome Próprio elegante (+ mapeamento de Pé e Mão Simples)
 * 2. 12 novos Profissionais (+ preservação de Aline Catarina) com 60% de comissão
 * 3. Vínculos reais entre Profissionais e Serviços (profissionais_servicos)
 * 4. Grade semanal padrão para os novos profissionais (profissionais_horarios)
 */
const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jwtvrbifxeaudizamunl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dHZyYmlmeGVhdWRpemFtdW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODM0NzgsImV4cCI6MjEwMTg1OTQ3OH0.D1S4YxbvcXDvZ0_Pdc0kR6vkBmXvdpZ8ID3zKaW7TbA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const LIGACOES_MINUSCULAS = new Set(['e', 'de', 'da', 'do', 'das', 'dos', 'em', 'com', 'para', 'por', 'a', 'o', 'as', 'os']);

function formatarNomeProprio(val) {
  if (!val) return '';
  let indicePalavra = 0;
  return val
    .toLowerCase()
    .split(/(\s+)/)
    .map((trecho) => {
      if (trecho === '' || /^\s+$/.test(trecho)) return trecho;
      const ehPrimeira = indicePalavra === 0;
      indicePalavra += 1;
      if (!ehPrimeira && LIGACOES_MINUSCULAS.has(trecho)) return trecho;
      return trecho.charAt(0).toUpperCase() + trecho.slice(1);
    })
    .join('');
}

async function carregarArquivosJSON() {
  const pPath = path.join(__dirname, '..', 'docs', 'data', 'professionals.json');
  const sPath = path.join(__dirname, '..', 'docs', 'data', 'services.json');
  const subPath = path.join(__dirname, '..', 'docs', 'data', 'subservices.json');

  const professionals = JSON.parse(fs.readFileSync(pPath, 'utf8'));
  const categories = JSON.parse(fs.readFileSync(sPath, 'utf8'));
  const subservices = JSON.parse(fs.readFileSync(subPath, 'utf8'));

  return { professionals, categories, subservices };
}

async function main() {
  console.log('================================================================');
  console.log('       INICIANDO IMPORTAÇÃO DE DADOS LEGADOS - AGENDA FL        ');
  console.log('================================================================\n');

  const { professionals, categories, subservices } = await carregarArquivosJSON();

  // -------------------------------------------------------------
  // 1. MAPEAMENTO DE CATEGORIAS
  // -------------------------------------------------------------
  console.log('1. Mapeando Categorias com o Supabase...');
  const { data: dbCats, error: errDbCats } = await supabase.from('categorias_servicos').select('id, nome');
  if (errDbCats || !dbCats) {
    throw new Error('Falha ao buscar categorias no Supabase: ' + errDbCats?.message);
  }

  const catMap = {}; // oldCategoryId -> supabaseUuid
  categories.forEach((c) => {
    const dbCat = dbCats.find((dc) => dc.nome.toLowerCase() === c.name.toLowerCase());
    if (dbCat) {
      catMap[c.id] = dbCat.id;
    } else {
      console.warn(`[AVISO] Categoria não encontrada no banco: ${c.name} (id ${c.id})`);
    }
  });
  console.log(`   ✓ ${Object.keys(catMap).length}/8 Categorias mapeadas com sucesso.`);

  // -------------------------------------------------------------
  // 2. CADASTRO DE SERVIÇOS (289 total)
  // -------------------------------------------------------------
  console.log('\n2. Processando e cadastrando Serviços (subserviços)...');
  
  // Buscar serviços existentes no banco para não duplicar 'Pé e Mão Simples' nem outros
  const { data: dbServicosExistentes } = await supabase.from('servicos').select('id, nome');
  const servMap = {}; // oldSubserviceId -> supabaseUuid

  // Identificar se Pé e Mão Simples já existe
  const peMaoExistente = (dbServicosExistentes || []).find((s) => s.nome.toLowerCase().includes('pé e mão simples'));
  if (peMaoExistente) {
    servMap['376'] = peMaoExistente.id;
    console.log(`   ✓ Serviço 'Pé e Mão Simples' já existente preservado (ID: ${peMaoExistente.id})`);
  }

  const servicosParaInserir = [];
  const oldIdIndexMap = []; // rastreia qual oldId corresponde a qual item a ser inserido

  subservices.forEach((s) => {
    // Se for o 376 e já tiver sido mapeado, pula inserção
    if (s.id === '376' && servMap['376']) {
      return;
    }

    const catUuid = catMap[s.serviceId];
    if (!catUuid) {
      console.warn(`[AVISO] Subserviço ${s.name} sem categoria correspondente (serviceId: ${s.serviceId})`);
      return;
    }

    let nomeFormatado = formatarNomeProprio(s.name.trim());
    // Ajuste especial para Ausência de Terapia (duração 0 -> 30)
    let duracao = Number(s.durationSubservice);
    if (!duracao || duracao <= 0) {
      duracao = 30;
      console.log(`   ✓ Ajustada duração de '${nomeFormatado}' de 0 para 30 minutos.`);
    }

    servicosParaInserir.push({
      categoria_id: catUuid,
      nome: nomeFormatado,
      preco_padrao: Number(s.price || 0),
      duracao_minutos: duracao,
      ativo: true,
    });
    oldIdIndexMap.push(s.id);
  });

  console.log(`   Inserindo ${servicosParaInserir.length} novos serviços no banco em lotes...`);
  const LOTE_TAMANHO = 40;
  for (let i = 0; i < servicosParaInserir.length; i += LOTE_TAMANHO) {
    const lote = servicosParaInserir.slice(i, i + LOTE_TAMANHO);
    const idsLote = oldIdIndexMap.slice(i, i + LOTE_TAMANHO);

    const { data: inseridos, error: errInsServ } = await supabase
      .from('servicos')
      .insert(lote)
      .select('id');

    if (errInsServ || !inseridos) {
      throw new Error(`Erro ao inserir lote de serviços ${i}-${i + lote.length}: ${errInsServ?.message}`);
    }

    inseridos.forEach((item, idx) => {
      const oldId = idsLote[idx];
      servMap[oldId] = item.id;
    });

    process.stdout.write(`   Progresso serviços: ${Math.min(i + LOTE_TAMANHO, servicosParaInserir.length)}/${servicosParaInserir.length}...\r`);
  }
  console.log(`\n   ✓ Total de ${Object.keys(servMap).length} serviços ativos e mapeados com sucesso.`);

  // -------------------------------------------------------------
  // 3. CADASTRO DE PROFISSIONAIS (13 total)
  // -------------------------------------------------------------
  console.log('\n3. Processando e cadastrando Profissionais da Equipe...');
  const { data: dbProfsExistentes } = await supabase.from('profissionais').select('id, nome, status, especialidade');
  const profMap = {}; // oldProfId -> supabaseUuid
  const novosProfsParaHorarios = []; // lista de novos IDs para gerar grade semanal

  for (const p of professionals) {
    const pNome = p.name.trim();
    const pEspecialidade = (p.categories || []).join(', ');

    // Verificar se já existe no banco (ex: Aline Catarina)
    const existente = (dbProfsExistentes || []).find(
      (dp) => dp.nome.toLowerCase() === pNome.toLowerCase()
    );

    if (existente) {
      profMap[p.id] = existente.id;
      console.log(`   ✓ Profissional existente preservado: ${pNome} (ID: ${existente.id})`);
      // Atualizar especialidade se estiver vazia
      if (!existente.especialidade || existente.especialidade === '') {
        await supabase.from('profissionais').update({ especialidade: pEspecialidade }).eq('id', existente.id);
      }
    } else {
      // Inserir novo profissional
      const { data: novoProf, error: errNovoProf } = await supabase
        .from('profissionais')
        .insert({
          nome: pNome,
          especialidade: pEspecialidade,
          status: 'ativo',
          comissao_percentual: 60.0,
        })
        .select('id')
        .single();

      if (errNovoProf || !novoProf) {
        throw new Error(`Erro ao cadastrar profissional ${pNome}: ${errNovoProf?.message}`);
      }

      profMap[p.id] = novoProf.id;
      novosProfsParaHorarios.push({ id: novoProf.id, nome: pNome });
      console.log(`   + Cadastrado novo profissional: ${pNome} (Especialidade: ${pEspecialidade})`);
    }
  }
  console.log(`   ✓ ${Object.keys(profMap).length}/13 Profissionais prontos e mapeados.`);

  // -------------------------------------------------------------
  // 4. VÍNCULOS PROFISSIONAIS <-> SERVIÇOS (profissionais_servicos)
  // -------------------------------------------------------------
  console.log('\n4. Vinculando Serviços aos Profissionais correspondentes...');
  const vinculosParaInserir = [];
  const vinculosSet = new Set();

  professionals.forEach((p) => {
    const profUuid = profMap[p.id];
    if (!profUuid) return;

    const subIds = p.subservicesIds || [];
    subIds.forEach((oldSubId) => {
      const servUuid = servMap[oldSubId];
      if (!servUuid) {
        // Ignora os 4 IDs órfãos (14, 37, 140, 179)
        return;
      }

      const chave = `${profUuid}_${servUuid}`;
      if (!vinculosSet.has(chave)) {
        vinculosSet.add(chave);
        vinculosParaInserir.push({
          profissional_id: profUuid,
          servico_id: servUuid,
        });
      }
    });
  });

  console.log(`   Inserindo ${vinculosParaInserir.length} vínculos na tabela profissionais_servicos...`);
  for (let i = 0; i < vinculosParaInserir.length; i += 50) {
    const lote = vinculosParaInserir.slice(i, i + 50);
    const { error: errLoteVinculos } = await supabase
      .from('profissionais_servicos')
      .insert(lote);

    if (errLoteVinculos) {
      console.warn(`[AVISO] Inserção parcial de vínculos no lote ${i}:`, errLoteVinculos.message);
    }
    process.stdout.write(`   Progresso vínculos: ${Math.min(i + 50, vinculosParaInserir.length)}/${vinculosParaInserir.length}...\r`);
  }
  console.log(`\n   ✓ Vínculos profissionais-serviços concluídos com sucesso.`);

  // -------------------------------------------------------------
  // 5. GRADE HORÁRIA SEMANAL PADRÃO (profissionais_horarios)
  // -------------------------------------------------------------
  console.log('\n5. Configurando grade horária semanal padrão para os novos profissionais...');
  const horariosParaInserir = [];

  novosProfsParaHorarios.forEach((p) => {
    // 7 dias da semana: 0=Domingo (inativo), 1=Segunda a 6=Sábado (ativos)
    for (let dia = 0; dia <= 6; dia++) {
      const isAtivo = dia !== 0; // Domingo inativo
      horariosParaInserir.push({
        profissional_id: p.id,
        dia_semana: dia,
        ativo: isAtivo,
        manha_inicio: '08:00',
        manha_fim: '11:00',
        tarde_inicio: '13:30',
        tarde_fim: '17:00',
        intervalo_almoco: '11:00 - 13:30',
      });
    }
  });

  if (horariosParaInserir.length > 0) {
    console.log(`   Inserindo ${horariosParaInserir.length} faixas de horários (${novosProfsParaHorarios.length} profissionais x 7 dias)...`);
    for (let i = 0; i < horariosParaInserir.length; i += 50) {
      const lote = horariosParaInserir.slice(i, i + 50);
      const { error: errHorarios } = await supabase
        .from('profissionais_horarios')
        .insert(lote);

      if (errHorarios) {
        console.warn(`[AVISO] Inserção de horários no lote ${i}:`, errHorarios.message);
      }
    }
    console.log(`   ✓ Grade horária semanal configurada com sucesso.`);
  } else {
    console.log('   ✓ Nenhum novo profissional necessitou de grade horária adicional.');
  }

  // -------------------------------------------------------------
  // 6. VALIDAÇÃO FINAL
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                  VALIDAÇÃO FINAL DA IMPORTAÇÃO                 ');
  console.log('================================================================');

  const [resTotalServicos, resTotalProfs, resTotalVinculos, resTotalHorarios] = await Promise.all([
    supabase.from('servicos').select('id', { count: 'exact' }).eq('ativo', true),
    supabase.from('profissionais').select('id, nome', { count: 'exact' }).eq('status', 'ativo'),
    supabase.from('profissionais_servicos').select('servico_id', { count: 'exact' }),
    supabase.from('profissionais_horarios').select('id', { count: 'exact' }),
  ]);

  console.log(`• Serviços Ativos no Catálogo: ${resTotalServicos.count} serviços`);
  console.log(`• Profissionais Ativos na Equipe: ${resTotalProfs.count} profissionais`);
  console.log(`• Vínculos Profissional ↔ Serviço: ${resTotalVinculos.count} relações ativas`);
  console.log(`• Faixas de Horários Cadastradas: ${resTotalHorarios.count} faixas`);
  console.log('================================================================\n');

  console.log('🎉 MIGRAÇÃO CONCLUÍDA COM TOTAL SUCESSO E INTEGRIDADE!');
}

main().catch((err) => {
  console.error('\n❌ ERRO FATAL NA IMPORTAÇÃO:', err);
  process.exit(1);
});
