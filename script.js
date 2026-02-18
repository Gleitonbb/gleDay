const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";

// Função que roda assim que a página abre
window.addEventListener('load', () => {
    console.log("Iniciando o app do casal...");
    registrarAcesso(); // Tenta registrar acesso
    verificarOuGerar(true); // Carrega a história (modo automático)
});

// FUNÇÃO QUE IGNORA O SEU NOTEBOOK
async function registrarAcesso() {
    // Se você já abriu o admin nesse navegador, ele não conta o acesso
    if (localStorage.getItem('sou_o_dono') === 'sim') {
        console.log("🛠️ Gleiton detectado: Acesso não contabilizado.");
        return; 
    }

    try {
        await fetch(API_URL + 'registrar-acesso', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ tipo: 'daiane' })
        });
    } catch (err) {
        console.error("Erro ao registrar:", err);
    }
}

async function verificarOuGerar(isAutoLoad = false) {
    const botao = document.getElementById('btn-gerar');
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');

    if (!isAutoLoad) {
        botao.disabled = true;
        botao.innerText = "Preparando nossa surpresa...";
    }

    try {
        const response = await fetch(`${API_URL}gerar-momento`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const data = await response.json();

        if (data.sucesso) {
            areaTexto.style.opacity = 0;
            setTimeout(() => {
                areaTexto.innerText = data.texto;
                areaTexto.style.opacity = 1;
            }, 300);

            const imgTemp = new Image();
            imgTemp.src = data.imagem;
            imgTemp.onload = () => {
                areaImagem.src = data.imagem;
                areaImagem.style.display = 'block';
            };

            if (data.jaExistia) {
                botao.innerText = "O momento de hoje já foi revelado! ❤️";
                botao.disabled = true;
            } else {
                botao.disabled = false;
                botao.innerText = "Revelar Surpresa de Hoje";
            }
        }
    } catch (error) {
        console.error("Erro na conexão:", error);
    }
}

function gerarMomentoMagico() {
    verificarOuGerar(false);
}