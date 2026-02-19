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

const FOTO_PARA_HOJE = "./imagem/gleDay04.jpeg"; 

// --- ROTAS ADMIN ---
app.post('/registrar-acesso', async (req, res) => {
    try {
        const { tipo } = req.body;
        await db.execute('INSERT INTO acessos (quem) VALUES (?)', [tipo]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.get('/estatisticas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT quem, COUNT(*) as total FROM acessos GROUP BY quem');
        const [config] = await db.execute('SELECT * FROM config_atual WHERE id = 1');
        res.json({ estatisticas: rows, config: config[0] });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/atualizar-config', async (req, res) => {
    try {
        const { tema } = req.body;
        await db.execute('UPDATE config_atual SET tema_texto = ? WHERE id = 1', [tema]);
        res.json({ sucesso: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// --- ROTA DA DAIANE (Com Trava de 24h e Cronômetro) ---
// ... (mantenha o topo igual)

// --- ROTA DA DAIANE (Corrigida para data_criacao) ---
app.post('/gerar-momento', async (req, res) => {
    try {
        // 1. Busca a última história usando o nome real da sua coluna: data_criacao
        const [rows] = await db.execute('SELECT * FROM historias_geradas ORDER BY data_criacao DESC LIMIT 1');
        
        const agora = new Date();
        
        if (rows.length > 0) {
            const ultimaData = new Date(rows[0].data_criacao); // Nome da sua coluna no banco
            const proximaData = new Date(ultimaData.getTime() + (8 * 60 * 60 * 1000));
            const tempoRestante = proximaData - agora;

            if (tempoRestante > 0) {
                return res.json({ 
                    sucesso: true, 
                    texto: rows[0].texto_historia, 
                    imagem: rows[0].caminho_foto, 
                    jaExistia: true,
                    proximaPostagemEm: tempoRestante 
                });
            }
        }

        // 2. Se não tem trava, gera uma nova
        const [config] = await db.execute('SELECT tema_texto FROM config_atual WHERE id = 1');
        const temaIA = config[0] ? config[0].tema_texto : "Amor";
        const urlFoto = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_PARA_HOJE}.jpeg`;

        const seed = Math.floor(Math.random() * 1000000);
        const prompt = encodeURIComponent(`Mensagem romântica curta para Daiane. Tema: ${temaIA}. Sem anúncios.`);
        const respIA = await axios.get(`https://text.pollinations.ai/${prompt}?seed=${seed}`);
        let textoFinal = respIA.data.split("---")[0].split("**Support")[0].trim();

        // Salva com data_criacao automático do banco
        await db.execute('INSERT INTO historias_geradas (texto_historia, caminho_foto) VALUES (?, ?)', [textoFinal, urlFoto]);

        res.json({ sucesso: true, texto: textoFinal, imagem: urlFoto, jaExistia: false });

    } catch (e) { 
        console.error(e);
        res.status(500).json({ erro: e.message }); 
    }
});

app.listen(3000, () => console.log("🚀 Server rodando na porta 3000!"));
app.listen(3000, () => console.log("🚀 Server rodando!"));