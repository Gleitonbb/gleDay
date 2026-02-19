const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev/";
let intervaloCronometro;

window.addEventListener('load', () => {
    verificarOuGerar();
});

async function verificarOuGerar() {
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');
    const placeholder = document.getElementById('placeholder-vazio');
    const btnTexto = document.getElementById('btn-texto');

    // --- TRAVA DE SEGURANÇA PARA MONITORAMENTO ---
    // Só registra se o site estiver rodando no GitHub (produção)
    const isGithub = window.location.hostname.includes('github.io');
    
    if (isGithub) {
        try {
            fetch(`${API_URL}registrar-acesso`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({ tipo: 'daiane' })
            });
        } catch (e) {
            console.error("Erro ao registrar acesso:", e);
        }
    } else {
        console.log("Acesso local (notebook) detectado. Não vou contar nas estatísticas.");
    }

    // --- BUSCA A HISTÓRIA ---
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
        } else {
            areaTexto.innerText = "Ainda não temos uma nova história hoje... Volte logo! ❤️";
        }
    } catch (e) { 
        console.error("Erro ao buscar momento:", e);
        areaTexto.innerText = "Houve um probleminha técnico, mas o amor continua o mesmo! ❤️";
    }
}

function iniciarCronometro(ms) {
    const btnTexto = document.getElementById('btn-texto');
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
            btnTexto.innerText = `Próxima surpresa em: ${h}h ${m}m ${s}s`;
        }
    }, 1000);
}