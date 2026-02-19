// Configuração da URL do Servidor (Certifique-se de que o Ngrok está ativo)
const API = "https://lingually-categorical-latisha.ngrok-free.dev/";

// Variável para armazenar o texto enquanto você decide se salva ou não
let textoTemporario = ""; 

/**
 * 1. GERAR TEXTO COM IA
 * Solicita que a IA crie uma história baseada no tema digitado.
 */
async function refazerTexto() {
    const temaInput = document.getElementById('input-tema');
    const tema = temaInput.value;
    const btn = event.target; 
    
    if (!tema) {
        alert("⚠️ Digite um tema ou contexto antes de gerar!");
        return;
    }

    btn.innerText = "Gerando com IA... ⏳";
    btn.disabled = true;

    try {
        const resp = await fetch(API + 'preview-texto', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ tema })
        });
        
        const data = await resp.json();
        
        if(data.sucesso) {
            textoTemporario = data.texto; 
            // Coloca o texto da IA dentro da caixa para você editar se quiser
            temaInput.value = data.texto; 
            alert("✨ IA gerou a mensagem! Você pode editar o texto abaixo ou clicar em 'Salvar Tema' para confirmar.");
        } else {
            alert("❌ A IA não conseguiu gerar o texto. Tente outro tema.");
        }
    } catch (e) { 
        console.error(e);
        alert("Erro de conexão: " + e.message); 
    } finally {
        btn.innerText = "🔄 Refazer Texto (IA)";
        btn.disabled = false;
    }
}

/**
 * 2. SALVAR NO BANCO DE DADOS
 * Pega o texto que está na caixa (editado ou não) e envia para o MySQL.
 */
async function salvarConfig() {
    const textoFinal = document.getElementById('input-tema').value;

    if (!textoFinal || textoFinal.length < 5) {
        alert("⚠️ O texto está muito curto ou vazio para ser salvo!");
        return;
    }

    try {
        const resp = await fetch(API + 'salvar-historia-aprovada', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ texto: textoFinal })
        });
        
        const data = await resp.json();
        if(data.sucesso) {
            alert("✅ Sucesso! A história foi salva no banco de dados.");
        }
    } catch (e) { 
        alert("Erro ao salvar: " + e.message); 
    }
}

/**
 * 3. LIBERAR SURPRESA AGORA
 * Limpa o estado atual para que a Daiane veja o botão de "Nova História" imediatamente.
 */
async function liberarNovaHistoria() {
    if(!confirm("Deseja quebrar o cronômetro e liberar a visualização agora?")) return;

    try {
        const resp = await fetch(API + 'forcar-liberacao', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'ngrok-skip-browser-warning': 'true' 
            }
        });
        const data = await resp.json();
        if(data.sucesso) {
            alert("🚀 Liberado! O cronômetro foi resetado para ela.");
        }
    } catch (e) {
        alert("Erro ao liberar: " + e.message);
    }
}

/**
 * 4. CARREGAR ESTATÍSTICAS
 * Mostra quantas vezes a Daiane acessou o site.
 */
async function carregarEstatisticas() {
    try {
        const resp = await fetch(API + 'estatisticas', {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await resp.json();
        
        // Zera os contadores antes de preencher
        document.getElementById('v-daiane').innerText = "0";
        document.getElementById('v-admin').innerText = "0";

        data.estatisticas.forEach(stat => {
            if(stat.quem === 'daiane') document.getElementById('v-daiane').innerText = stat.total;
            if(stat.quem === 'admin') document.getElementById('v-admin').innerText = stat.total;
        });
    } catch (e) { 
        console.error("Erro ao carregar estatísticas:", e); 
    }
}

// Inicialização: Carrega os dados assim que a página abre
window.onload = carregarEstatisticas;