// ATENÇÃO: Verifique se esta URL é a mesma que aparece no seu terminal do Ngrok agora!
const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev"; 
let intervaloCronometro;

window.addEventListener('load', () => {
    verificarOuGerar();
});

// --- NOVA FUNÇÃO DE ZOOM (Faltava aqui) ---
function abrirZoom() {
    const imgOriginal = document.getElementById('imagem-da-historia');
    // Se a imagem ainda não carregou ou está escondida, não faz nada
    if (!imgOriginal || imgOriginal.style.display === 'none') return;

    const modal = document.getElementById('modal-zoom');
    const textoOriginal = document.getElementById('texto-da-historia');
    const imgZoom = document.getElementById('img-zoom');
    const textoZoom = document.getElementById('texto-zoom');
    
    // Copia a imagem e o texto para dentro do modal
    imgZoom.src = imgOriginal.src;
    textoZoom.innerText = textoOriginal.innerText;
    
    // Mostra o modal
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Trava o scroll do fundo
}

function fecharZoom() {
    document.getElementById('modal-zoom').style.display = "none";
    document.body.style.overflow = "auto"; // Libera o scroll
}

async function verificarOuGerar() {
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');
    const placeholder = document.getElementById('placeholder-vazio');

    // --- LÓGICA DE IDENTIFICAÇÃO DE ACESSO ---
    const isOficial = window.location.hostname.includes('github.io');
    const quemAcessou = isOficial ? 'daiane' : 'gleiton';

    try {
        // Registro de acesso enviado ao seu servidor
        fetch(`${API_URL}/registrar-acesso`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ tipo: quemAcessou })
        });
    } catch (e) {
        console.error("Erro no registro:", e);
    }

    // --- BUSCA O CONTEÚDO ---
    try {
        const response = await fetch(`${API_URL}/gerar-momento`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'ngrok-skip-browser-warning': 'true' 
            }
        });
        
        const data = await response.json();

        if (data.sucesso) {
            if (areaTexto) areaTexto.innerText = data.texto;
            
            if (areaImagem) {
                // Adicionamos timestamp para evitar cache
                areaImagem.src = `${data.imagem}&t=${Date.now()}`;
                areaImagem.style.display = 'block';
            }
            
            if (placeholder) placeholder.style.display = 'none';

            if (data.proximaPostagemEm !== undefined) {
                iniciarCronometro(data.proximaPostagemEm);
            }
        } else {
            if (areaTexto) areaTexto.innerText = "Ainda não temos uma nova história hoje... Volte logo! ❤️";
        }
    } catch (e) { 
        console.error("Erro ao buscar momento:", e);
    }
}

function iniciarCronometro(ms) {
    const btnTexto = document.getElementById('btn-texto');
    if (!btnTexto) return;
    let tempo = ms;
    clearInterval(intervaloCronometro);
    if (tempo <= 0) {
        btnTexto.innerText = "✨ Ver nova história";
        return;
    }
    intervaloCronometro = setInterval(() => {
        tempo -= 1000;
        if (tempo <= 0) {
            btnTexto.innerText = "✨ Nova surpresa liberada!";
            clearInterval(intervaloCronometro);
        } else {
            const h = Math.floor(tempo / 3600000);
            const m = Math.floor((tempo % 3600000) / 60000);
            const s = Math.floor((tempo % 60000) / 1000);
            btnTexto.innerText = `Próxima em: ${h}h ${m}m ${s}s`;
        }
    }, 1000);
}