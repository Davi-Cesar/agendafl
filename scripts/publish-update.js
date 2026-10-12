/**
 * Publica uma nova versão do FL Agenda no Supabase Storage (bucket público "updates").
 *
 * Uso:   npm run publish:update      (ou npm run release, que roda o build antes)
 *
 * Variáveis de ambiente (arquivo .env local, que já é ignorado pelo git):
 *   SUPABASE_URL                -> ex.: https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   -> chave service_role. NUNCA colocar no app nem no git.
 *
 * Ordem de upload (importante): instalador e .blockmap primeiro, latest.yml POR ÚLTIMO.
 * O latest.yml é o que anuncia a nova versão aos clientes; subi-lo antes apontaria
 * os apps para um instalador que ainda não existe.
 */
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const BUCKET = 'updates';
const RELEASE_DIR = path.join(__dirname, '..', 'release');
const { version } = require('../package.json');

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://jwtvrbifxeaudizamunl.supabase.co').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function falhar(mensagem) {
  console.error(`\n[publish-update] ERRO: ${mensagem}`);
  process.exit(1);
}

function contentType(nome) {
  if (nome.endsWith('.yml')) return 'text/yaml';
  return 'application/octet-stream';
}

async function garantirBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });

  if (res.ok) {
    console.log(`Bucket "${BUCKET}" criado (público).`);
    return;
  }

  const corpo = await res.text();
  // Bucket já existente não é erro.
  if (res.status === 409 || /already exists/i.test(corpo)) return;
  falhar(`não foi possível criar/verificar o bucket "${BUCKET}" (${res.status}): ${corpo}`);
}

async function enviar(nome) {
  const caminho = path.join(RELEASE_DIR, nome);
  const conteudo = fs.readFileSync(caminho);
  const tamanhoMb = (conteudo.length / 1024 / 1024).toFixed(1);
  process.stdout.write(`Enviando ${nome} (${tamanhoMb} MB)... `);

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(nome)}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': contentType(nome),
      'x-upsert': 'true',
    },
    body: conteudo,
  });

  if (!res.ok) {
    const corpo = await res.text();
    const dica = res.status === 413 || /maximum allowed size|too large/i.test(corpo)
      ? '\nDica: o arquivo excede o limite do seu plano do Supabase (Free = 50 MB por arquivo). ' +
        'Aumente o limite (plano Pro / Storage settings) ou hospede no GitHub Releases.'
      : '';
    falhar(`upload de ${nome} falhou (${res.status}): ${corpo}${dica}`);
  }
  console.log('ok');
}

async function main() {
  if (!SERVICE_KEY) {
    falhar('defina SUPABASE_SERVICE_ROLE_KEY no arquivo .env (Supabase > Project Settings > API > service_role).');
  }
  if (!fs.existsSync(RELEASE_DIR)) {
    falhar('pasta "release/" não encontrada. Rode "npm run dist" antes.');
  }

  const instalador = `FL-Agenda-Setup-${version}.exe`;
  const arquivos = [instalador, `${instalador}.blockmap`, 'latest.yml'];

  for (const nome of arquivos) {
    if (!fs.existsSync(path.join(RELEASE_DIR, nome))) {
      falhar(`arquivo "${nome}" não encontrado em release/. A versão do package.json (${version}) corresponde ao último "npm run dist"?`);
    }
  }

  console.log(`Publicando FL Agenda v${version} em ${SUPABASE_URL} (bucket "${BUCKET}")\n`);
  await garantirBucket();

  // latest.yml por último (ver cabeçalho).
  for (const nome of arquivos) {
    await enviar(nome);
  }

  console.log(`\nPublicado! Clientes verão a v${version} na próxima verificação.`);
  console.log(`Manifesto: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/latest.yml`);
}

main().catch((err) => falhar(err && err.message ? err.message : String(err)));
