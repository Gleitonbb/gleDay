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
        console.log("✅ Banco MySQL Conectado!");
    } catch (err) { 
        console.error("❌ Erro ao conectar no Banco:", err); 
    }
}
conectarBanco();

// --- CONFIGURAÇÃO DA FOTO ---
// Mude este número para trocar a foto que acompanha a história
const FOTO_PARA_HOJE = "03"; 

// 1. ROTA DE ESTATÍSTICAS (Admin)
app.get('/estatisticas', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT quem, COUNT(*) as total FROM acessos GROUP BY quem');
        res.json({ estatisticas: rows });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 2. ROTA QUE GERA O TEXTO COM IA (Admin)
app.post('/preview-texto', async (req, res) => {
    try {
        const { tema } = req.body;
        const seed = Math.floor(Math.random() * 1000000);
        
        // Prompt reforçado para a IA criar uma história e não apenas repetir o tema
        const promptTexto = `escreva uma mensagem descontraida para uma garota que estou conhecendo. tema é: ${tema}. Seja criativo 3 parágrafos. Responda apenas com o texto da mensagem, não invente historias sem nexo.`;
        const prompt = encodeURIComponent(promptTexto);
        
        const respIA = await axios.get(`https://text.pollinations.ai/${prompt}?seed=${seed}`, { timeout: 15000 });

        if (respIA.data) {
            const textoLimpo = respIA.data.toString().trim();
            console.log("🤖 IA gerou um texto de", textoLimpo.length, "caracteres.");
            res.json({ sucesso: true, texto: textoLimpo });
        } else {
            res.status(500).json({ sucesso: false, erro: "IA retornou vazio" });
        }
    } catch (e) { 
        console.error("❌ Erro na IA:", e.message);
        res.status(500).json({ erro: "Falha ao chamar a IA" }); 
    }
});

// 3. ROTA QUE SALVA A HISTÓRIA FINAL (Admin)
app.post('/salvar-historia-aprovada', async (req, res) => {
    try {
        const { texto } = req.body;
        const urlFoto = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_PARA_HOJE}.png?v=${Date.now()}`;
        
        // Limpa a história anterior e salva a nova que a IA criou
        await db.execute('DELETE FROM historias_geradas'); 
        await db.execute('INSERT INTO historias_geradas (texto_historia, caminho_foto) VALUES (?, ?)', [texto, urlFoto]);
        
        console.log("💾 História da IA salva no banco!");
        res.json({ sucesso: true });
    } catch (e) { 
        console.error("❌ Erro ao salvar no Banco:", e.message);
        res.status(500).json({ erro: e.message }); 
    }
});

// 4. ROTA DE REGISTRO DE ACESSO
app.post('/registrar-acesso', async (req, res) => {
    try {
        const { tipo } = req.body;
        await db.execute('INSERT INTO acessos (quem) VALUES (?)', [tipo]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 5. ROTA QUE O SITE DA DAIANE CONSOME (Index)
app.post('/gerar-momento', async (req, res) => {
    try {
        // Busca a última história salva no banco
        const [rows] = await db.execute('SELECT * FROM historias_geradas ORDER BY id DESC LIMIT 1');
        
        if (rows.length > 0) {
            console.log("📖 Enviando história para o site...");
            res.json({ 
                sucesso: true, 
                texto: rows[0].texto_historia, 
                imagem: rows[0].caminho_foto, 
                proximaPostagemEm: 0 // 0 faz o botão "Ver nova história" aparecer na hora
            });
        } else {
            res.json({ sucesso: false, mensagem: "Nenhuma história salva ainda." });
        }
    } catch (e) { 
        console.error("❌ Erro ao buscar momento:", e.message);
        res.status(500).json({ erro: e.message }); 
    }
});

// 6. ROTA PARA FORÇAR LIBERAÇÃO (Botão Laranja do Admin)
app.post('/forcar-liberacao', async (req, res) => {
    res.json({ sucesso: true });
});

app.listen(3000, () => {
    console.log("========================================");
    console.log("🚀 GLEDAY SERVER ONLINE - PORTA 3000");
    console.log("========================================");
});