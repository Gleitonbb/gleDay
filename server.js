const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. CONFIGURAÇÃO DO BANCO DE DADOS ---
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
        console.log("✅ Conectado ao banco sistema_historias!");
    } catch (err) {
        console.error("❌ Erro ao conectar ao banco:", err.message);
    }
}
conectarBanco();

// --- 2. CONFIGURAÇÃO MANUAL DA FOTO ---
// Altere apenas o número (ex: "01", "05")
const FOTO_PARA_HOJE = "01"; 

// --- 3. ROTAS DO ADMIN E MONITORAMENTO ---

// Registrar acessos (index e admin)
app.post('/registrar-acesso', async (req, res) => {
    try {
        const { tipo } = req.body; // 'admin' ou 'daiane'
        await db.execute('INSERT INTO acessos (quem) VALUES (?)', [tipo]);
        res.json({ ok: true });
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
});

// Estatísticas para o Painel
app.get('/estatisticas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT quem, COUNT(*) as total FROM acessos GROUP BY quem');
        const [config] = await db.execute('SELECT * FROM config_atual WHERE id = 1');
        res.json({ estatisticas: rows, config: config[0] });
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
});

// Atualizar Tema
app.post('/atualizar-config', async (req, res) => {
    try {
        const { tema } = req.body;
        await db.execute('UPDATE config_atual SET tema_texto = ? WHERE id = 1', [tema]);
        res.json({ sucesso: true });
    } catch (e) { 
        res.status(500).json({ erro: e.message }); 
    }
});

// --- 4. ROTA PRINCIPAL (GERADOR DE SURPRESAS) ---

app.post('/gerar-momento', async (req, res) => {
    try {
        console.log("🎬 Iniciando geração de momento...");

        // A. Busca o TEMA definido no Admin
        const [config] = await db.execute('SELECT tema_texto FROM config_atual WHERE id = 1');
        const temaIA = config[0] ? config[0].tema_texto : "Nossa união e felicidade";

        // B. Monta a URL da imagem no GitHub
        const urlFoto = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_PARA_HOJE}.jpeg`;

        // C. Prepara o Prompt (Instrução rígida para evitar Ads)
        const seed = Math.floor(Math.random() * 1000000);
        const promptComando = `Escreva APENAS uma mensagem romântica muito curta e emocionante para Daiane. Tema: ${temaIA}. Não inclua links, não inclua avisos de 'Support Pollinations' e não inclua anúncios. Responda apenas o texto da mensagem em português.`;
        const promptEncoded = encodeURIComponent(promptComando);
        
        // D. Chama a IA
        const respIA = await axios.get(`https://text.pollinations.ai/${promptEncoded}?seed=${seed}`);
        let textoFinal = respIA.data;

        // E. FILTRO EXTRA (Corte de segurança para limpar propagandas)
        // Se a IA ignorar o comando e mandar o Ad, o código corta aqui.
        if (textoFinal.includes("---")) {
            textoFinal = textoFinal.split("---")[0];
        }
        if (textoFinal.includes("**Support")) {
            textoFinal = textoFinal.split("**Support")[0];
        }
        if (textoFinal.includes("🌸")) {
            textoFinal = textoFinal.split("🌸")[0];
        }
        textoFinal = textoFinal.trim();

        // F. Salva no banco de dados (Histórico)
        await db.execute(
            'INSERT INTO historias_geradas (texto_historia, caminho_foto) VALUES (?, ?)', 
            [textoFinal, urlFoto]
        );

        // G. Responde para o site (Modo teste: jaExistia sempre false)
        res.json({ 
            sucesso: true, 
            texto: textoFinal, 
            imagem: urlFoto, 
            jaExistia: false 
        });

    } catch (e) { 
        console.error("❌ Erro no Servidor:", e.message);
        res.status(500).json({ erro: "Erro ao criar surpresa." }); 
    }
});

// --- 5. INICIALIZAÇÃO ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`🚀 SERVIDOR GLEDAY ONLINE NA PORTA ${PORT}`);
    console.log(`📡 URL NGROK: https://lingually-categorical-latisha.ngrok-free.dev/`);
    console.log(`==========================================\n`);
});