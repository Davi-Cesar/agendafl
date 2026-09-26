## Regras de Negócio — Tela de Agenda (FL Agenda)

Documento de levantamento funcional a partir da tela "Agenda - Visão Geral" do sistema Espaço FL. Cada regra descreve o comportamento observado (1) e o objetivo de negócio que ele atende para o cliente (2).

## 1. Menu Lateral de Navegação

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-01 | Exibe o nome do estabelecimento ("FL Agenda" / "Espaço FL") e um menu vertical fixo com os itens Agenda, Caixa, Clientes e Comandas, cada um com ícone próprio. | Permitir que o usuário identifique rapidamente em qual estabelecimento está operando e navegue entre os módulos principais do sistema sem perder contexto. |
| RN-02 | Destaca visualmente (fundo diferenciado) o item de menu correspondente à tela atualmente aberta (no exemplo, "Agenda"). | Dar ao usuário referência de localização dentro do sistema . |
| RN-03 | Disponibiliza a opção "Logout" fixada na parte inferior do menu, separada dos demais itens. | Garantir acesso rápido e seguro para encerrar a sessão, protegendo os dados do estabelecimento em terminais compartilhados. |

## 2. Cabeçalho da Agenda

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-04 | Exibe o título da tela ("Agenda - Visão Geral") e a data corrente por extenso, incluindo dia da semana (ex.: "Sexta -feira, 24 de Outubro, 2024"). | Confirmar ao usuário qual dia está sendo consultado, reduzindo erros de agendamento em data errada. |
| RN-05 | Mostra um indicador de status "Caixa Aberto" com marcador colorido (bolinha) ao lado do título. | Informar rapidamente se o caixa do dia já foi aberto, permitindo que o cliente saiba se pode registrar vendas/comandas antes de iniciar o atendimento. |
| RN-06 | Disponibiliza um campo de busca com placeholder "Procurar profissional.." e ícone de lupa no cabeçalho. | Permitir localizar rapidamente um profissional específico em salões com muitos colaboradores, sem precisar rolar a agenda inteira. |

## 3. Colunas de Profissionais

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-07 | Organiza a agenda em colunas, uma para cada profissional, exibindo avatar/ícone, nome e especialidade (ex.: "Alex Rivera – Senior Stylist", "Marco V. – Colorist"). | Dar visão simultânea da disponibilidade de todos os profissionais, ajudando a distribuir clientes e evitar sobreposição de horários. |


| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-08 | Permite rolagem horizontal quando o número de profissionais excede a largura da tela (indicado pela coluna "Sofia L." parcialmente cortada à direita). | Suportar equipes de qualquer tamanho sem limitar a quantidade de profissionais cadastrados na agenda. |

## 4. Grade de Horários

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-09 | Exibe uma coluna fixa à esquerda com os horários do dia em intervalos regulares (ex.: 08:30, 09:00, 09:30, 10:00, 10:30), acompanhada de um ícone de relógio no topo. | Dar referência temporal constante enquanto o usuário rola a tela, facilitando o encaixe de novos horários. |
| RN-10 | Traça uma linha horizontal destacada (com marcador circular) atravessando todas as colunas, indicando o horário atual em tempo real. | Permitir identificação imediata de "onde estamos agora" na agenda, ajudando a equipe a saber quais atendimentos já deveriam ter começado ou estão prestes a começar. |

## 5. Cards de Agendamento

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-11 | Renderiza cada agendamento como um card posicionado no cruzamento entre a coluna do profissional e a linha do horário, contendo faixa de horário (ex.: "10:00 - 10:30"), nome do cliente e serviço (ex.: "Ricardo Alves – Barba Design"). | Comunicar de forma visual e rápida quem está agendado, com quem e para qual serviço, sem exigir cliques adicionais. |
| RN-12 | Redimensiona a altura do card proporcionalmente à duração do serviço (cards de 30 min são menores que os de 60 min, como o "Shiatsu 60min" de Carla Dias). | Dar noção imediata de quanto tempo cada atendimento ocupa na agenda, ajudando no planejamento de encaixes. |
| RN-13 | Aplica um estilo tracejado/pontilhado a cards de agendamentos futuros ainda não iniciados (ex.: "Ricardo Alves"). | Diferenciar visualmente compromissos confirmados que ainda vão acontecer, evitando confundi-los com atendimentos em andamento. |
| RN-14 | Destaca em cor sólida (dourado/amarelo) e com a etiqueta "EM ATENDIMENTO" os cards cujo serviço está em execução no momento (ex.: Mariana Silva, Carla Dias), incluindo um contador regressivo ("Faltam 15min"). | Permitir que a recepção e os profissionais saibam, de relance, quais atendimentos estão ativos e quanto tempo falta para a liberação do profissional para o próximo cliente. |
| RN-15 | Exibe, dentro do card, o nome do serviço/detalhe abaixo do nome do cliente (ex.: "Coloração + Tratamento", "Massagem Relaxante", "Drenagem"). | Preparar antecipadamente o profissional e a recepção sobre o tipo de atendimento, materiais e tempo necessários. |


## 6. Ações Rápidas

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-16 | Disponibiliza um botão flutuante circular com ícone "+" fixo no canto inferior direito da tela, visível em qualquer ponto da rolagem. | Agilizar a criação de um novo agendamento a partir de qualquer ponto da agenda, sem precisar navegar até um menu específico. |


## Regras de Negócio — Tela de Comanda (Detalhe)

Documento de levantamento funcional a partir da tela de detalhe de uma comanda aberta, acessada pelo módulo "Comandas" do sistema Espaço FL.

## 7. Identificação da Comanda e Cliente

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-17 | Exibe o status e o número da comanda ("COMANDA ABERTA #8843") no topo da tela. | Confirmar ao operador que a comanda está ativa e permitir identificá -la e localizá-la de forma única (por número) em consultas, impressões ou eventuais conferências. |
| RN-18 | Apresenta uma etiqueta de segmentação do cliente ("VIP GOLD") ao lado do status da comanda. | Sinalizar imediatamente o nível/categoria do cliente para que a equipe ofereça o tratamento e eventuais benefícios (descontos, prioridade) condizentes com o programa de fidelidade. |
| RN-19 | Exibe o nome do cliente em destaque ("Mariana Silva") junto de uma etiqueta de evento especial ("Aniversariante do Dia") quando aplicável. | Alertar a equipe sobre uma oportunidade de encantamento (parabenizar, oferecer cortesia) e reforçar o relacionamento com o cliente. |
| RN-20 | Disponibiliza a opção "Imprimir Via" no topo da tela. A comanda só é criada e persistida no banco de dados no momento em que "FINALIZAR COMANDA" é acionado. | Garantir a integridade dos dados financeiros no banco, salvando permanentemente a comanda apenas no encerramento efetivo do atendimento. |
| RN-20b | Exibe o badge com o número da comanda (ex.: "#0001") diretamente no card do agendamento e na modal de detalhes assim que a comanda for finalizada, permitindo abri-la diretamente com um clique. | Permitir localização e acesso rápido à comanda concluída sem precisar navegar por filtros ou buscar manualmente. |

## 8. Serviços Adicionados

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-21 | Lista, sob o título "Serviços Adicionados", cada item lançado na comanda com ícone, nome do serviço (ex.: "Coloração + Tratamento"), profissional responsável (ex.: "Julia Mendes") e valor (ex.: "R$ 380,00"), além de um contador total de itens ("2 Itens"). | Dar transparência ao cliente e ao operador sobre tudo o que está sendo cobrado e por quem foi executado, evitando divergências no fechamento. |
| RN-22 | Oferece um botão/área tracejada "Adicionar Serviço" com ícone de "+" logo abaixo da lista de itens. | Permitir incluir novos serviços ou produtos à comanda a qualquer momento antes da finalização, suportando vendas adicionais durante o atendimento. |

## 9. Histórico Rápido do Cliente


| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-23 | Mostra, na seção "Histórico Rápido", cartões com atendimentos anteriores do cliente (data, ícone de status concluído, nome do serviço e valor pago, ex.: "14 OUT 2023 – Corte e Escova – R$ 380,00"). | Dar contexto imediato sobre o relacionamento e as preferências do cliente, apoiando indicações personalizadas (upsell/cross-sell) e um atendimento mais consultivo. |

## 10. Resumo de Valores e Pagamento

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-24 | Calcula e exibe automaticamente, no painel "Resumo de Valores", o Subtotal, os Descontos e o Total, a partir da soma dos serviços adicionados. | Evitar cálculos manuais e erros de cobrança, dando ao cliente e ao operador certeza sobre o valor final antes do pagamento. |
| RN-25 | Disponibiliza um botão "Cupom Aplicado" que permite inserir/gerenciar um cupom de desconto vinculado à comanda. | Possibilitar a aplicação de promoções e benefícios de fidelidade diretamente no fechamento, refletindo o desconto no total em tempo real. |
| RN-26 | Apresenta três opções de forma de pagamento ("PIX", "Cartão", "Dinheiro") como botões selecionáveis, com o PIX vindo pré- selecionado/destacado. | Agilizar o fechamento do caixa, permitindo à equipe registrar corretamente o meio de recebimento para fins de conciliação financeira. |
| RN-27 | Disponibiliza o botão principal "FINALIZAR COMANDA" em destaque (cor de ação primária) ao final do painel de valores. | Encerrar formalmente o atendimento, registrando a venda, baixando os serviços em aberto e liberando o profissional/mesa para o próximo cliente. |
| RN-28 | Exibe as opções "Cancelar" e "Excluir" em texto de cor de alerta (vermelho), separadas e em menor destaque que a ação de finalizar. | Permitir desfazer ou remover uma comanda aberta por engano ou não concretizada, evitando cliques acidentais graças ao contraste visual reduzido em relação à ação principal. |


## Regras de Negócio — Tela de Caixa e Financeiro

Documento de levantamento funcional a partir da tela "Caixa e Financeiro", acessada pelo módulo "Caixa" do sistema Espaço FL.

## 11. Cabeçalho e Controle do Caixa

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-29 | Exibe o título "Caixa e Financeiro" com os botões "Fechar Caixa" (destaque em dourado) e "Ver Caixas Anteriores" no cabeçalho. | Permitir encerrar o caixa do dia com um único clique e consultar o histórico de fechamentos anteriores para conferência e auditoria. |

## 12. Cards de Saldo por Meio de Recebimento

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-30 | Exibe o card "Fundo de Caixa" com o valor inicial do dia (ex.: "R$ 500,00 – Saldo inicial do dia"). | Deixar claro qual foi o valor de abertura do caixa, servindo de base para a conferência do fechamento ao final do expediente. |
| RN-31 | Exibe o card "Dinheiro" com o total recebido em espécie e a variação percentual em relação ao dia anterior (ex.: "R$ 1.240,50 / +12% vs ontem"). | Dar ao gestor uma leitura rápida de desempenho, comparando o movimento em dinheiro com o histórico recente. |
| RN-32 | Exibe cards individuais por chave/conta PIX cadastrada (ex.: "PIX Bricia", "PIX Flavia"), cada um com valor total e número de transações do dia. | Permitir conciliar os recebimentos por PIX separadamente por profissional ou conta, facilitando o repasse e a checagem de valores. |
| RN-33 | Exibe cards "Cartão Crédito" (com indicação de parcelamento, ex.: "Parcelados e à vista") e "Cartão Débito" (com indicação de "Recebimento imediato"), cada um com o valor total do dia. | Diferenciar o fluxo de caixa físico (débito, recebido na hora) do fluxo previsto (crédito parcelado, a receber), apoiando o planejamento financeiro do estabelecimento. |

## 13. Transações e Comissões do Dia

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-34 | Disponibiliza abas para alternar entre "Transações" e "Comissões do Dia", exibindo o conteúdo correspondente à aba selecionada. | Organizar em um só lugar tanto o extrato financeiro do dia quanto o cálculo de repasse aos profissionais, evitando telas separadas. |
| RN-35 | Lista, na aba "Comissões do Dia", uma tabela com Profissional, quantidade de Serviços realizados e Total de Comissão calculada (ex.: "Julia Mendes – 12 serviços – R$ 850,00"), com filtro "Filtrar por: Todos". | Calcular automaticamente quanto cada profissional tem a receber no dia, eliminando conferência manual e permitindo filtrar por profissional específico. |


| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-36 | Disponibiliza o link "Ver relatório detalhado" ao final da lista de comissões. | Dar acesso a uma visão aprofundada (por serviço, data ou período) para conferência financeira e para o fechamento de folha/repasse dos profissionais. |


## Regras de Negócio — Tela de Gestão de Profissionais

Documento de levantamento funcional a partir da tela "Gestão de Profissionais - Listagem e Horários" do sistema Espaço FL (Aura Management).

## 14. Listagem de Profissionais

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-37 | Exibe, na coluna central, a lista "Registrados (12)" com o total de profissionais cadastrados e um item por profissional (nome + especialidade, ex.: "Ricardo Alencar – Hair Stylist"). | Dar visão consolidada de toda a equipe cadastrada e permitir alternar rapidamente entre os profissionais para consulta ou edição. |
| RN-38 | Disponibiliza o campo "Buscar profissional..." e o botão "Novo Profissional" no cabeçalho da tela. | Agilizar a localização de um profissional em equipes grandes e permitir o cadastro de novos colaboradores sem sair da tela. |
| RN-39 | Destaca visualmente na lista o profissional atualmente selecionado (ex.: "Helena Souza"), carregando seus dados no painel à direita. | Deixar claro qual registro está sendo visualizado/editado no momento, evitando alterações no cadastro errado. |

## 15. Ficha e Especialidades do Profissional

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-40 | Exibe nome, e-mail e um indicador "Status do Profissional" (ex.: "Ativo no Sistema", com marcador verde) no topo do painel de detalhes. | Confirmar rapidamente os dados de contato e se o profissional está habilitado a ser agendado/receber acessos ao sistema. |
| RN-41 | Lista etiquetas (tags) com as especialidades do profissional (ex.: "Estética Facial", "Peeling", "Limpeza de Pele"). | Permitir que a recepção saiba quais serviços aquele profissional pode executar, evitando agendamentos incompatíveis com sua qualificação. |

## 16. Horários de Trabalho

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-42 | Exibe um card por dia da semana (Seg a Sáb) com uma caixa de seleção para habilitar/desabilitar o dia de trabalho. | Permitir configurar exatamente em quais dias o profissional atende, refletindo diretamente na disponibilidade de horários na Agenda. |
| RN-43 | Define, para cada dia habilitado, os períodos "Manhã" e "Tarde" com horário de início e fim (ex.: "08:00 até 12:00" / "13:30 até 18:30"). | Estabelecer a janela exata de atendimento do profissional em cada turno, base para o cálculo dos horários disponíveis na agenda. |


| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-44 | Exibe automaticamente o intervalo de almoço (ex.: "12:00 – 13:30") e a pausa para café com duração (ex.: "15:45 (15m)"), calculados a partir dos turnos definidos. | Bloquear automaticamente esses períodos na agenda, evitando que clientes sejam marcados durante o descanso do profissional. |
| RN-45 | Disponibiliza o botão "Add Exceção" em cada card de dia da semana. | Permitir ajustes pontuais de horário (folgas, entradas/saídas diferentes, feriados) sem alterar a jornada padrão cadastrada. |
| RN-46 | Disponibiliza o botão "Replicar Horários" no cabeçalho da seção de horários. | Agilizar a configuração copiando o horário de um dia (ou de um profissional) para os demais, evitando reconfiguração manual repetitiva. |


## Regras de Negócio — Tela de Cadastro de Clientes

Documento de levantamento funcional a partir da tela "Cadastro de Clientes", acessada pelo módulo "Clientes" do sistema Espaço FL.

## 17. Cabeçalho, Busca e Indicadores

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-47 | Disponibiliza o campo "Pesquisar por nome, CPF ou telefone..." no topo da tela. | Permitir localizar um cliente específico de forma rápida por diferentes critérios, mesmo em bases com centenas de cadastros. |
| RN-48 | Disponibiliza os botões "Aniversariantes do Dia" e "Novo Cliente" no cabeçalho. | Dar acesso rápido à lista de clientes que fazem aniversário no dia (ação comercial/relacionamento) e permitir cadastrar um novo cliente sem sair da tela. |
| RN-49 | Exibe três indicadores numéricos no topo: "Total de Clientes" (248), "Aniversariantes do Dia" (08) e "Clientes Ativos" (215). | Dar uma visão gerencial imediata da base de clientes, do potencial de ações do dia e da saúde da carteira (proporção de ativos). |

## 18. Listagem de Clientes

| Regra | 1 - O que faz? | 2 - Objetivo esperado pelo cliente |
| --- | --- | --- |
| RN-50 | Lista, na tabela "Todos os Clientes", cada cliente com avatar (iniciais), Nome, Telefone, Última Visita e Status ("Ativo"/"Inativo"). | Permitir consulta rápida dos dados de contato e do relacionamento (recência da última visita) para priorizar ações de retenção ou reativação. |
| RN-51 | Disponibiliza a ação "Ver Perfil" em cada linha da tabela. | Dar acesso direto ao histórico completo e aos dados detalhados daquele cliente, sem precisar buscá-lo novamente. |
| RN-52 | Disponibiliza ícones de filtro e de exportação/download acima da tabela de clientes. | Permitir refinar a lista por critérios específicos (ex.: status, período) e extrair os dados para uso externo (planilhas, relatórios). |
| RN-53 | Exibe paginação na parte inferior da tabela ("Exibindo 1-10 de 248 clientes", com números de página e setas de navegação). | Manter a performance e a legibilidade da tela mesmo com uma base grande de clientes, permitindo navegar por blocos de registros. |
| RN-54 | Permite a ação "Remover Cliente" via Soft Delete (`removido_em`), cancelando reservas futuras e ocultando o cliente de buscas e listagens ativas, enquanto preserva o cadastro e histórico de comandas/atendimentos passados para conciliação e auditoria financeira. | Garantir a limpeza da agenda e a retenção legal/contábil do histórico financeiro do estabelecimento. |

