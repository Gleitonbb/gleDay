// ATENÇÃO: Verifique se a URL do ngrok está correta. 
// Não esqueça da "/" no final.
const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";

// 1. Ao carregar a página, verifica se já existe uma história para hoje
window.onload = () => {
    console.log("Iniciando o app do casal...");
    verificarOuGerar(true); // 'true' indica carregamento automático
};

async function verificarOuGerar(isAutoLoad = false) {
    const botao = document.getElementById('btn-gerar');
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');

    // Se não for carregamento automático, desativamos o botão para evitar cliques múltiplos
    if (!isAutoLoad) {
        botao.disabled = true;
        botao.innerText = "Preparando nossa surpresa...";
    }

    try {
        // Faz a requisição para o servidor (POST /gerar-momento)
        const response = await fetch(`${API_URL}gerar-momento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.sucesso) {
            // Preenche o texto com efeito suave
            areaTexto.style.opacity = 0;
            setTimeout(() => {
                areaTexto.innerText = data.texto;
                areaTexto.style.opacity = 1;
            }, 300);

            // Gerencia a imagem
            const imgTemp = new Image();
            imgTemp.src = data.imagem;
            
            // Só exibe a imagem quando ela terminar de baixar (evita o "branco")
            imgTemp.onload = () => {
                areaImagem.src = data.imagem;
                areaImagem.style.display = 'block';
                console.log("📸 Imagem carregada com sucesso!");
            };

            // Se o servidor avisar que a história já existia (bloqueio diário)
            if (data.jaExistia) {
                botao.innerText = "O momento de hoje já foi revelado! ❤️";
                botao.disabled = true;
            } else if (!isAutoLoad) {
                botao.innerText = "Veja nossa surpresa de hoje!";
                botao.disabled = true;
            }
        } else {
            // Se for carregamento automático e não tiver nada, apenas aguarda o clique
            if (!isAutoLoad) areaTexto.innerText = "Ops! Tente novamente em instantes.";
        }

    } catch (error) {
        console.error("❌ Erro na conexão:", error);
        if (!isAutoLoad) {
            areaTexto.innerText = "O servidor está offline. Verifique o Node.js e o Ngrok!";
            botao.disabled = false;
            botao.innerText = "Tentar novamente";
        }
    }
}

// Função vinculada ao clique do botão no HTML
function gerarMomentoMagico() {
    verificarOuGerar(false);
}