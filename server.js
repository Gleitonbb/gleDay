require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// Conexão com o seu MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use(cors());
app.use(express.json());

// --- MONITORAMENTO ---
app.get('/log-acesso', async (req, res) => {
    try {
        await db.execute('INSERT INTO monitoramento (tipo_evento) VALUES (?)', ['VISUALIZOU_SITE']);
        console.log("✅ Ela abriu o site!");
        res.sendStatus(200);
    } catch (err) { res.sendStatus(500); }
});

app.post('/registrar-clique-botao', async (req, res) => {
    try {
        await db.execute('INSERT INTO monitoramento (tipo_evento) VALUES (?)', ['CLICOU_BOTAO']);
        console.log("🖱️ Ela clicou no botão!");
        res.sendStatus(200);
    } catch (err) { res.sendStatus(500); }
});

// --- GERAÇÃO DO MOMENTO ---

app.post('/gerar-momento', async (req, res) => {
    try {
        console.log("🧪 MODO TESTE: Sorteando imagem da pasta...");

        // 1. SORTEIO DE TESTE: Sorteia um número entre 01 e 04 (ou a quantidade que você tiver)
        // Mude o '4' para a quantidade de fotos que você já subiu na pasta imagem
        const numeroSorteado = Math.floor(Math.random() * 4) + 1; 
        const numeroFoto = String(numeroSorteado).padStart(2, '0');
        
        const urlImagemLocal = `https://gleitonbb.github.io/gleDay/imagem/gleDay${numeroFoto}.jpeg`;
        console.log(`📸 Usando imagem: gleDay${numeroFoto}.jpeg`);

        // 2. GERAÇÃO DE TEXTO (IA continua ativa)
        const seedTexto = Math.floor(Math.random() * 1000000);
        const promptTexto = encodeURIComponent(`Escreva uma mensagem romântica curta e inédita para Gleiton e Daiane. Em português.`);
        const respTexto = await axios.get(`https://text.pollinations.ai/${promptTexto}?seed=${seedTexto}`);
        const textoGerado = respTexto.data;

        // 3. SALVA NO BANCO (Apenas para registro, sem travar o dia)
        await db.execute(
            'INSERT INTO historias_geradas (titulo, conteudo_historia, caminho_foto_1) VALUES (?, ?, ?)',
            [`Teste Foto ${numeroFoto}`, textoGerado, urlImagemLocal]
        );

        // Retorna SEM a trava de "jaExistia" para você testar várias vezes
        res.json({ 
            sucesso: true,
            texto: textoGerado, 
            imagem: urlImagemLocal,
            jaExistia: false 
        });

    } catch (error) {
        console.error("❌ Erro no teste:", error.message);
        res.status(500).json({ error: "Erro ao testar." });
    }
});
app.listen(port, () => {
    console.log(`
    =================================================
      SERVIDOR PRONTO E SINCRONIZADO COM O BANCO
      Aguardando por Daiane...
    =================================================
    `);
});