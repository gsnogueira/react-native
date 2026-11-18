# Melhorias de arquitetura, desempenho e segurança

## Resumo

O aplicativo foi evoluído para separar responsabilidades, reduzir recálculos e tornar
mais segura a persistência local de autenticação e transações. As alterações mantêm
o React Native e os fluxos existentes de login, painel e manutenção de transações.

## Arquitetura modular e Clean Architecture

- **Domínio (`src/domain`)**: contratos para autenticação e transações agora ficam
  independentes das bibliotecas de Firebase e armazenamento. O domínio também
  centraliza a regra de cálculo do resumo financeiro.
- **Infraestrutura (`src/data`)**: `firebaseAuthRepository` encapsula o Firebase
  Authentication. `financeRepository` encapsula persistência, criptografia,
  validação dos dados lidos e cache em memória.
- **Apresentação (`src/app`)**: telas continuam responsáveis pela interface; o
  provedor coordena casos de uso e o reducer mantém o estado da aplicação.
- **Inversão de dependência**: o `FinanceProvider` aceita repositórios por props,
  permitindo trocar adaptadores e testar a apresentação sem acoplar os testes ao
  Firebase ou ao dispositivo.

Essa organização cria limites explícitos entre as camadas sem introduzir abstrações
extras para funcionalidades que ainda não existem.

## Estado e fluxo reativo

- O estado de sessão, transações, carregamento e erro foi consolidado em um reducer
  tipado, com ações explícitas para mudanças de autenticação e dados.
- A assinatura de mudanças de sessão do Firebase alimenta o estado da interface.
  Respostas assíncronas atrasadas são descartadas quando a conta muda ou o componente
  é desmontado.
- Gravações e exclusões são serializadas para impedir que operações simultâneas
  calculem a próxima lista sobre uma versão antiga e sobrescrevam alterações.
- Uma operação enfileirada não pode atravessar uma troca de conta; o cache daquela
  conta é removido da memória ao sair.
- Falhas de leitura agora aparecem na interface com opção de tentar novamente, em
  vez de serem ignoradas silenciosamente.

## Desempenho

- O painel calcula entradas e saídas numa única passagem pela lista e memoriza o
  resultado enquanto a lista não mudar.
- A lista de transações memoriza o recorte paginado e limita a quantidade inicial,
  por lote e janela que o `FlatList` renderiza.
- As telas continuam usando carregamento sob demanda; o painel é pré-carregado
  depois das interações iniciais para aquecer a tela principal sem competir com a
  primeira renderização.
- O repositório mantém transações em cache na memória por conta e persiste gravações
  de forma serializada. O cache é de dados locais, não de respostas HTTP.

**Limite do bundle:** `React.lazy` e `import()` organizam o carregamento de módulos,
mas não garantem divisão física do bundle em aplicativos React Native/Metro. A
redução comprovada do tamanho do bundle exige suporte/configuração de bundle
segmentado e medição de release; esta alteração não afirma esse ganho.

## Segurança e compatibilidade de dados

- A autenticação do Firebase e as transações locais passam a usar
  `react-native-encrypted-storage`, que delega a proteção ao Keychain no iOS e ao
  armazenamento protegido do Android.
- As transações são isoladas por identificador de usuário. A leitura e a gravação
  rejeitam dados que pertençam a outra conta.
- A chave legada compartilhada do AsyncStorage é migrada por usuário para o
  armazenamento criptografado e removida após a migração bem-sucedida. A migração
  preserva registros já existentes e não duplica identificadores.
- Dados locais inválidos ou falhas do armazenamento são reportados em vez de
  substituídos por uma lista vazia.

**Limites de segurança:** a proteção em repouso não é criptografia ponta a ponta e
não substitui controles de acesso no servidor. As credenciais de configuração Web
do Firebase são identificadores de cliente, não segredos; as regras do Firebase e
as políticas de autenticação precisam continuar restritas. Recibos permanecem como
URIs locais armazenadas no registro; seu arquivo não é enviado nem criptografado
por esta implementação.

## Cache de rede e sincronização

O projeto não tem atualmente um backend de transações: `services/api.ts` não faz
parte do fluxo financeiro, e as transações são locais. Portanto, não foi criado um
cache HTTP artificial. Cache de respostas remotas, sincronização entre dispositivos
e modo offline com resolução de conflitos devem ser adicionados quando houver uma
API definida, com política de expiração e invalidação apropriada.

## Validação executada

- `npx tsc --noEmit`
- `npm test -- --runInBand --coverage=false` (3 suítes, 7 testes)
- Bundle JavaScript Android com `npx react-native bundle`
- `android/gradlew.bat :app:compileDebugJavaWithJavac`

Os testes cobrem cálculo agregado, transição entre contas, persistência criptografada,
isolamento por usuário e migração do armazenamento antigo. `npm run lint` não foi
executado com sucesso porque a configuração existente referencia
`@react-native-community` e `@typescript-eslint/parser`, ausentes das dependências
instaladas.

## Próximos passos para produção

1. Configurar e validar o autolinking do armazenamento criptografado em builds
   Android e iOS; em iOS, instalar os Pods no ambiente macOS.
2. Executar teste de migração em dispositivo com dados reais de versões anteriores
   e política de recuperação para armazenamento protegido indisponível.
3. Medir tempo de inicialização e tamanho do bundle de release antes/depois; avaliar
   bundle segmentado se o tamanho inicial for um gargalo.
4. Se transações forem sincronizadas no futuro, criar API com autorização por
   usuário, cache com invalidação, sincronização offline e tratamento de conflitos.
