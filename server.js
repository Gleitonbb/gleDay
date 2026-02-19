const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456', 
    database: 'sistema_historias' 
};

let db;
async function conectarBanco() {
    try {
        db = await mysql.createPool(dbConfig);
        console.log("✅ Banco Conectado!");
    } catch (err) { console.error(err); }
}
conectarBanco();

const FOTO_PARA_HOJE = "./imagem/gleDay.png"; 

// --- ROTAS DO ADMIN ---

app.get('/estatisticas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT quem, COUNT(*) as total FROM acessos GROUP BY quem');
        const [config] = await db.execute('SELECT * FROM config_atual WHERE id = 1');
        res.json({ estatisticas: rows, config: config[0] });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// Apenas gera o texto para você ler no Admin (Não salva no banco)
app.post('/preview-texto', async (req, res) => {
    try {
        const { tema } = req.body;
        const seed = Math.floor(Math.random() * 1000000);
        const prompt = encodeURIComponent(`Escreva uma mensagem romântica curta e emocionante para Daiane. Tema: ${tema || 'Amor'}. Responda apenas o texto em português, sem links ou anúncios.`);
        const respIA = await axios.get(`https://text.pollinations.ai/${prompt}?seed=${seed}`);
        let textoIA = respIA.data.split("---")[0].split("**Support")[0].trim();
        res.json({ sucesso: true, texto: textoIA });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// Salva o texto que você escolheu no banco
app.post('/salvar-historia-aprovada', async (req, res) => {
    try {
        const { texto } = req.body;
        const urlFoto = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_PARA_HOJE}.jpeg`;
        
        // Remove a última para não acumular lixo se estiver apenas editando a de hoje
        await db.execute('DELETE FROM historias_geradas ORDER BY data_criacao DESC LIMIT 1');
        
        await db.execute('INSERT INTO historias_geradas (texto_historia, caminho_foto) VALUES (?, ?)', [texto, urlFoto]);
        res.json({ sucesso: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/forcar-liberacao', async (req, res) => {
    try {
        await db.execute('DELETE FROM historias_geradas ORDER BY data_criacao DESC LIMIT 1');
        res.json({ sucesso: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/registrar-acesso', async (req, res) => {
    try {
        const { tipo } = req.body;
        await db.execute('INSERT INTO acessos (quem) VALUES (?)', [tipo]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// --- ROTA DA DAIANE (A FARSA) ---
app.post('/gerar-momento', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM historias_geradas ORDER BY data_criacao DESC LIMIT 1');
        const agora = new Date();
        const horasAtuais = agora.getHours();
        const proximaJanelaH = Math.ceil((horasAtuais + 0.1) / 8) * 8;
        const dataAlvo = new Date();
        dataAlvo.setHours(proximaJanelaH % 24, 0, 0, 0);
        if (proximaJanelaH >= 24) dataAlvo.setDate(dataAlvo.getDate() + 1);
        const tempoFalsoMs = dataAlvo - agora;

        if (rows.length > 0) {
            return res.json({ 
                sucesso: true, 
                texto: rows[0].texto_historia, 
                imagem: rows[0].caminho_foto, 
                jaExistia: true,
                proximaPostagemEm: tempoFalsoMs 
            });
        }
        res.json({ sucesso: false, erro: "Nenhuma história disponível." });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.listen(3000, () => console.log("🚀 Servidor GleDay Online!"));