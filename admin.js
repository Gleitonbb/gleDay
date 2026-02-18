        const API = "SUA_URL_DO_NGROK/"; // Coloque sua URL aqui

        // Identificar que eu sou o Admin para não contar no acesso dela
        localStorage.setItem('tipo_usuario', 'admin');

        async function carregarDados() {
            const resp = await fetch(API + 'estatisticas');
            const data = await resp.json();
            
            // Atualiza estatísticas
            data.estatisticas.forEach(s => {
                if(s.quem === 'daiane') document.getElementById('v-daiane').innerText = s.total;
                if(s.quem === 'admin') document.getElementById('v-admin').innerText = s.total;
            });

            // Preenche o formulário com o que já está lá
            document.getElementById('input-foto').value = data.config.foto_ativa;
            document.getElementById('input-tema').value = data.config.tema_texto;
        }

        async function salvarConfig() {
            const foto = document.getElementById('input-foto').value;
            const tema = document.getElementById('input-tema').value;
            
            const resp = await fetch(API + 'atualizar-config', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ foto, tema })
            });
            
            if(resp.ok) alert("Configuração atualizada! O site da Daiane já está pronto.");
        }

        carregarDados();