const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. CONFIGURAÇÃO DO BANCO DE DATAS ---
const dbConfig = {
    host: 'localhost',
    user: 'root',      // substitua se seu usuário for diferente
    password: '123456',      // coloque sua senha do MySQL
    database: 'sua_base_de_dados' // coloque o nome do seu banco
};

let db;
async function conectarBanco() {
    try {
        db = await mysql.createPool(dbConfig);
        console.log("✅ Banco de Dados conectado com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao conectar ao banco:", err.message);
    }
}
conectarBanco();

// --- 2. CONFIGURAÇÃO MANUAL DA SURPRESA ---
// Altere aqui sempre que quiser mudar a surpresa da Daiane
const FOTO_DO_DIA = "./imagem/gleDay02.jpeg"; 
const TEMA_DO_TEXTO = "o dia que você dayane deixou eu te vizitasse pela primeira vez no intervalo do seu trabalho";

// --- 3. ROTA PRINCIPAL ---
app.post('/gerar-momento', async (req, res) => {
    try {
        const hoje = new Date().toISOString().split('T')[0];

        // VERIFICAÇÃO: Já existe uma história para hoje?
        const [rows] = await db.execute(
            'SELECT * FROM historias_geradas WHERE DATE(data_criacao) = ? LIMIT 1',
            [hoje]
        );

        if (rows.length > 0) {
            console.log("📌 Recuperando história já existente no banco.");
            return res.json({ 
                sucesso: true,
                texto: rows[0].conteudo_historia, 
                imagem: rows[0].caminho_foto_1,
                jaExistia: true 
            });
        }

        // SE NÃO EXISTE: Vamos criar uma nova!
        console.log(`🎬 Criando nova surpresa com a foto gleDay${FOTO_DO_DIA}.jpeg...`);

        // Link RAW direto do seu GitHub (Branch main)
        const urlImagemLocal = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_DO_DIA}.jpeg`;

        // IA de Texto (Pollinations) usando seu tema manual
        const seedTexto = Math.floor(Math.random() * 1000000);
        const promptTexto = encodeURIComponent(`Escreva uma mensagem romântica, curta, poética e muito emocionante para Gleiton e Daiane. Tema: ${TEMA_DO_TEXTO}. Em português.`);
        
        const respTexto = await axios.get(`https://text.pollinations.ai/${promptTexto}?seed=${seedTexto}`);
        const textoGerado = respTexto.data;

        // SALVAR NO BANCO: Para garantir que ela veja a mesma coisa o dia todo
        await db.execute(
            'INSERT INTO historias_geradas (titulo, conteudo_historia, caminho_foto_1) VALUES (?, ?, ?)',
            [`Momento Especial ${FOTO_DO_DIA}`, textoGerado, urlImagemLocal]
        );

        res.json({ 
            sucesso: true,
            texto: textoGerado, 
            imagem: urlImagemLocal,
            jaExistia: false
        });

    } catch (error) {
        console.error("❌ Erro no servidor:", error.message);
        res.status(500).json({ error: "Erro ao preparar a surpresa." });
    }
});

// --- Rota para registrar acessos ---
app.post('/registrar-acesso', async (req, res) => {
    const { tipo } = req.body; // 'admin' ou 'daiane'
    await db.execute('INSERT INTO acessos (quem) VALUES (?)', [tipo]);
    res.json({ ok: true });
});

// --- Rota para buscar estatísticas ---
app.get('/estatisticas', async (req, res) => {
    const [rows] = await db.execute(
        'SELECT quem, COUNT(*) as total FROM acessos GROUP BY quem'
    );
    const [config] = await db.execute('SELECT * FROM config_atual WHERE id = 1');
    res.json({ estatisticas: rows, config: config[0] });
});

// --- Rota para atualizar a configuração (via Painel) ---
app.post('/atualizar-config', async (req, res) => {
    const { foto, tema } = req.body;
    await db.execute('UPDATE config_atual SET foto_ativa = ?, tema_texto = ? WHERE id = 1', [foto, tema]);
    res.json({ sucesso: true });
});

// --- AJUSTE NA ROTA DE GERAR MOMENTO ---
// Agora ele busca do banco o que você digitou no painel!
app.post('/gerar-momento', async (req, res) => {
    // ... dentro do try ...
    const [config] = await db.execute('SELECT * FROM config_atual WHERE id = 1');
    const FOTO_DO_DIA = config[0].foto_ativa;
    const TEMA_DO_TEXTO = config[0].tema_texto;
    // ... resto do código igual ao anterior ...
});

// --- 4. INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🔗 Use o Ngrok para expor esta porta: ngrok http ${PORT}`);
});