const fs = require("fs");
const bip39 = require("bip39");
const { Wallet } = require("ethers");
const bitcoin = require("bitcoinjs-lib");
const bip32 = require("bip32");
const Seven = require("node-7z");
const pathTo7zip = require("7zip-bin").path7za;

const senhaZip = "sua_senha";

async function criarCarteiraECompactar() {
  // Gerar frase mnemônica
  const mnemonic = bip39.generateMnemonic();

  // Carteira Ethereum
  const ethWallet = Wallet.fromPhrase(mnemonic);

  // Carteira Bitcoin 
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);
  
	// LEGACY (P2PKH - começa com "1")
	const pathLegacy = "m/44'/0'/0'/0/0";
	const childLegacy = root.derivePath(pathLegacy);
	const addressLegacy = bitcoin.payments.p2pkh({
	  pubkey: childLegacy.publicKey,
	  network: bitcoin.networks.bitcoin,
	}).address;
	const privateKeyBTCLegacy = childLegacy.toWIF();

	// SEGWIT NATIVO (P2WPKH - começa com "bc1")
	const pathSegwit = "m/84'/0'/0'/0/0";
	const childSegwit = root.derivePath(pathSegwit);
	const addressSegwit = bitcoin.payments.p2wpkh({
	  pubkey: childSegwit.publicKey,
	  network: bitcoin.networks.bitcoin,
	}).address;
	const privateKeyBTCSegwit = childSegwit.toWIF();

	// SEGWIT COMPATÍVEL (P2SH-P2WPKH - começa com "3")
	const pathCompat = "m/49'/0'/0'/0/0";
	const childCompat = root.derivePath(pathCompat);
	const { address: addressCompat } = bitcoin.payments.p2sh({
	  redeem: bitcoin.payments.p2wpkh({
		pubkey: childCompat.publicKey,
		network: bitcoin.networks.bitcoin,
	  }),
	  network: bitcoin.networks.bitcoin,
	});
   const privateKeyBTCCompat = childCompat.toWIF();


  // Criar conteúdo
  const fileName = `${ethWallet.address}.txt`;
  const zipName = `${ethWallet.address}.7z`;

  const conteudo = `=== Carteira Gerada ===

[Ethereum]
Address: ${ethWallet.address}
Private Key: ${ethWallet.privateKey}

[Bitcoin Legacy]
Address: ${addressLegacy}
Private Key (WIF): ${privateKeyBTCLegacy}

[Bitcoin Segwit]
Address: ${addressSegwit}
Private Key (WIF): ${privateKeyBTCSegwit}

[Bitcoin Segwit compativel]
Address: ${addressCompat}
Private Key (WIF): ${privateKeyBTCCompat}

[SEED]
${mnemonic}

Gerado em: ${new Date().toLocaleString()}
`;

  fs.writeFileSync(fileName, conteudo);
  console.log(`[✓] Arquivo .txt criado: ${fileName}`);

  const zip = Seven.add(zipName, [fileName], {
    $bin: pathTo7zip,
    password: senhaZip,
  });

  zip.on("end", () => {
    console.log(`[✓] Arquivo .7z com senha criado: ${zipName}`);
    fs.unlinkSync(fileName);
    console.log(`[✓] Arquivo .txt original apagado por segurança.`);
  });

  zip.on("error", (err) => {
    console.error("[X] Erro ao compactar:", err);
  });
}

criarCarteiraECompactar();
