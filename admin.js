const API = "https://lingually-categorical-latisha.ngrok-free.dev/";

// CRIA A ETIQUETA PARA O NOTEBOOK NÃO SER CONTADO NO SITE DA DAIANE
localStorage.setItem('sou_o_dono', 'sim');

async function chamarAPI(endpoint, metodo = 'GET', corpo = null) {
    const config = {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    };
    if (corpo) config.body = JSON.stringify(corpo);
    
    const resp = await fetch(API + endpoint, config);
    return resp.json();
}

async function carregarDados() {
    try {
        const data = await chamarAPI('estatisticas');
        
        // Zera os campos antes de preencher
        document.getElementById('v-daiane').innerText = "0";
        document.getElementById('v-admin').innerText = "0";

        if (data.estatisticas) {
            data.estatisticas.forEach(s => {
                if(s.quem === 'daiane') document.getElementById('v-daiane').innerText = s.total;
                if(s.quem === 'admin') document.getElementById('v-admin').innerText = s.total;
            });
        }

        if (data.config && data.config.tema_texto) {
            document.getElementById('input-tema').value = data.config.tema_texto;
        }
    } catch (err) {
        console.error("Erro ao carregar painel:", err);
    }
}

async function salvarConfig() {
    const tema = document.getElementById('input-tema').value;
    if (!tema) return alert("Digite um tema!");
    
    try {
        const data = await chamarAPI('atualizar-config', 'POST', { tema });
        if(data.sucesso) alert("Tema atualizado! A IA usará isso no próximo clique dela.");
    } catch (err) {
        alert("Erro ao salvar tema.");
    }
}

// Carrega os números assim que você abre o admin
carregarDados();