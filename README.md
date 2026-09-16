# Finance App

Aplicativo mobile de controle financeiro feito com React Native. O app oferece autenticacao por e-mail e senha com Firebase, dashboard, transacoes e anexos de recibos.

![React Native](https://img.shields.io/badge/React%20Native-0.66.4-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-9.23.0-FFCA28?logo=firebase)
![Platform](https://img.shields.io/badge/platform-Android-3DDC84?logo=android)

## Visao rapida

| Area | O que existe |
| --- | --- |
| Acesso | Cadastro, login, sessao persistente e logout |
| Dashboard | Saldo, entradas, despesas e resumo visual |
| Transacoes | Criar, editar, excluir, buscar e filtrar |
| Recibos | Selecao de imagens e PDFs |
| Dados | Firebase Authentication; transacoes locais no AsyncStorage |

## Requisitos

- Windows, macOS ou Linux
- Node.js 20 LTS
- JDK 11
- Android Studio com SDK e emulador configurados
- Emulador Android iniciado ou dispositivo conectado via ADB

> Este projeto usa React Native 0.66.4 e Gradle 6.9. Em versoes recentes do Node, use `NODE_OPTIONS=--openssl-legacy-provider`.

## Instalar

```powershell
npm install
```

No Windows, configure o ambiente para esta sessao do PowerShell:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.32.101-hotspot"
$env:ANDROID_SDK_ROOT="$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_HOME=$env:ANDROID_SDK_ROOT
$env:NODE_OPTIONS="--openssl-legacy-provider"
```

## Executar Android

Terminal 1, na raiz do projeto:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start -- --reset-cache
```

Terminal 2:

```powershell
npm run android
```

Se o Metro ja estiver usando a porta `8081`, reutilize o processo existente. Para conferir dispositivos conectados:

```powershell
adb devices
```

## Configurar Firebase

1. Abra o [Firebase Console](https://console.firebase.google.com/).
2. Selecione o projeto `react-native-28557` ou crie outro.
3. Acesse **Authentication > Metodo de login**.
4. Ative **E-mail/senha**.
5. Confira os usuarios em **Authentication > Usuarios** depois do cadastro.

A configuracao Web usada pelo app fica em `src/app/FinanceContext.tsx`. Se trocar de projeto, atualize o objeto `firebaseConfig` nesse arquivo.

O identificador Android do app e:

```text
com.myreactnativeappnative
```

> As credenciais de configuracao Web do Firebase nao sao chaves secretas. Nunca adicione chaves privadas, service accounts ou arquivos de credenciais administrativas ao repositorio.

## Validar antes de testar

Execute estas verificacoes antes de abrir o emulador:

```powershell
npx tsc --noEmit
npm test -- --runInBand
npm run lint
```

Para validar o bundle Android sem instalar o APK:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output "$env:TEMP\finance-bundle.js" --reset-cache
```

## Estrutura principal

```text
src/app/
  App.tsx                              Entrada da aplicacao
  FinanceContext.tsx                   Firebase Auth e estado das transacoes
  navigation/AppNavigator.tsx          Rotas autenticadas e publicas
  screens/AuthScreen.tsx               Login e cadastro
  screens/DashboardScreen.tsx          Resumo financeiro
  screens/TransactionsScreen.tsx       Lista, busca e filtros
  screens/TransactionFormScreen.tsx    Criacao e edicao
android/                               Projeto nativo Android
```

## Solucao de problemas

| Sintoma | Acao |
| --- | --- |
| `EADDRINUSE: 8081` | Reutilize o Metro atual ou encerre o processo que ocupa a porta. |
| `Could not get BatchedBridge` | Inicie o Metro, execute `adb reverse tcp:8081 tcp:8081` e recarregue o app. |
| `The development server returned response error 500` | Rode o bundle de validacao acima para localizar o modulo quebrado. |
| Usuario nao aparece no Firebase | Confirme que **E-mail/senha** esta ativado e que o cadastro foi feito no projeto correto. |
| `ERR_OSSL_EVP_UNSUPPORTED` | Defina `NODE_OPTIONS=--openssl-legacy-provider`. |

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm start` | Inicia o Metro |
| `npm run android` | Compila e instala no Android |
| `npm test -- --runInBand` | Executa os testes |
| `npm run lint` | Executa o ESLint |
| `npx tsc --noEmit` | Verifica os tipos TypeScript |

## Git

Repositorio remoto:

```text
https://github.com/gsnogueira/react-native.git
```

Fluxo usual:

```powershell
git add .
git commit -m "Descreva a alteracao"
git push
```
