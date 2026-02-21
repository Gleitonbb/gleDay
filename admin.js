//TRUNCATE TABLE acessos;

const API = "https://lingually-categorical-latisha.ngrok-free.dev/";

// Cabeçalhos padrão para todas as requisições
const HEADERS_PADRAO = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
};

/**
 * 1. GERAR TEXTO COM IA
 */
async function refazerTexto() {
    const temaInput = document.getElementById('input-tema');
    const outputIA = document.getElementById('output-ia');
    const containerPreview = document.getElementById('container-preview');
    
    const tema = temaInput.value;
    const btn = event.target; 
    
    if (!tema) {
        alert("⚠️ Digite um tema primeiro!");
        return;
    }

    btn.innerText = "IA pensando... ⏳";
    btn.disabled = true;

    try {
        const resp = await fetch(API + 'preview-texto', {
            method: 'POST',
            headers: HEADERS_PADRAO,
            body: JSON.stringify({ tema })
        });
        
        const data = await resp.json();
        
        if(data.sucesso) {
            outputIA.value = data.texto; 
            containerPreview.style.display = "block"; // Mostra a div de resultado
            containerPreview.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("❌ Erro da IA: " + (data.erro || "Tente outro tema."));
        }
    } catch (e) { 
        console.error(e);
        alert("Erro ao conectar com o servidor. Verifique o terminal."); 
    } finally {
        btn.innerText = "🔄 Gerar Texto com IA";
        btn.disabled = false;
    }
}

/**
 * 2. SALVAR NO BANCO DE DADOS
 */
async function salvarConfig() {
    const textoFinal = document.getElementById('output-ia').value;

    if (!textoFinal || textoFinal.length < 5) {
        alert("⚠️ O texto gerado está vazio!");
        return;
    }

    try {
        const resp = await fetch(API + 'salvar-historia-aprovada', {
            method: 'POST',
            headers: HEADERS_PADRAO,
            body: JSON.stringify({ texto: textoFinal })
        });
        
        const data = await resp.json();
        if(data.sucesso) {
            alert("✅ Sucesso! História salva para a Daiane.");
            document.getElementById('container-preview').style.display = "none";
        }
    } catch (e) { 
        alert("Erro ao salvar: " + e.message); 
    }
}

/**
 * 3. LIBERAR SURPRESA AGORA
 */
async function liberarNovaHistoria() {
    if(!confirm("Deseja liberar a visualização agora?")) return;

    try {
        const resp = await fetch(API + 'forcar-liberacao', {
            method: 'POST',
            headers: HEADERS_PADRAO
        });
        const data = await resp.json();
        if(data.sucesso) alert("🚀 Botão liberado para ela!");
    } catch (e) {
        alert("Erro: " + e.message);
    }
}

/**
 * 4. CARREGAR ESTATÍSTICAS
 */
async function carregarEstatisticas() {
    try {
        const resp = await fetch(API + 'estatisticas', {
            headers: HEADERS_PADRAO
        });
        
        if (!resp.ok) throw new Error("Falha no fetch");
        
        const data = await resp.json();
        
        document.getElementById('v-daiane').innerText = "0";
        document.getElementById('v-admin').innerText = "0";

        data.estatisticas.forEach(stat => {
            if(stat.quem === 'daiane') document.getElementById('v-daiane').innerText = stat.total;
            if(stat.quem === 'admin') document.getElementById('v-admin').innerText = stat.total;
        });
    } catch (e) { 
        console.error("Erro nas estatísticas:", e); 
    }
}

window.onload = carregarEstatisticas;