const API = "https://lingually-categorical-latisha.ngrok-free.dev/";
let textoTemporario = ""; 

localStorage.setItem('sou_o_dono', 'sim');

async function chamarAPI(endpoint, metodo = 'GET', corpo = null) {
    const config = {
        method: metodo,
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
    };
    if (corpo) config.body = JSON.stringify(corpo);
    const resp = await fetch(API + endpoint, config);
    return resp.json();
}

async function gerarPreview() {
    const tema = document.getElementById('input-tema').value;
    const btn = document.getElementById('btn-gerar-preview');
    
    btn.innerText = "⏳ Gerando...";
    btn.disabled = true;

    try {
        const data = await chamarAPI('preview-texto', 'POST', { tema });
        if(data.sucesso) {
            textoTemporario = data.texto;
            document.getElementById('texto-preview').innerText = data.texto;
            document.getElementById('area-preview').style.display = 'block';
        }
    } catch (e) { alert("Erro ao gerar preview."); }
    finally {
        btn.innerText = "🔄 Gerar outra sugestão";
        btn.disabled = false;
    }
}

async function aprovarESalvar() {
    if(!textoTemporario) return;
    try {
        const data = await chamarAPI('salvar-historia-aprovada', 'POST', { texto: textoTemporario });
        if(data.sucesso) {
            alert("✨ Texto salvo com sucesso! Agora está pronto para ser libertado.");
            document.getElementById('area-preview').style.display = 'none';
        }
    } catch (e) { alert("Erro ao salvar."); }
}

async function liberarNovaHistoria() {
    if(!confirm("Liberar agora para ela?")) return;
    const data = await chamarAPI('forcar-liberacao', 'POST');
    if(data.sucesso) alert("🚀 Liberado! O cronômetro sumiu para a Daiane.");
}

async function carregarDados() {
    const data = await chamarAPI('estatisticas');
    if (data.estatisticas) {
        data.estatisticas.forEach(s => {
            if(s.quem === 'daiane') document.getElementById('v-daiane').innerText = s.total;
            if(s.quem === 'admin') document.getElementById('v-admin').innerText = s.total;
        });
    }
}
carregarDados();