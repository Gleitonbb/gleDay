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
        console.log("🚀 Iniciando geração baseada na foto real...");

        // 1. URL da sua foto (Ela precisa estar no seu GitHub Pages para a IA enxergar)
        // Substitua 'seu-usuario' pelo seu nome no GitHub
        const urlFotoReal = "https://seu-usuario.github.io/historias-gleiton-daiane/imagem/gleiDay.jpeg";

        // 2. O Prompt agora pede para a IA se basear na foto
        const promptImg = `Based on this photo ${urlFotoReal}, create a romantic cinematic scene of this couple, sunset, highly detailed, realistic, 4k`;
        const seedImg = Math.floor(Math.random() * 1000000);
        
        const urlImagemFinal = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptImg)}?width=1024&height=1024&seed=${seedImg}&nologo=true`;

        // 3. Gera o Texto
        const seedTexto = Math.floor(Math.random() * 1000000);
        const promptTexto = encodeURIComponent("Escreva uma mensagem romântica curta para Gleiton e Daiane. Em português.");
        const respTexto = await axios.get(`https://text.pollinations.ai/${promptTexto}?seed=${seedTexto}`);
        const textoFinal = respTexto.data;

        // 4. SALVA NO BANCO
        await db.execute(
            'INSERT INTO historias_geradas (titulo, conteudo_historia, caminho_foto_1) VALUES (?, ?, ?)',
            ['Nosso Momento Real', textoFinal, urlImagemFinal]
        );

        console.log("✨ Magia concluída usando sua foto como base!");

        res.json({ 
            sucesso: true,
            texto: textoFinal, 
            imagem: urlImagemFinal 
        });

    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: "Erro na geração." });
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