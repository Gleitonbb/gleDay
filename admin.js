// TRUNCATE TABLE acessos;

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
            containerPreview.style.display = "block"; 
            containerPreview.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("❌ Erro da IA: " + (data.erro || "Tente outro tema."));
        }
    } catch (e) { 
        console.error(e);
        alert("Erro ao conectar com o servidor."); 
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
    const btn = event.target;

    if (!textoFinal || textoFinal.length < 5) {
        alert("⚠️ O texto gerado está vazio!");
        return;
    }

    btn.innerText = "Salvando... ⏳";
    btn.disabled = true;

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
            document.getElementById('input-tema').value = ""; // Limpa o tema
        }
    } catch (e) { 
        alert("Erro ao salvar: " + e.message); 
    } finally {
        btn.innerText = "💾 Salvar e Enviar para o Banco";
        btn.disabled = false;
    }
}

/**
 * 3. LIBERAR SURPRESA AGORA (FORÇAR)
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
 * 4. CARREGAR ESTATÍSTICAS E HORÁRIOS
 * Mostra apenas acessos do link oficial para a Daiane
 */
async function carregarEstatisticas() {
    try {
        const resp = await fetch(API + 'estatisticas', {
            headers: HEADERS_PADRAO
        });
        
        if (!resp.ok) throw new Error("Falha no fetch");
        
        const data = await resp.json();
        
        // Resetamos os contadores visuais
        document.getElementById('v-daiane').innerText = "0";
        document.getElementById('v-admin').innerText = "0";

        let totalAdminGleiton = 0;

        // 1. Atualiza os Contadores de Bolinha
        if (data.estatisticas) {
            data.estatisticas.forEach(stat => {
                if(stat.quem === 'daiane') {
                    document.getElementById('v-daiane').innerText = stat.total;
                }
                // Soma seus acessos (admin ou gleiton) no outro contador
                if(stat.quem === 'admin' || stat.quem === 'gleiton') {
                    totalAdminGleiton += parseInt(stat.total);
                }
            });
            document.getElementById('v-admin').innerText = totalAdminGleiton;
        }

        // 2. Atualiza a Lista de Horários Recentes (Somente da Daiane)
        const listaUI = document.getElementById('lista-horarios');
        if (listaUI) {
            listaUI.innerHTML = ''; 

            if (!data.recentes || data.recentes.length === 0) {
                listaUI.innerHTML = '<li>Nenhuma visualização oficial ainda.</li>';
            } else {
                data.recentes.forEach(acesso => {
                    // Formata a data: 22/02/2026 20:45
                    const dataObj = new Date(acesso.data_acesso);
                    const dataFormatada = dataObj.toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                    });

                    const li = document.createElement('li');
                    li.innerHTML = `<span>✅ Visualização</span> <strong>${dataFormatada}</strong>`;
                    listaUI.appendChild(li);
                });
            }
        }

    } catch (e) { 
        console.error("Erro nas estatísticas:", e); 
    }
}

// Inicialização e Atualização Automática
document.addEventListener('DOMContentLoaded', () => {
    carregarEstatisticas();
    // Atualiza o painel a cada 30 segundos sozinho
    setInterval(carregarEstatisticas, 30000);
});