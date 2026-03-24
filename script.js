var listaVoluntarios = JSON.parse(localStorage.getItem("voluntarios")) || [];

var bairrosPorCidade = {
    recife: ["Bairro do Recife (Marco Zero)", "Bairro do Recife (Moeda)", "Bairro do Recife (Alfândega)", "São José (Sérgio Loreto)", "Boa Vista (Mercado)", "Santo Amaro (Aurora)"],
    olinda: ["Carmo (Praça do Carmo)", "Guadalupe (Homem da Meia-Noite)", "Amparo", "Varadouro", "Rio Doce", "Peixinhos"]
};

var nomeDias = { sabado: "Sáb", domingo: "Dom", segunda: "Seg", terca: "Ter", quarta: "Qua" };

function atualizarBancoDeDados() {
    localStorage.setItem("voluntarios", JSON.stringify(listaVoluntarios));
}

function entrarComoVoluntario() {
    sessionStorage.setItem("papel", "voluntario");
    document.getElementById("badge-usuario").textContent = "Portal do Voluntário";
    mostrarSecao('cadastrar');
}

function entrarComoAdmin() {
    var senha = prompt("Digite a senha de funcionário:");
    if (senha === "123") {
        sessionStorage.setItem("papel", "admin");
        document.getElementById("badge-usuario").textContent = "Painel do Admin";
        mostrarSecao('listar');
    } else {
        alert("Senha incorreta!");
    }
}

function fazerLogout() {
    sessionStorage.removeItem("papel");
    window.location.reload();
}


function mostrarSecao(qual) {
    document.getElementById("secao-login").style.display = "none";
    document.getElementById("secao-cadastrar").style.display = "none";
    document.getElementById("secao-listar").style.display = "none";
    document.getElementById("menu-navegacao").style.display = "flex";

    document.getElementById("secao-" + qual).style.display = "block";

    var abas = document.querySelectorAll(".tab");
    abas.forEach(function(aba){ aba.classList.remove("active"); });

    if (qual === "cadastrar") {
        document.getElementById("tab-cadastrar").classList.add("active");
    } else if (qual === "listar") {
        document.getElementById("tab-listar").classList.add("active");
        renderizarTabela();
    }
}

function atualizarContato() {
    var querTelefone = document.getElementById("check-telefone").checked;
    var querEmail = document.getElementById("check-email").checked;
    document.getElementById("campo-telefone").style.display = querTelefone ? "flex" : "none";
    document.getElementById("campo-email").style.display = querEmail ? "flex" : "none";
}

function atualizarBairros() {
    var cidadeRadios = document.querySelector('input[name="cidade"]:checked');
    if (!cidadeRadios) return;
    
    var selectBairro = document.getElementById("bairro");
    selectBairro.innerHTML = '<option value="">Selecione um bairro para atuar</option>';
    
    bairrosPorCidade[cidadeRadios.value].forEach(function(bairro) {
        var opcao = document.createElement("option");
        opcao.value = bairro; opcao.textContent = bairro;
        selectBairro.appendChild(opcao);
    });
    document.getElementById("campo-bairro").style.display = "flex";
}

//CRUD
function salvarVoluntario() {
    var nome = document.getElementById("nome").value.trim();
    var cidade = document.querySelector('input[name="cidade"]:checked');
    var bairro = document.getElementById("bairro").value;

    var querTelefone = document.getElementById("check-telefone").checked;
    var querEmail = document.getElementById("check-email").checked;
    var telefone = document.getElementById("telefone").value.trim();
    var email = document.getElementById("email").value.trim();

    var diasMarcados = [];
    document.querySelectorAll('input[name="dias"]:checked').forEach(function(c) { diasMarcados.push(c.value); });

    var erro = validarFormulario(nome, cidade, bairro, querTelefone, querEmail, telefone, email, diasMarcados);
    if (erro) return mostrarErro(erro);

    var idEdicao = document.getElementById("id-edicao").value;

    if (idEdicao !== "") {
        // UPDATE!
        var index = listaVoluntarios.findIndex(v => v.id == idEdicao);
        if(index !== -1) {
            listaVoluntarios[index] = {
                id: parseInt(idEdicao), nome: nome, cidade: cidade.value, bairro: bairro,
                telefone: querTelefone ? telefone : null, email: querEmail ? email : null, dias: diasMarcados
            };
            alert("Cadastro atualizado com sucesso!");
        }
    } else {
        // CREATE!
        var novoId = Date.now();
        listaVoluntarios.push({
            id: novoId, nome: nome, cidade: cidade.value, bairro: bairro,
            telefone: querTelefone ? telefone : null, email: querEmail ? email : null, dias: diasMarcados
        });
        alert(`Sucesso! Seu código de inscrição é: ${novoId}\nGuarde-o caso precise editar seus dados depois.`);
    }

    atualizarBancoDeDados(); // localStorage
    limparFormulario();
    mostrarSecao('listar');
}

function validarFormulario(nome, cidade, bairro, querTelefone, querEmail, telefone, email, dias) {
    if (!nome || nome.indexOf(' ') === -1) return "Por favor, informe seu NOME COMPLETO.";
    if (!querTelefone && !querEmail) return "Selecione pelo menos um contato.";
    if (querTelefone && !telefone) return "Preencha o número de telefone.";
    if (querEmail && !email) return "Preencha o endereço de e-mail.";
    if (!cidade) return "Selecione a cidade.";
    if (!bairro) return "Selecione o bairro.";
    if (dias.length === 0) return "Selecione pelo menos um dia.";
    return null;
}

// READ!
function renderizarTabela() {
    var corpo = document.getElementById("tabela-corpo");
    corpo.innerHTML = "";

    var papel = sessionStorage.getItem("papel");
    var isAdmin = papel === "admin";

    var colunasPrivadas = document.querySelectorAll(".col-privada");
    colunasPrivadas.forEach(col => col.style.display = isAdmin ? "table-cell" : "none");

    if (listaVoluntarios.length === 0) {
        corpo.innerHTML = '<tr class="linha-vazia"><td colspan="7">Nenhum voluntário cadastrado.</td></tr>';
        return;
    }

    listaVoluntarios.forEach(function(v, indice) {
        var tr = document.createElement("tr");
        var contato = [v.telefone, v.email].filter(Boolean).join("<br>");
        var tagsHtml = v.dias.map(d => `<span class="tag-dia">${nomeDias[d]}</span>`).join("");
        
        var botoesAcoes = isAdmin ? `<button class="btn-danger" onclick="excluirVoluntario(${v.id})">Excluir</button>` : "";

        tr.innerHTML = `
            <td>${indice + 1}</td>
            <td><strong>${v.nome}</strong></td>
            ${isAdmin ? `<td>${contato}</td><td>${v.cidade}</td><td>${v.bairro}</td>` : ""}
            <td><div class="dias-lista">${tagsHtml}</div></td>
            ${isAdmin ? `<td>${botoesAcoes}</td>` : ""}
        `;
        corpo.appendChild(tr);
    });
}

//edição de voluntarios
function abrirModalEdicao() {
    var idDigitado = prompt("Por favor, digite seu código de inscrição (ID):");
    if (!idDigitado) return;

    var voluntario = listaVoluntarios.find(v => v.id == idDigitado);
    if (!voluntario) {
        alert("Cadastro não encontrado!");
        return;
    }

    entrarComoVoluntario();
    preencherFormularioParaEdicao(voluntario);
}

function preencherFormularioParaEdicao(v) {
    document.getElementById("titulo-cadastro").textContent = "Editar Inscrição";
    document.getElementById("subtitulo-cadastro").textContent = "Atualize seus dados abaixo.";
    document.getElementById("btn-salvar").textContent = "Salvar Alterações";
    document.getElementById("id-edicao").value = v.id;

    document.getElementById("nome").value = v.nome;
    
    document.getElementById("check-telefone").checked = !!v.telefone;
    document.getElementById("check-email").checked = !!v.email;
    atualizarContato();
    if(v.telefone) document.getElementById("telefone").value = v.telefone;
    if(v.email) document.getElementById("email").value = v.email;

    var radioCidade = document.querySelector(`input[name="cidade"][value="${v.cidade}"]`);
    if(radioCidade) radioCidade.checked = true;
    atualizarBairros();
    
    setTimeout(() => document.getElementById("bairro").value = v.bairro, 100);

    var checksDias = document.querySelectorAll('input[name="dias"]');
    checksDias.forEach(c => c.checked = v.dias.includes(c.value));
}

// DELETE!
function excluirVoluntario(id) {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    listaVoluntarios = listaVoluntarios.filter(v => v.id !== id);
    atualizarBancoDeDados();
    renderizarTabela();
}

function limparFormulario() {
    document.getElementById("titulo-cadastro").textContent = "Novo Voluntário";
    document.getElementById("btn-salvar").textContent = "Cadastrar";
    document.getElementById("id-edicao").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("check-telefone").checked = false;
    document.getElementById("check-email").checked = false;
    document.getElementById("telefone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("campo-telefone").style.display = "none";
    document.getElementById("campo-email").style.display = "none";

    document.querySelectorAll('input[name="cidade"]').forEach(r => r.checked = false);
    document.getElementById("bairro").innerHTML = '<option value="">Selecione um bairro</option>';
    document.getElementById("campo-bairro").style.display = "none";
    document.querySelectorAll('input[name="dias"]').forEach(c => c.checked = false);
    esconderErro();
}

function mostrarErro(mensagem){
    var div = document.getElementById("mensagem-erro");
    div.textContent = mensagem; div.style.display = "block";
}
function esconderErro() { document.getElementById("mensagem-erro").style.display = "none"; }