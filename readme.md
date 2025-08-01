# 🔐 Gerador de Carteira Fria (Cold Wallet Generator)

Este projeto é uma aplicação simples para gerar carteiras Ethereum (compatíveis com EVM) de forma segura e offline. Ideal para uso como **carteira fria**, ou seja, **sem conexão com a internet após o uso**, garantindo maior segurança.

## 🚀 Funcionalidades

- Geração de carteira Ethereum e Bitcoin com:
  - Endereço público
  - Chave privada
  - Frase mnemônica (12 palavras)
- Exportação dos dados em um arquivo `.7z` criptografado com senha
- Interface web amigável (local)
- Funciona localmente, sem necessidade de conexão com APIs externas

---

## 🛠️ Tecnologias

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Ethers.js](https://docs.ethers.org/)
- [node-7z](https://www.npmjs.com/package/node-7z) para compactação criptografada
- [7zip-bin](https://www.npmjs.com/package/7zip-bin)
- HTML/CSS/JavaScript no frontend
- Deploy local ou opcional (Discloud, Vercel, etc.)

---
## 📌 Como usar
- Para executar apenas pelo script, alterre a senha no zip.js na constante 'senhaZip'
- node zip.js

- Para utilizar a interface:
- node server.js
- Abra o index.htm (pode abrir diretamente sem servidor), 
- Digite a senha
- Clique em "gerar carteira"
- Faça o download do arquivo.


