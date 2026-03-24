var listaVoluntarios = []
var bairrosPorCidade = {
    recife: [
        "Bairro do Recife (Marco Zero/Praça do Arsenal)",
        "Bairro do Recife (Rua da Moeda)",
        "Bairro do Recife (Cais da Alfândega)",
        "São José (Praça Sérgio Loreto/Forte das Cincos Pontas)",
        "São José (Pátio do Terço)",
        "Santo Antônio (Praça da Independência)",
        "Santo Antônio (Ponte Duarte Coelho)",
        "Boa Vista (Mercado da Boa Vista)",
        "Boa Vista (Pátio de Santa Cruz)",
        "Santo Amaro (Praça da Aurora)"
    ],
    olinda: [
        "Carmo (Praça do Carmo)",
        "Guadalupe (Sede do Homem da Meia-Noite)",
        "Amparo (Largo do Amparo)",
        "Varadouro (Polo Varadouro)",
        "Rio Doce (Polo Rio Doce)",
        "Peixinhos (Avenida Nacional)",
        "Cidade Tabajara (Casa da Rabeca)",
        "Bairro Novo (Praça Doze de Março)",
        "Jardim Brasil (Vias principais)"
    ]
};

var nomeDias = {
    sabado: "Sábado",
    domingo: "Domingo",
    segunda: "Segunda",
    terca: "Terça",
    quarta: "Quarta"
};

// navegação

function mostrarSecao(qual) {
    document.getElementById("secao-cadastrar").style.display = "none";
    document.getElementById("secao-listar").style.display = "none";
    document.getElementById("secao-" + qual).style.display = "block";

    var abas = document.querySelectorAll(".tab");
    abas.forEach(function(aba){
        aba.classList.remove("active");
    });

    if (qual === "cadastrar") {
        abas[0].classList.add("active");
    }else {
        abas[1].classList.add("active");
        renderizarTabela();
    }
}

// formulário: mostrar/ocultar campos

function atualizarContato() {
    var querTelefone = document.getElementById("check-telefone").checked;
    var querEmail = document.getElementById("check-email").checked;

    document.getElementById("campo-telefone").style.display = querTelefone ? "flex" : "none";
    document.getElementById("campo-email").style.display = querEmail ? "flex" : "none";
}

function atualizarBairros() {
    var cidadeSelecionada = document.querySelector('input[name="cidade"]:checked').value;
    var selectBairro = document.getElementById("bairro");

    selectBairro.innerHTML = '<option value="">Selecione um bairro para atuar</option>';

    var bairros = bairrosPorCidade[cidadeSelecionada];
    bairros.forEach(function(bairro) {
        var opcao = document.createElement("option");
        opcao.value = bairro;
        opcao.textContent = bairro;
        selectBairro.appendChild(opcao);
    });

    document.getElementById("campo-bairro").style.display = "flex";
}

// CRUD: CREATE (cadastrar)

function cadastrarVoluntario() {
    
    var nome = document.getElementById("nome").value.trim();
    var cidade = document.querySelector('input[name="cidade"]:checked');
    var bairro = document.getElementById("bairro").value;

    var querTelefone = document.getElementById("check-telefone").checked;
    var querEmail = document.getElementById("check-email").checked;
    var telefone = document.getElementById("telefone").value.trim();
    var email = document.getElementById("email").value.trim();

    var diasMarcados = [];
    var checksDias = document.querySelectorAll('input[name="dias"]:checked');
    checksDias.forEach(function(check) {
        diasMarcados.push(check.value);
    });

    //validação de campos obrigatóriso
    var erro = validarFormulario(nome, cidade, bairro, querTelefone, querEmail, telefone, email, diasMarcados);
    if (erro) {
        mostrarErro(erro);
        return;
    }

    //objeto do novo voluntário
    var novoVoluntario = {
        id: Date.now(), //timestamp como ID único
        nome: nome,
        cidade: cidade.value,
        bairro: bairro,
        telefone: querTelefone ? telefone : null,
        email: querEmail ? email : null,
        dias: diasMarcados
    };

    listaVoluntarios.push(novoVoluntario);

    limparFormulario();
    esconderErro();
    alert("Voluntário cadastrado com sucesso!");
}

function validarFormulario(nome, cidade, bairro, querTelefone, querEmail, telefone, email, dias) {
    if (!nome) {
        return "Por favor, informe o nome do voluntário.";
    }
    if (!querTelefone && !querEmail) {
        return "Selecione pelo menos um tipo de contao (telefone ou e-mail).";
    }
    if (querTelefone && !telefone) {
        "Por favor, preencha o número de telefone.";
    }
    if (querEmail && !email) {
        return "Por favor, preencha o endereço de e-mail.";
    }
    if (!cidade) {
        return "Selecione a cidade de atuação (Recife ou Olinda).";
    }
    if (!bairro) {
        return "Selecione o bairro de atuação.";
    }
    if (dias.length === 0) {
        return "Selecione pelo menos um dia de disponibilidade."
    }
    return null;
}

// CRUD: READ (listar)

function renderizarTabela() {
    var corpo = document.getElementById("tabela-corpo");
    corpo.innerHTML = "";

    if (listaVoluntarios.length === 0) {
        corpo.innerHTML = '<tr class="linha-vazia"><td colspan="7">Nenhum voluntário cadastrado ainda.</td></tr>';
        return;
    }

    listaVoluntarios.forEach(function(v, indice) {
        var tr = document.createElement("tr");
        
        var contato = [];
        if (v.telefone) contato.push(v.telefone);
        if (v.email) contato.push(v.email);

        var tagsHTML = v.dias.map(function(dia) {
            return '<span class="tag=dia">' + nomeDias[dia] + '</span>';
        }).join("");

        var cidadeFormatada = v.cidade === "recife" ? "Recife" : "Olinda";

        tr.innerHTML = `
        <td>${indice + 1}</td>
        <td>${v.nome}</td>
        <td>${contato.join("<br>")}</td>
        <td>${cidadeFormatada}</td>
        <td>${v.bairro}</td>
        <td><div class="dias-lista">${tagsHtml}</div></td>
        <td>
            <button class="btn-danger" onclick="excluirVoluntario(${v.id})">🗑️ Excluir</button>
        </td>
        `;
        
        corpo.appendeChild(tr);
    });
}

// CRUD: DELETE

function excluirVoluntario(id) {
    var confirmar = confirm("Tem certeza que deseja excluir este voluntário?");
    if (!confirmar) return;

    listaVoluntarios = listaVoluntarios.filter(function(v) {
        return v.id !== id;
    });

    renderizarTabela();
}

function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("check-telefone").checkend = false;
    document.getElementById("check-email").checkend = false;
    document.getElementById("telefone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("campo-telefone").style.display = "none";
    document.getElementById("campo-email").style.display = "none";

    var radios = document.querySelectorAll('input[name="cidade"]');
    radios.forEach(function(r) { r.checked = false; });

    document.getElementById("bairro").innerHTML = '<option value= "">Selecione um bairro para atuar</option>';
    document.getElementsById("campo-bairro").style.display = "none";

    var checksDias = document.querySelectorAll('input[name="dias"]');
    checksDias.forEach(function(c) { c.checkend = false; });

    esconderErro();
}

function mostrarErro(mensagem){
    var div = document.getElementById("mensagem-erro");
    div.textContent = mensagem;
    div.style.display = "block";
}

function esconderErro() {
    document.getElementById("mensagem-erro").style.display = "none";
}