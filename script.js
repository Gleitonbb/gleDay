// Substitua pela sua URL atual do ngrok (sempre terminando com /)
const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";

// 1. MONITORAMENTO: Registra assim que ela abre o site
window.onload = () => {
    fetch(`${API_URL}log-acesso`)
        .then(() => console.log("Acesso registrado!"))
        .catch(err => console.error("Erro ao logar acesso:", err));
};

async function gerarMomentoMagico() {
    const botao = document.getElementById('btn-gerar');
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');
    const carregando = document.getElementById('loading');

    // Feedback visual de carregamento
    botao.disabled = true;
    botao.innerText = "Criando nossa magia...";
    if (carregando) carregando.style.display = 'block';

    try {
        // 2. MONITORAMENTO: Registra o clique no botão
        await fetch(`${API_URL}registrar-clique-botao`, { method: 'POST' });

        // 3. GERAÇÃO: Chama a IA no servidor
        const response = await fetch(`${API_URL}gerar-momento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.sucesso) {
            // Exibe o texto e a imagem que vieram do servidor
            areaTexto.innerText = data.texto;
            areaImagem.src = data.imagem;
            areaImagem.style.display = 'block'; // Garante que a imagem apareça
        } else {
            areaTexto.innerText = "Houve um probleminha na nossa magia, tente de novo! ❤️";
        }

    } catch (error) {
        console.error("Erro:", error);
        areaTexto.innerText = "O servidor está descansando. Tente novamente em instantes!";
    } finally {
        botao.disabled = false;
        botao.innerText = "Gerar Novo Momento";
        if (carregando) carregando.style.display = 'none';
    }
}