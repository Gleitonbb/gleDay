//TRUNCATE TABLE acessos;
// CONFIGURAÇÃO DA URL DO SERVIDOR (NGROK)
const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";

// 1. ATUALIZAR ESTATÍSTICAS E HORÁRIOS
async function atualizarEstatisticas() {
    try {
        const resp = await fetch(`${API_URL}estatisticas`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await resp.json();

        // Atualiza os contadores no topo
        if (data.estatisticas) {
            data.estatisticas.forEach(stat => {
                if (stat.quem === 'daiane') document.getElementById('v-daiane').innerText = stat.total;
                if (stat.quem === 'admin') document.getElementById('v-admin').innerText = stat.total;
            });
        }

        // Atualiza a lista de horários detalhados
        const listaUI = document.getElementById('lista-horarios');
        listaUI.innerHTML = ''; 

        if (!data.recentes || data.recentes.length === 0) {
            listaUI.innerHTML = '<li>Nenhum acesso registrado.</li>';
        } else {
            data.recentes.forEach(acesso => {
                // Formata a data para: 21/02/2026 17:30
                const dataObj = new Date(acesso.data_acesso);
                const dataFormatada = dataObj.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const li = document.createElement('li');
                li.innerHTML = `<span>✅ Visualização</span> <strong>${dataFormatada}</strong>`;
                listaUI.appendChild(li);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar estatísticas:", e);
    }
}

// 2. GERAR TEXTO COM IA (PREVIEW)
async function refazerTexto() {
    const tema = document.getElementById('input-tema').value;
    if (!tema) return alert("Digite um tema primeiro!");

    const btn = document.querySelector('.btn-refazer');
    btn.innerText = "🤖 Pensando...";
    btn.disabled = true;

    try {
        const resp = await fetch(`${API_URL}preview-texto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema })
        });
        const data = await resp.json();

        if (data.sucesso) {
            document.getElementById('output-ia').value = data.texto;
            document.getElementById('container-preview').style.display = 'block';
        }
    } catch (e) {
        alert("Erro ao chamar a IA.");
    } finally {
        btn.innerText = "🔄 Gerar Texto com IA";
        btn.disabled = false;
    }
}

// 3. SALVAR NO BANCO (ARQUIVA A ANTIGA AUTOMATICAMENTE NO SERVER)
async function salvarConfig() {
    const textoFinal = document.getElementById('output-ia').value;
    const btn = document.getElementById('btn-salvar-final');

    if (!textoFinal) return alert("O texto está vazio!");

    btn.innerText = "💾 Salvando...";
    btn.disabled = true;

    try {
        const resp = await fetch(`${API_URL}salvar-historia-aprovada`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: textoFinal })
        });
        const data = await resp.json();

        if (data.sucesso) {
            alert("História salva! A anterior foi movida para a Galeria.");
            location.reload(); // Recarrega para limpar os campos
        }
    } catch (e) {
        alert("Erro ao salvar no banco.");
    } finally {
        btn.innerText = "💾 Salvar e Enviar para o Banco";
        btn.disabled = false;
    }
}

// 4. LIBERAR SURPRESA (FORÇAR)
async function liberarNovaHistoria() {
    if(!confirm("Deseja mesmo quebrar o cronômetro da Daiane?")) return;
    
    try {
        await fetch(`${API_URL}forcar-liberacao`, { method: 'POST' });
        alert("Liberado! Ela poderá ver a história agora.");
    } catch (e) {
        alert("Erro ao liberar.");
    }
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    atualizarEstatisticas();
    // Atualiza o monitoramento a cada 30 segundos sozinho
    setInterval(atualizarEstatisticas, 30000);
});