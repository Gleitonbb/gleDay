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
app.post('/gerar-momento', async (req, res) => {
    try {
        console.log("🚀 Buscando imagem oculta no GitHub...");

        // 1. Sorteio para teste (entre 01 e 03 - ajuste se tiver mais fotos)
        const numeroSorteado = Math.floor(Math.random() * 3) + 1; 
        const numeroFoto = String(numeroSorteado).padStart(2, '0');
        
        // Usando o link RAW para garantir que a imagem apareça sem erro 404
        const urlImagemLocal = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${numeroFoto}.jpeg`;
        
        console.log(`📸 Revelando a foto: gleDay${numeroFoto}.jpeg`);

        // 2. IA de Texto
        const seedTexto = Math.floor(Math.random() * 1000000);
        const promptTexto = encodeURIComponent(`Escreva uma mensagem romântica curta e emocionante para Gleiton e Daiane. Em português.`);
        const respTexto = await axios.get(`https://text.pollinations.ai/${promptTexto}?seed=${seedTexto}`);
        const textoGerado = respTexto.data;

        // 3. Salva no Banco
        await db.execute(
            'INSERT INTO historias_geradas (titulo, conteudo_historia, caminho_foto_1) VALUES (?, ?, ?)',
            [`Teste Surpresa ${numeroFoto}`, textoGerado, urlImagemLocal]
        );

        res.json({ 
            sucesso: true,
            texto: textoGerado, 
            imagem: urlImagemLocal 
        });

    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: "Erro ao revelar imagem." });
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