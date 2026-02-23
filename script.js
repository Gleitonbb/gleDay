// ATENÇÃO: Verifique se esta URL é a mesma que aparece no seu terminal do Ngrok agora!
const API_URL = "https://lingually-categorical-latisha.ngrok-free.dev"; 
let intervaloCronometro;

window.addEventListener('load', () => {
    verificarOuGerar();
});

async function verificarOuGerar() {
    const areaTexto = document.getElementById('texto-da-historia');
    const areaImagem = document.getElementById('imagem-da-historia');
    const placeholder = document.getElementById('placeholder-vazio');
    const btnTexto = document.getElementById('btn-texto');

    // --- LÓGICA DE IDENTIFICAÇÃO DE ACESSO ---
    // Se o hostname contiver github.io, sabemos que é o acesso oficial
    const isOficial = window.location.hostname.includes('github.io');
    const quemAcessou = isOficial ? 'daiane' : 'gleiton';

    try {
        console.log(`Tentando registrar acesso para: ${quemAcessou}`);
        
        // Registro de acesso enviado ao seu servidor
        fetch(`${API_URL}/registrar-acesso`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'ngrok-skip-browser-warning': 'true' 
            },
            body: JSON.stringify({ tipo: quemAcessou })
        })
        .then(res => {
            if (res.ok) console.log("✅ Sucesso ao registrar no banco!");
            else console.log("⚠️ Erro no servidor ao registrar.");
        })
        .catch(err => console.error("❌ O servidor está offline ou a URL do Ngrok mudou."));

    } catch (e) {
        console.error("❌ Erro na função de registro:", e);
    }

    // --- BUSCA O CONTEÚDO (HISTÓRIA E IMAGEM) ---
    try {
        // Usamos POST conforme definido no seu server.js
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
                // Adicionamos um timestamp na imagem para evitar cache do navegador
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
        console.error("❌ Erro ao buscar momento:", e);
        if (areaTexto) areaTexto.innerText = "Houve um probleminha técnico, mas o amor continua o mesmo! ❤️";
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
            btnTexto.innerText = `Próxima surpresa em: ${h}h ${m}m ${s}s`;
        }
    }, 1000);
}