# Finance App

Aplicativo mobile de gerenciamento financeiro em React Native 0.66. O fluxo inclui autenticacao Firebase, dashboard, CRUD de transacoes, filtros, paginacao, animacao com `Animated` e anexos de recibos.

## Funcionalidades

- Login e criacao de conta.
- Context API para estado global de autenticacao e transacoes.
- Dashboard com saldo, entradas, saidas e fluxo visual animado.
- Lista com busca, filtro por categoria e paginacao incremental.
- Criacao, edicao e exclusao de transacoes.
- Validacao de valor, titulo e data.
- Selecao de imagens/PDF como recibos.
- Firebase Authentication com login e cadastro por e-mail e senha.

## Requisitos

- Node.js 20 LTS recomendado para o React Native 0.66. Em Node mais novo, use `NODE_OPTIONS=--openssl-legacy-provider`.
- Android Studio, Android SDK e um AVD com imagem Android normal (4 KB).
- JDK 11 para o Gradle desta versao do React Native.
- Um emulador Android iniciado ou um dispositivo conectado via ADB.

## Instalar e executar

```powershell
npm install
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start -- --reset-cache
```

Em outro terminal:

```powershell
npm run android
```

No Windows, configure `JAVA_HOME` para o JDK 11 e `ANDROID_HOME`/`ANDROID_SDK_ROOT` para o SDK local. Se o Metro ja estiver rodando na porta `8081`, reutilize-o em vez de iniciar outro.

Exemplo de configuracao temporaria no PowerShell:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.32.101-hotspot"
$env:ANDROID_SDK_ROOT="$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_HOME=$env:ANDROID_SDK_ROOT
$env:NODE_OPTIONS="--openssl-legacy-provider"
```

## Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative Authentication > Sign-in method > Email/Password.
3. Registre um aplicativo Web e copie a configuracao.
4. Atualize `firebaseConfig` em `src/app/FinanceContext.tsx`.

```ts
export const firebaseConfig = {
  apiKey: '...',
  authDomain: 'seu-projeto.firebaseapp.com',
  projectId: 'seu-projeto',
  storageBucket: 'seu-projeto.appspot.com',
  messagingSenderId: '...',
  appId: '...',
};
```

O app consulta `transactions` no Firestore filtrando por `userId` e ordenando por `date`. Regras iniciais para desenvolvimento:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read, create, update, delete: if request.auth != null
        && (resource.data.userId == request.auth.uid
          || request.resource.data.userId == request.auth.uid);
    }
  }
}
```

Para Storage, restrinja os arquivos ao usuario autenticado:

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

O provedor de Authentication precisa estar ativado antes de testar o cadastro:

**Authentication > Método de login > E-mail/senha > Ativar**

O `applicationId` Android é `com.myreactnativeappnative`. O arquivo `android/app/google-services.json` e arquivos de build locais ficam ignorados pelo Git.

## Estrutura principal

- `src/app/FinanceContext.tsx`: autenticacao Firebase e armazenamento local das transacoes.
- `src/app/screens/AuthScreen.tsx`: login e cadastro.
- `src/app/screens/DashboardScreen.tsx`: analise financeira e animacao.
- `src/app/screens/TransactionsScreen.tsx`: busca, filtros e paginacao.
- `src/app/screens/TransactionFormScreen.tsx`: validacao, CRUD e recibos.

## Validacao

```powershell
npx tsc --noEmit
npm test -- --runInBand
```

## Git

Depois de configurar um remoto, o fluxo inicial é:

```powershell
git init
git add .
git commit -m "Initial React Native finance app"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```
