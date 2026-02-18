// ATENÇÃO: Verifique se a URL do ngrok está correta (sempre com / no final)
const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";

// 1. Quando a página carrega, já busca a história do dia
window.onload = () => {
    // Registra o acesso inicial
    fetch(`${API_URL}log-acesso`).catch(err => console.error("Erro log:", err));
    
    // Tenta carregar a história automaticamente
    verificarOuGerar(true); 
};

async function verificarOuGerar(isAutoLoad = false) {
    const botao = document.getElementById('btn-gerar');
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');
    const carregando = document.getElementById('loading');

    // Se for clique no botão, mostra o loading
    if (!isAutoLoad) {
        botao.disabled = true;
        botao.innerText = "Buscando nossa magia...";
        carregando.style.display = 'block';
    }

    try {
        // Chama o servidor (ele decide se cria uma nova ou manda a que já existe)
        const response = await fetch(`${API_URL}gerar-momento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.sucesso) {
            // Preenche o texto e a imagem
            areaTexto.innerText = data.texto;
            areaImagem.src = data.imagem;
            areaImagem.style.display = 'block';

            // Se a história já existia (ela já tinha clicado hoje antes)
            if (data.jaExistia) {
                botao.innerText = "Sua mensagem de hoje já chegou ❤️";
                botao.disabled = true;
            } else {
                botao.innerText = "A surpresa de hoje chegou!";
                botao.disabled = true;
            }
        }
    } catch (error) {
        console.error("Erro na conexão:", error);
        if (!isAutoLoad) {
            areaTexto.innerText = "O servidor está descansando. Ligue o Node.js no PC!";
        }
    } finally {
        if (!isAutoLoad) {
            carregando.style.display = 'none';
        }
    }
}

// Função chamada pelo clique do botão no HTML
function gerarMomentoMagico() {
    verificarOuGerar(false);
}