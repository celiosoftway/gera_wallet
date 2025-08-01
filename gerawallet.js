// server.js

const express = require("express");
const fs = require("fs");
const bip39 = require("bip39");
const { Wallet } = require("ethers");
const bitcoin = require("bitcoinjs-lib");
const bip32 = require("bip32");
const Seven = require("node-7z");
const pathTo7zip = require("7zip-bin").path7za;
const cors = require("cors");
const path = require("path");

const app = express();
//const PORT = 3000;
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Serve arquivos estáticos para download da pasta atual
app.use('/downloads', express.static(process.cwd()));

app.post("/api/gerar-carteira", async (req, res) => {
  try {
    const { senha } = req.body;
    if (!senha) return res.status(400).json({ error: "Senha obrigatória" });

    // Gera mnemonic e carteiras
    const mnemonic = bip39.generateMnemonic();
    const ethWallet = Wallet.fromPhrase(mnemonic);
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed);

    // Derivação Bitcoin Legacy
    const legacy = root.derivePath("m/44'/0'/0'/0/0");
    const legacyAddr = bitcoin.payments.p2pkh({
      pubkey: legacy.publicKey,
      network: bitcoin.networks.bitcoin,
    }).address;
    const legacyWIF = legacy.toWIF();

    // Derivação Bitcoin Segwit
    const segwit = root.derivePath("m/84'/0'/0'/0/0");
    const segwitAddr = bitcoin.payments.p2wpkh({
      pubkey: segwit.publicKey,
      network: bitcoin.networks.bitcoin,
    }).address;
    const segwitWIF = segwit.toWIF();

    // Derivação Bitcoin Compatível (P2SH-P2WPKH)
    const compat = root.derivePath("m/49'/0'/0'/0/0");
    const compatAddr = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: compat.publicKey,
        network: bitcoin.networks.bitcoin,
      }),
      network: bitcoin.networks.bitcoin,
    }).address;
    const compatWIF = compat.toWIF();

    const fileName = `${ethWallet.address}.txt`;
    const zipName = `${ethWallet.address}.7z`;

    const conteudo = `=== Carteira Gerada ===

[Ethereum]
Address: ${ethWallet.address}
Private Key: ${ethWallet.privateKey}

[Bitcoin Legacy]
Address: ${legacyAddr}
Private Key (WIF): ${legacyWIF}

[Bitcoin Segwit]
Address: ${segwitAddr}
Private Key (WIF): ${segwitWIF}

[Bitcoin Segwit compatível]
Address: ${compatAddr}
Private Key (WIF): ${compatWIF}

[SEED]
${mnemonic}

Gerado em: ${new Date().toLocaleString()}
`;

    // Salva arquivo texto com dados da carteira
    fs.writeFileSync(fileName, conteudo);

    // Compacta o arquivo .txt em .7z com senha recebida no body
    const zip = Seven.add(zipName, [fileName], {
      $bin: pathTo7zip,
      password: senha,
    });

    zip.on("end", () => {
      // Apaga o arquivo txt após compactar
      fs.unlinkSync(fileName);

      // Retorna dados para o front, inclusive o nome do .7z para download
      res.json({
        ok: true,
        mnemonic,
        eth: ethWallet.address,
        legacy: legacyAddr,
        segwit: segwitAddr,
        compat: compatAddr,
        zip: zipName,
      });
    });

    zip.on("error", (err) => {
      console.error("[X] Erro ao compactar:", err);
      res.status(500).json({ error: "Erro ao compactar arquivo." });
    });
  } catch (e) {
    console.error("[X] Erro:", e);
    res.status(500).json({ error: "Erro ao gerar carteira." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
