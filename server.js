/*

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
const FOTO_PARA_HOJE = "08"; 

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
        const promptTexto = `escreva uma mensagem descontraida para uma garota que estou conhecendo. tema é: ${tema}. Seja criativo 3 parágrafos. Responda apenas com o texto da mensagem. não quero historias de corte de cabelo`;
        const prompt = encodeURIComponent(promptTexto);
        
        const respIA = await axios.get(`https://text.pollinations.ai/${prompt}?seed=${seed}`, { timeout: 15000 });

        if (respIA.data) {
            res.json({ sucesso: true, texto: respIA.data.toString().trim() });
        } else {
            res.status(500).json({ sucesso: false, erro: "IA retornou vazio" });
        }
    } catch (e) { 
        res.status(500).json({ erro: "Falha ao chamar a IA" }); 
    }
});

// 3. ROTA QUE SALVA A NOVA HISTÓRIA E ARQUIVA A ANTIGA (Modificada)
app.post('/salvar-historia-aprovada', async (req, res) => {
    try {
        const { texto } = req.body;
        const urlFoto = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_PARA_HOJE}.png?v=${Date.now()}`;
        
        // PASSO A: Buscar a história que está ativa agora
        const [ativas] = await db.execute('SELECT * FROM historias_geradas LIMIT 1');
        
        if (ativas.length > 0) {
            // PASSO B: Mover a história ativa para a tabela de arquivo (Baú)
            await db.execute(
                'INSERT INTO historias_arquivo (texto, imagem) VALUES (?, ?)', 
                [ativas[0].texto_historia, ativas[0].caminho_foto]
            );
            console.log("📦 História anterior movida para o Baú!");
        }

        // PASSO C: Limpar a principal e salvar a nova
        await db.execute('DELETE FROM historias_geradas'); 
        await db.execute('INSERT INTO historias_geradas (texto_historia, caminho_foto) VALUES (?, ?)', [texto, urlFoto]);
        
        console.log("💾 Nova história salva na página principal!");
        res.json({ sucesso: true });
    } catch (e) { 
        console.error("❌ Erro ao processar salvamento:", e.message);
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

// 5. ROTA QUE O SITE DA DAIANE CONSOME (Página Principal)
app.post('/gerar-momento', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM historias_geradas ORDER BY id DESC LIMIT 1');
        if (rows.length > 0) {
            res.json({ 
                sucesso: true, 
                texto: rows[0].texto_historia, 
                imagem: rows[0].caminho_foto, 
                proximaPostagemEm: 0 
            });
        } else {
            res.json({ sucesso: false, mensagem: "Nenhuma história salva ainda." });
        }
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 6. ROTA PARA FORÇAR LIBERAÇÃO
app.post('/forcar-liberacao', async (req, res) => {
    res.json({ sucesso: true });
});

// 7. NOVA ROTA: BUSCAR O HISTÓRICO COMPLETO (Para a página historias.html)
app.get('/obter-historico', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM historias_arquivo ORDER BY id DESC');
        res.json({ sucesso: true, historico: rows });
    } catch (e) { 
        console.error("❌ Erro ao buscar arquivo:", e.message);
        res.status(500).json({ erro: e.message }); 
    }
});

app.listen(3000, () => {
    console.log("========================================");
    console.log("🚀 GLEDAY SERVER ONLINE - PORTA 3000");
    console.log("========================================");
});
*/

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
        console.log("✅ Banco MySQL Conectado!");
    } catch (err) { console.error("❌ Erro no Banco:", err); }
}
conectarBanco();

const FOTO_PARA_HOJE = "08"; 

// 1. ESTATÍSTICAS COM HORÁRIOS
app.get('/estatisticas', async (req, res) => {
    try {
        const [totais] = await db.execute('SELECT quem, COUNT(*) as total FROM acessos GROUP BY quem');
        const [recentes] = await db.execute(
            'SELECT data_acesso FROM acessos WHERE quem = "daiane" ORDER BY data_acesso DESC LIMIT 10'
        );
        res.json({ estatisticas: totais, recentes: recentes });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 2. GERAR TEXTO IA
app.post('/preview-texto', async (req, res) => {
    try {
        const { tema } = req.body;
        const seed = Math.floor(Math.random() * 1000000);
        const prompt = encodeURIComponent(`escreva uma mensagem descontraida para uma garota. tema: ${tema}. 3 parágrafos.`);
        const respIA = await axios.get(`https://text.pollinations.ai/${prompt}?seed=${seed}`);
        res.json({ sucesso: true, texto: respIA.data.toString().trim() });
    } catch (e) { res.status(500).json({ erro: "Erro na IA" }); }
});

// 3. SALVAR E ARQUIVAR ANTIGA
app.post('/salvar-historia-aprovada', async (req, res) => {
    try {
        const { texto } = req.body;
        const urlFoto = `https://raw.githubusercontent.com/gleitonbb/gleDay/main/imagem/gleDay${FOTO_PARA_HOJE}.png?v=${Date.now()}`;
        
        const [ativas] = await db.execute('SELECT * FROM historias_geradas LIMIT 1');
        if (ativas.length > 0) {
            await db.execute('INSERT INTO historias_arquivo (texto, imagem) VALUES (?, ?)', 
            [ativas[0].texto_historia, ativas[0].caminho_foto]);
        }

        await db.execute('DELETE FROM historias_geradas'); 
        await db.execute('INSERT INTO historias_geradas (texto_historia, caminho_foto) VALUES (?, ?)', [texto, urlFoto]);
        res.json({ sucesso: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 4. REGISTRAR ACESSO (Onde o horário é salvo)
app.post('/registrar-acesso', async (req, res) => {
    try {
        const { tipo } = req.body;
        await db.execute('INSERT INTO acessos (quem) VALUES (?)', [tipo]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 5. BUSCAR MOMENTO (Index)
app.post('/gerar-momento', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM historias_geradas ORDER BY id DESC LIMIT 1');
        if (rows.length > 0) {
            res.json({ sucesso: true, texto: rows[0].texto_historia, imagem: rows[0].caminho_foto, proximaPostagemEm: 0 });
        } else { res.json({ sucesso: false }); }
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// 6. BUSCAR HISTÓRICO (Galeria)
app.get('/obter-historico', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM historias_arquivo ORDER BY id DESC');
        res.json({ sucesso: true, historico: rows });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.listen(3000, () => console.log("🚀 SERVER ON - PORTA 3000"));