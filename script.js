const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";
let intervaloCronometro;

// Inicia ao carregar a página
window.addEventListener('load', () => {
    // Registra acesso se não for o dono
    if (localStorage.getItem('sou_o_dono') !== 'sim') {
        fetch(API_URL + 'registrar-acesso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ tipo: 'daiane' })
        });
    }
    verificarOuGerar(true);
});

async function verificarOuGerar(isAutoLoad = false) {
    const btnTexto = document.getElementById('btn-texto');
    const btn = document.getElementById('btn-gerar');
    const circulo = document.getElementById('loading-circle');
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');

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
            areaTexto.innerText = data.texto;
            areaImagem.src = data.imagem;
            areaImagem.style.display = 'block';
            
            if (data.jaExistia) {
                iniciarContagemRegressiva(data.proximaPostagemEm); 
            } else {
                btnTexto.innerText = "Ver nova história";
                btn.disabled = false;
                circulo.style.display = 'none';
            }
        }
    } catch (error) {
        console.error("Erro na conexão:", error);
    }
}

function iniciarContagemRegressiva(msRestantes) {
    const btnTexto = document.getElementById('btn-texto');
    const btn = document.getElementById('btn-gerar');
    const circulo = document.getElementById('loading-circle');

    clearInterval(intervaloCronometro);
    btn.disabled = true;
    circulo.style.display = 'inline-block';

    let tempo = msRestantes;

    intervaloCronometro = setInterval(() => {
        tempo -= 1000;

        if (tempo <= 0) {
            clearInterval(intervaloCronometro);
            btnTexto.innerText = "Ver nova história";
            btn.disabled = false;
            circulo.style.display = 'none';
        } else {
            const horas = Math.floor(tempo / (1000 * 60 * 60));
            const minutos = Math.floor((tempo % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((tempo % (1000 * 60)) / 1000);
            btnTexto.innerText = `Nova postagem em ${horas}h ${minutos}m ${segundos}s`;
        }
    }, 1000);
}

function gerarMomentoMagico() { verificarOuGerar(false); }