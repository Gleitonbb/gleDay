const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DO BANCO DE DADOS ---
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
        console.log("✅ Banco MySQL Conectado com Sucesso!");
    } catch (err) { 
        console.error("❌ Erro ao conectar no banco:", err); 
    }
}
conectarBanco();

// --- CONFIGURAÇÃO DE IMAGEM ---
// Aqui você define qual foto será usada (Ex: "04" para gleDay04.png)
const FOTO_PARA_HOJE = "04"; 

// --- ROTAS DO ADMIN (PAINEL DE CONTROLE) ---

// 1. Estatísticas de acesso
app.get('/estatisticas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT quem, COUNT(*) as total FROM acessos GROUP BY quem');
        const [config] = await db.execute('SELECT * FROM config_atual WHERE id = 1');
        res.json({ estatisticas: rows, config: config[0] });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 2. Apenas gera o texto para você ler no Admin (Não salva no banco ainda)
app.post('/preview-texto', async (req, res) => {
    try {
        const { tema } = req.body;
        const seed = Math.floor(Math.random() * 1000000);
        // Prompt otimizado para a Daiane
        const prompt = encodeURIComponent(`Escreva uma mensagem romântica curta e emocionante para minha esposa Daiane. Tema: ${tema || 'Amor'}. Responda apenas o texto em português, sem links, hashtags ou anúncios.`);
        
        const respIA = await axios.get(`https://text.pollinations.ai/${prompt}?seed=${seed}`);
        let textoIA = respIA.data.split("---")[0].split("**Support")[0].trim();
        
        res.json({ sucesso: true, texto: textoIA });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 3. Salva a história que você aprovou no banco
app.post('/salvar-historia-aprovada', async (req, res) => {
    try {
        const { texto } = req.body;
        
        // Montagem correta da URL da imagem com timestamp para evitar cache do navegador
        const urlFoto = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_PARA_HOJE}.png?v=${Date.now()}`;
        
        // Remove a última história para que a nova aprovada tome o lugar
        await db.execute('DELETE FROM historias_geradas ORDER BY data_criacao DESC LIMIT 1');
        
        // Insere a nova história aprovada por você
        await db.execute('INSERT INTO historias_geradas (texto_historia, caminho_foto) VALUES (?, ?)', [texto, urlFoto]);
        
        res.json({ sucesso: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 4. Força a liberação (Apaga o registro para o site entender que deve mostrar o botão)
app.post('/forcar-liberacao', async (req, res) => {
    try {
        await db.execute('DELETE FROM historias_geradas ORDER BY data_criacao DESC LIMIT 1');
        res.json({ sucesso: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 5. Registra quem acessou (Daiane ou Admin)
app.post('/registrar-acesso', async (req, res) => {
    try {
        const { tipo } = req.body;
        await db.execute('INSERT INTO acessos (quem) VALUES (?)', [tipo]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// --- ROTA DA DAIANE (LOGICA DE EXIBIÇÃO E FARSA) ---

app.post('/gerar-momento', async (req, res) => {
    try {
        // Busca a última história no banco
        const [rows] = await db.execute('SELECT * FROM historias_geradas ORDER BY data_criacao DESC LIMIT 1');
        
        const agora = new Date();
        const horasAtuais = agora.getHours();
        
        // LÓGICA DA FARSA: Calcula o tempo até a próxima janela de 8 horas (08h, 16h, 00h)
        const proximaJanelaH = Math.ceil((horasAtuais + 0.1) / 8) * 8;
        const dataAlvo = new Date();
        dataAlvo.setHours(proximaJanelaH % 24, 0, 0, 0);
        
        // Se a próxima janela for 24h, ajusta para o dia seguinte
        if (proximaJanelaH >= 24) dataAlvo.setDate(dataAlvo.getDate() + 1);
        
        const tempoFalsoMs = dataAlvo - agora;

        if (rows.length > 0) {
            // Se já existe história, envia os dados e o tempo para o cronômetro aparecer
            return res.json({ 
                sucesso: true, 
                texto: rows[0].texto_historia, 
                imagem: rows[0].caminho_foto, 
                jaExistia: true,
                proximaPostagemEm: tempoFalsoMs 
            });
        }
        
        // Se o banco estiver vazio, retorna erro (para você gerar no Admin)
        res.json({ sucesso: false, erro: "Nenhuma história disponível. Gere uma no Admin!" });

    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// --- INICIALIZAÇÃO ---
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`
    -------------------------------------------
    🚀 Servidor GleDay Rodando na porta ${PORTA}
    📸 Foto configurada: gleDay${FOTO_PARA_HOJE}.png
    ❤️  Tudo pronto para surpreender a Daiane!
    -------------------------------------------
    `);
});