const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";
let intervaloCronometro;

window.addEventListener('load', () => {
    verificarOuGerar();
});

// FUNÇÕES DE ZOOM
function abrirZoom() {
    const imgOriginal = document.getElementById('imagem-da-historia');
    if (imgOriginal.style.display === 'none') return; // Não abre se estiver vazio

    const modal = document.getElementById('modal-zoom');
    const textoOriginal = document.getElementById('texto-da-historia');
    
    document.getElementById('img-zoom').src = imgOriginal.src;
    document.getElementById('texto-zoom').innerText = textoOriginal.innerText;
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function fecharZoom() {
    document.getElementById('modal-zoom').style.display = "none";
    document.body.style.overflow = "auto";
}

// LOGICA PRINCIPAL
async function verificarOuGerar() {
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');
    const placeholder = document.getElementById('placeholder-vazio');

    try {
        const response = await fetch(`${API_URL}gerar-momento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await response.json();

        if (data.sucesso) {
            areaTexto.innerText = data.texto;
            areaImagem.src = data.imagem;
            areaImagem.style.display = 'block';
            if(placeholder) placeholder.style.display = 'none';

            if (data.proximaPostagemEm !== undefined) {
                iniciarCronometro(data.proximaPostagemEm);
            }
        }
    } catch (e) { 
        console.error("Erro:", e);
    }
}

function iniciarCronometro(ms) {
    const btnTexto = document.getElementById('btn-texto');
    let tempo = ms;
    clearInterval(intervaloCronometro);

    intervaloCronometro = setInterval(() => {
        tempo -= 1000;
        if (tempo <= 0) {
            btnTexto.innerText = "✨ Ver nova história";
            clearInterval(intervaloCronometro);
        } else {
            const h = Math.floor(tempo / 3600000);
            const m = Math.floor((tempo % 3600000) / 60000);
            const s = Math.floor((tempo % 60000) / 1000);
            btnTexto.innerText = `Próxima em: ${h}h ${m}m ${s}s`;
        }
    }, 1000);
}