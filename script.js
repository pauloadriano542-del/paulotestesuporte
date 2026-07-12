/* ==========================================================
   CENTRAL DE DECLARAÇÕES
   Projeto de demonstração/portfólio (verificação de pagamento,
   conta ativa, baixa de DDA, carta de circularização,
   termo de titularidade e pagamento duplicado)

   O preview à direita é AO VIVO: qualquer alteração nos campos
   já atualiza o documento imediatamente (sem precisar clicar em
   nenhum botão). O botão "Download PDF" só valida os campos
   obrigatórios e gera o arquivo para download.
========================================================== */
let tipoPagamento = "PIX";
let paginaAtivaId = "pesquisa";
let zoomAtual = 100;
/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    iniciarSistema();
});
function iniciarSistema() {
    configurarMenu();
    configurarPagamento();
    configurarMascarasMonetarias();
    configurarAtualizacaoAoVivo();
    configurarBotaoDownload();
    configurarZoomControls();
    mostrarPagina("pesquisa");
}
/* ==========================================================
   MENU DE TIPOS DE DOCUMENTO
========================================================== */
function configurarMenu() {
    const menus = document.querySelectorAll(".doc-type-card");
    menus.forEach(menu => {
        menu.addEventListener("click", () => {
            menus.forEach(item => item.classList.remove("active"));
            menu.classList.add("active");
            mostrarPagina(menu.dataset.page);
        });
    });
}
function mostrarPagina(id) {
    paginaAtivaId = id;
    document.querySelectorAll(".page").forEach(pagina => {
        pagina.classList.remove("active");
    });
    const pagina = document.getElementById(id);
    if (pagina) pagina.classList.add("active");
    // A etapa "Forma de pagamento" (PIX/Boleto) só se aplica à Verificação de Pagamento
    const stepPagamento = document.getElementById("stepPagamento");
    if (stepPagamento) {
        stepPagamento.style.display = (id === "pesquisa") ? "" : "none";
    }
    atualizarPreviewAoVivo();
}
/* ==========================================================
   PIX / BOLETO
========================================================== */
function configurarPagamento() {
    const pix = document.getElementById("btnPix");
    const boleto = document.getElementById("btnBoleto");
    if (!pix || !boleto) return;
    pix.addEventListener("click", () => {
        tipoPagamento = "PIX";
        pix.classList.add("active");
        boleto.classList.remove("active");
        document.getElementById("lblIdentificador").innerText = "ID Fim a Fim";
        document.getElementById("identificadorPagamento").placeholder = "Informe o identificador";
        atualizarPreviewAoVivo();
    });
    boleto.addEventListener("click", () => {
        tipoPagamento = "BOLETO";
        boleto.classList.add("active");
        pix.classList.remove("active");
        document.getElementById("lblIdentificador").innerText = "Código de Barras";
        document.getElementById("identificadorPagamento").placeholder = "Informe o código de barras";
        atualizarPreviewAoVivo();
    });
}
/* ==========================================================
   MÁSCARA DE VALOR MONETÁRIO
========================================================== */
function configurarMascarasMonetarias() {
    document.querySelectorAll("input.money").forEach(input => {
        input.addEventListener("input", () => {
            const numero = somenteNumeros(input.value);
            input.value = numero === ""
                ? ""
                : moeda(Number(numero) / 100).replace("R$", "").trim();
        });
    });
}
/* ==========================================================
   ATUALIZAÇÃO AO VIVO DO PREVIEW
   Qualquer digitação/seleção dentro do formulário ativo já
   redesenha o documento na hora — não depende de nenhum botão.
========================================================== */
function configurarAtualizacaoAoVivo() {
    document.addEventListener("input", (evento) => {
        if (evento.target.closest(".page")) atualizarPreviewAoVivo();
    });
    document.addEventListener("change", (evento) => {
        if (evento.target.closest(".page")) atualizarPreviewAoVivo();
    });
}
function atualizarPreviewAoVivo() {
    const montar = MONTADORES[paginaAtivaId];
    if (!montar) return;
    mostrarPreview(montar());
}
/* ==========================================================
   DATA POR EXTENSO (cabeçalho — "São Paulo, 06 de julho de 2026.")
========================================================== */
const MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];
function dataExtenso() {
    const hoje = new Date();
    return `São Paulo, ${hoje.getDate()} de ${MESES[hoje.getMonth()]} de ${hoje.getFullYear()}.`;
}
/* ---------- data extenso a partir de um <input type="date"> ---------- */
function extensoData(valorInput) {
    if (!valorInput) return "";
    const [ano, mes, dia] = valorInput.split("-").map(Number);
    if (!ano || !mes || !dia) return "";
    return `${String(dia).padStart(2, "0")} de ${MESES[mes - 1]} de ${ano}`;
}
/* ---------- mês/ano a partir de <input type="month"> ---------- */
function mesAno(valorInput) {
    if (!valorInput) return "";
    const [ano, mes] = valorInput.split("-");
    return `${mes}/${ano}`;
}
/* ---------- data dd/mm/aaaa a partir de <input type="date"> ---------- */
function dataBR(valorInput) {
    if (!valorInput) return "";
    const [ano, mes, dia] = valorInput.split("-");
    return `${dia}/${mes}/${ano}`;
}
/* ==========================================================
   MOEDA
========================================================== */
function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
function somenteNumeros(texto) {
    return (texto || "").replace(/\D/g, "");
}
function valorCampo(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    return Number(somenteNumeros(el.value)) / 100;
}
function campo(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return el.value.trim();
}
/* ==========================================================
   FORMATA CNPJ
========================================================== */
function formatarCNPJ(cnpj) {
    cnpj = somenteNumeros(cnpj);
    if (cnpj.length !== 14) return cnpj;
    return cnpj.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
}
/* ==========================================================
   VALIDAÇÃO (usada só no clique de "Download PDF")
========================================================== */
function obrigatorio(id, nome) {
    const valor = campo(id);
    if (valor === "") {
        alert(`Informe ${nome}.`);
        const el = document.getElementById(id);
        if (el) el.focus();
        return false;
    }
    return true;
}
const VALIDADORES = {
    pesquisa: () => obrigatorio("identificadorPagamento", "o identificador") && obrigatorio("valorPagamento", "o valor"),
    contaAtiva: () => obrigatorio("cnpjAtiva", "o CNPJ") && obrigatorio("empresaAtiva", "a empresa") && obrigatorio("idContaAtiva", "o ID da Conta") && obrigatorio("dataCriacaoAtiva", "a data de criação"),
    contaCancelada: () => obrigatorio("cnpjCancelada", "o CNPJ") && obrigatorio("empresaCancelada", "a empresa") && obrigatorio("idContaCancelada", "o ID da Conta") && obrigatorio("dataCriacaoCancelada", "a data de criação") && obrigatorio("dataCancelamento", "a data de cancelamento"),
    dda: () => obrigatorio("clienteDDA", "o nome do cliente") && obrigatorio("codigoBarrasDDA", "o código de barras") && obrigatorio("valorDDA", "o valor") && obrigatorio("dataBaixaDDA", "a data da baixa"),
    circularizacao: () => obrigatorio("empresaCircularizacao", "a empresa") && obrigatorio("idContaCircularizacao", "o ID da Conta") && obrigatorio("dataBaseCircularizacao", "a data base"),
    titularidade: () => obrigatorio("empresaTitularidade", "a empresa") && obrigatorio("cnpjTitularidade", "o CNPJ") && obrigatorio("bancoTitularidade", "o banco") && obrigatorio("agenciaTitularidade", "a agência") && obrigatorio("contaTitularidade", "a conta") && obrigatorio("dataCadastroTitularidade", "a data de cadastro"),
    pagamentoDuplicado: () => obrigatorio("codigoBarrasDuplicado", "o código de barras") && obrigatorio("valorDuplicado", "o valor")
};
const NOMES_ARQUIVO = {
    pesquisa: "Verificacao_Pagamento.pdf",
    contaAtiva: "Conta_Ativa.pdf",
    contaCancelada: "Conta_Cancelada.pdf",
    dda: "Comprovante_DDA.pdf",
    circularizacao: "Carta_Circularizacao.pdf",
    titularidade: "Termo_Titularidade.pdf",
    pagamentoDuplicado: "Pagamento_Duplicado.pdf"
};
/* ==========================================================
   PLACEHOLDERS DO PREVIEW AO VIVO
   Enquanto um campo obrigatório não é preenchido, o documento
   mostra um marcador discreto no lugar (em vez de ficar quebrado
   ou vazio) — assim que o usuário preenche, o texto real aparece.
========================================================== */
function ph(valor, rotulo) {
    return valor ? valor : `<span class="ph">${rotulo}</span>`;
}
function phTexto(id, rotulo) {
    return ph(campo(id), rotulo);
}
function phCNPJ(id, rotulo) {
    const bruto = campo(id);
    return ph(bruto ? formatarCNPJ(bruto) : "", rotulo);
}
function phMoeda(id, rotulo) {
    const bruto = campo(id);
    return ph(bruto ? moeda(valorCampo(id)) : "", rotulo);
}
function phDataExtenso(id, rotulo) {
    return ph(extensoData(campo(id)), rotulo);
}
function phDataBR(id, rotulo) {
    return ph(dataBR(campo(id)), rotulo);
}
/* ==========================================================
   PREVIEW / CANVAS — exibido ao vivo no painel direito (A4)
   e também é o que vira o PDF no download.
========================================================== */
function mostrarPreview(html) {
    const canvas = document.getElementById("docCanvas");
    if (canvas) canvas.innerHTML = html;
}
/* ==========================================================
   LOGO DO DOCUMENTO
   Selo de texto genérico — versão de portfólio, sem marca real.
========================================================== */
function logoTag() {
    return `<div class="doc-logo doc-logo-fallback">Empresa Exemplo</div>`;
}
const RODAPE = `
    <div class="doc-footer">
        Documento gerado apenas para fins de demonstração &nbsp;·&nbsp; exemplo.com
    </div>
`;
/* ==========================================================
   1) VERIFICAÇÃO DE PAGAMENTO
========================================================== */
function montarHtmlPesquisa() {
    const rotuloCampo = tipoPagamento === "PIX" ? "identificador" : "código de barras";
    const identificador = phTexto("identificadorPagamento", rotuloCampo);
    const valor = phMoeda("valorPagamento", "valor");
    const resultado = campo("resultadoPesquisa") || document.getElementById("resultadoPesquisa").value;
    const via = tipoPagamento === "PIX" ? "Pix" : "boleto bancário";
    const rotulo = tipoPagamento === "PIX" ? "ID Fim a Fim" : "código de barras";
    const conclusao = resultado === "identificado"
        ? "Após análise do pagamento realizado, informamos que ele foi identificado e devidamente compensado em nosso sistema."
        : "Após análise do pagamento realizado, informamos que ele não foi identificado. Sugerimos que o pagador entre em contato com a financeira para localizar este pagamento.";
    return `
        ${logoTag()}
        <div class="doc-date">${dataExtenso()}</div>
        <p>Este é um texto de teste utilizado apenas para fins de demonstração do
        layout deste documento. Nenhum dado real de cliente, pagamento ou
        empresa está sendo exibido aqui — trata-se somente de um exemplo
        ilustrativo de como o conteúdo dinâmico é posicionado na página.</p>
        <p>Através da pesquisa de pagamento realizada via ${via} através do ${rotulo}:
        "${identificador}" no valor de "${valor}"</p>
        <p>${conclusao}</p>
        <p>Este parágrafo adicional também é apenas texto de teste, incluído para
        simular a extensão de um documento real e verificar o comportamento do
        layout com blocos de texto mais longos, quebras de linha e espaçamento
        entre parágrafos.</p>
        <p>Atenciosamente,<br><strong>Equipe Exemplo</strong></p>
        ${RODAPE}
    `;
}
/* ==========================================================
   2) CONTA ATIVA
========================================================== */
function montarHtmlContaAtiva() {
    const cnpj = phCNPJ("cnpjAtiva", "CNPJ");
    const empresa = phTexto("empresaAtiva", "razão social");
    const id = phTexto("idContaAtiva", "ID da conta");
    const dataCriacao = phDataExtenso("dataCriacaoAtiva", "data de criação");
    const hora = campo("horaCriacaoAtiva") || "00:00";
    return `
        ${logoTag()}
        <div class="doc-date">${dataExtenso()}</div>
        <p>Este documento contém apenas texto de teste, criado para demonstrar a
        estrutura visual da declaração. Todos os valores abaixo — nomes, CNPJ,
        datas e horários — são preenchidos dinamicamente a partir dos campos
        do formulário e não representam nenhuma empresa real.</p>
        <p>Empresa Exemplo Ltda., com sede fictícia utilizada apenas para fins
        ilustrativos deste protótipo,</p>
        <p>confirma a partir deste documento a existência de conta com o CNPJ ${cnpj},
        nomeada como <strong>${empresa}</strong> – ID: ${id}</p>
        <p>criada em ${dataCriacao}, horário ${hora}, e ativa até esta data.</p>
        <p>Atenciosamente,<br><strong>Equipe Exemplo</strong></p>
        ${RODAPE}
    `;
}
/* ==========================================================
   3) CONTA CANCELADA
========================================================== */
function montarHtmlContaCancelada() {
    const cnpj = phCNPJ("cnpjCancelada", "CNPJ");
    const empresa = phTexto("empresaCancelada", "razão social");
    const id = phTexto("idContaCancelada", "ID da conta");
    const dataCriacao = phDataExtenso("dataCriacaoCancelada", "data de criação");
    const dataCancelamento = phDataExtenso("dataCancelamento", "data de cancelamento");
    return `
        ${logoTag()}
        <div class="doc-date">${dataExtenso()}</div>
        <p>Texto de teste para fins de demonstração. Este parágrafo simula um
        texto institucional mais longo, apenas para verificar como o layout se
        comporta com blocos maiores de conteúdo, sem qualquer vínculo com dados
        reais de empresa ou cliente.</p>
        <p>Empresa Exemplo Ltda., com sede fictícia utilizada apenas para fins
        ilustrativos deste protótipo,</p>
        <p>confirma a partir deste documento o cancelamento da conta com o CNPJ ${cnpj},
        nomeada como <strong>${empresa}</strong> – ID: ${id}</p>
        <p>criada em ${dataCriacao} e cancelada em ${dataCancelamento}.</p>
        <p>Atenciosamente,<br><strong>Equipe Exemplo</strong></p>
        ${RODAPE}
    `;
}
/* ==========================================================
   4) BAIXA DE DDA
========================================================== */
function montarHtmlDDA() {
    const cliente = phTexto("clienteDDA", "nome do cliente");
    const codigo = phTexto("codigoBarrasDDA", "código de barras");
    const valor = phMoeda("valorDDA", "valor");
    const dataBaixa = phDataBR("dataBaixaDDA", "data da baixa");
    return `
        ${logoTag()}
        <div class="doc-date">${dataExtenso()}</div>
        <p>Texto de teste incluído apenas para demonstração deste modelo de
        documento. Os dados abaixo são meramente ilustrativos e servem para
        mostrar como o conteúdo dinâmico se encaixa no restante do texto.</p>
        <p>Informamos que o registro em nome de "${cliente}", com número de
        código de barras: "${codigo}", no valor de "${valor}" encontra-se finalizado
        junto a esta instituição desde "${dataBaixa}".</p>
        <p>Este é mais um parágrafo de teste, adicionado apenas para simular um
        texto mais extenso e verificar o espaçamento e a quebra de linhas do
        layout em cenários com maior volume de conteúdo.</p>
        <p>Atenciosamente,<br><strong>Equipe Exemplo</strong></p>
        ${RODAPE}
    `;
}
/* ==========================================================
   5) CARTA DE CIRCULARIZAÇÃO
========================================================== */
function montarHtmlCircularizacao() {
    const empresa = phTexto("empresaCircularizacao", "razão social");
    const idConta = phTexto("idContaCircularizacao", "ID da conta");
    const dataBase = phDataBR("dataBaseCircularizacao", "data base");
    const contaPagamento = phMoeda("saldoContaPagamento", "valor");
    const recebiveis = phMoeda("saldoContaRecebiveis", "valor");
    const vinculadaPagamento = phMoeda("vinculadaContaPagamento", "valor");
    const vinculadaRecebiveis = phMoeda("vinculadaContaRecebiveis", "valor");
    return `
        ${logoTag()}
        <div class="doc-date">${dataExtenso()}</div>
        <p>Texto de teste. Este trecho substitui o conteúdo institucional real e
        serve apenas para demonstrar a formatação da carta, incluindo a tabela
        de valores e a assinatura ao final do documento.</p>
        <p>Empresa Exemplo Ltda.,
        informamos os seguintes saldos em nome "${empresa}" em conta com
        data base em ${dataBase}:</p>
        <p>ID Conta: "${idConta}"</p>
        <div class="doc-table-row"><span>Conta Pagamento</span><span>"${contaPagamento}"</span></div>
        <div class="doc-table-row"><span>Recebíveis</span><span>"${recebiveis}"</span></div>
        <p class="doc-section-title">Contas vinculadas</p>
        <div class="doc-table-row"><span>Conta Pagamento</span><span>"${vinculadaPagamento}"</span></div>
        <div class="doc-table-row"><span>Recebíveis</span><span>"${vinculadaRecebiveis}"</span></div>
        <p class="doc-signature">Empresa Exemplo Ltda.</p>
        ${RODAPE}
    `;
}
/* ==========================================================
   6) TERMO DE TITULARIDADE (DECLARAÇÃO DE CONTA)
========================================================== */
function montarHtmlTitularidade() {
    const empresa = phTexto("empresaTitularidade", "razão social");
    const cnpj = phCNPJ("cnpjTitularidade", "CNPJ");
    const banco = phTexto("bancoTitularidade", "banco");
    const agencia = phTexto("agenciaTitularidade", "agência");
    const conta = phTexto("contaTitularidade", "conta");
    const dataCadastro = phDataExtenso("dataCadastroTitularidade", "data de cadastro");
    return `
        ${logoTag()}
        <div class="doc-date">${dataExtenso()}</div>
        <p>Texto de teste utilizado apenas para fins de demonstração deste
        modelo de declaração. O objetivo é mostrar como o layout se comporta
        com um texto de tamanho médio antes dos dados dinâmicos abaixo.</p>
        <p>À</p>
        <p><strong>${empresa}</strong><br>CNPJ: ${cnpj}</p>
        <p>De acordo com nossos registros a ${empresa}, CNPJ: ${cnpj}, é titular da
        conta de pagamentos ${conta}, agência ${agencia}, banco ${banco}, sendo
        cadastrado desde ${dataCadastro}.</p>
        <p>Limitado ao exposto.</p>
        <p class="doc-signature">Empresa Exemplo Ltda.</p>
        ${RODAPE}
    `;
}
/* ==========================================================
   7) PAGAMENTO DUPLICADO
========================================================== */
function montarHtmlPagamentoDuplicado() {
    const codigo = phTexto("codigoBarrasDuplicado", "código de barras");
    const valor = phMoeda("valorDuplicado", "valor");
    const resultado = campo("resultadoDuplicado") || document.getElementById("resultadoDuplicado").value;
    const paragrafos = resultado === "duplicado"
        ? `<p>Identificamos que houve pagamento duplicado relacionado ao código acima.</p>
           <p>Iremos dar continuidade ao processo de estorno do valor duplicado junto à financeira responsável.</p>`
        : `<p>Identificamos que não houve pagamento duplicado relacionado ao código acima.</p>
           <p>Sendo assim, sugerimos que o cliente entre em contato com a financeira para análise.</p>`;
    return `
        ${logoTag()}
        <div class="doc-date">${dataExtenso()}</div>
        <p>Este é apenas um texto de teste, criado para preencher o corpo do
        documento durante a demonstração do projeto. Nenhuma informação real
        de pagamento é utilizada aqui — os valores abaixo vêm dos campos de
        exemplo preenchidos no formulário ao lado.</p>
        <p>Através da pesquisa realizada via boleto bancário através do
        código de barras: "${codigo}" no valor de ${valor}.</p>
        ${paragrafos}
        <p>Atenciosamente,<br><strong>Equipe Exemplo</strong></p>
        ${RODAPE}
    `;
}
const MONTADORES = {
    pesquisa: montarHtmlPesquisa,
    contaAtiva: montarHtmlContaAtiva,
    contaCancelada: montarHtmlContaCancelada,
    dda: montarHtmlDDA,
    circularizacao: montarHtmlCircularizacao,
    titularidade: montarHtmlTitularidade,
    pagamentoDuplicado: montarHtmlPagamentoDuplicado
};
/* ==========================================================
   DOWNLOAD DO PDF (com espera de imagens — corrige PDF em branco)
========================================================== */
function aguardarImagens(container) {
    const imgs = Array.from(container.querySelectorAll("img"));
    const promessas = imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise(resolve => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
        });
    });
    return Promise.all(promessas);
}
function configurarBotaoDownload() {
    const botao = document.getElementById("btnBaixarPDF");
    if (!botao) return;
    botao.addEventListener("click", async () => {
        const validar = VALIDADORES[paginaAtivaId];
        if (validar && !validar()) return;
        // com todos os campos obrigatórios preenchidos, refaz o preview uma
        // última vez para garantir que nenhum placeholder entre no PDF
        atualizarPreviewAoVivo();
        const nomeArquivo = NOMES_ARQUIVO[paginaAtivaId] || "declaracao.pdf";
        await baixarPDFDireto(nomeArquivo, botao);
    });
}
async function baixarPDFDireto(nomeArquivo, botao) {
    const canvas = document.getElementById("docCanvas");
    if (!canvas || canvas.innerHTML.trim() === "") {
        alert("Preencha os dados da declaração primeiro.");
        return;
    }
    // Quando a página é aberta direto do disco (file://), o navegador trata as
    // imagens locais (logo/fundo) como "tainted" para o canvas e a geração do
    // PDF falha sempre. Isso só funciona de verdade servido por HTTP(S) —
    // ex: o link publicado no GitHub Pages.
    if (location.protocol === "file:") {
        alert(
            "Este arquivo foi aberto direto do computador (file://), e por isso o navegador " +
            "bloqueia a geração do PDF com as imagens do documento.\n\n" +
            "Para testar, acesse pelo link publicado (GitHub Pages) ou rode um servidor local, " +
            "em vez de abrir o index.html clicando duas vezes."
        );
        return;
    }
    if (botao) {
        botao.disabled = true;
        botao.dataset.textoOriginal = botao.innerHTML;
        botao.innerHTML = "Baixando...";
    }
    // ---------------------------------------------------------------
    // CORREÇÃO DO "PDF EM BRANCO":
    // o preview (#docCanvas) vive dentro de um painel com
    // "position: sticky" (.col-preview) e um contêiner com rolagem
    // própria (.preview-body { overflow: auto }). Essa combinação é um
    // bug conhecido do html2canvas: ele não calcula corretamente a
    // posição/recorte de elementos dentro de ancestrais sticky/overflow,
    // e o resultado é uma captura "fantasma" — o PDF sai gerado, mas em
    // branco, mesmo sem erro nenhum no console.
    // A solução robusta é clonar o conteúdo para um contêiner isolado,
    // fixado fora da área visível da tela (sem sticky, sem scroll), e
    // capturar esse clone — assim o html2canvas nunca lida com o painel
    // problemático.
    // ---------------------------------------------------------------
    const clone = canvas.cloneNode(true);
    clone.style.transform = "none";
    clone.style.margin = "0";

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    // Fora da área visível, mas ainda renderizado normalmente pelo
    // navegador (display:none faria o html2canvas capturar em branco).
    wrapper.style.transform = "translateX(-10000px)";
    wrapper.style.zIndex = "-1";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
        // Espera as imagens (se houver) carregarem de fato antes de
        // fotografar o conteúdo — sem isso o html2canvas pode capturar o
        // documento antes das imagens pintarem, gerando um PDF em branco.
        await aguardarImagens(clone);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const largura = clone.offsetWidth;
        const altura = clone.offsetHeight;

        // Altura de UMA página "impressa" (mesma proporção do fundo
        // decorativo, formato A4). Se o conteúdo passar de uma página, o
        // html2pdf fatia automaticamente em várias páginas reais.
        const ALTURA_PAGINA = 905;
        const alturaPagina = Math.min(altura, ALTURA_PAGINA);

        // Escala adaptativa: documentos muito longos usam escala menor para
        // manter a geração rápida e o canvas total dentro de um tamanho seguro.
        const escala = altura > 6000 ? 1 : altura > 3000 ? 1.5 : 2;

        const opcoes = {
            margin: 0,
            filename: nomeArquivo,
            image: {
                type: "jpeg",
                quality: 1
            },
            html2canvas: {
                scale: escala,
                useCORS: true,
                // O clone está isolado, sem sticky/scroll/zoom no caminho,
                // então a posição real dele já bate com (0,0) — não é mais
                // necessário compensar scroll da janela nem forçar
                // windowWidth/windowHeight do documento inteiro.
                scrollX: 0,
                scrollY: 0,
                windowWidth: largura,
                windowHeight: altura
            },
            jsPDF: {
                unit: "px",
                format: [largura, alturaPagina],
                orientation: "portrait"
            },
            pagebreak: {
                mode: ["css", "legacy"],
                avoid: "tr"
            }
        };

        await html2pdf().set(opcoes).from(clone).save();
    } catch (erro) {
        console.error(erro);
        const ehErroDeSeguranca = /tainted|SecurityError|cross-origin/i.test(String(erro && (erro.message || erro.name || erro)));
        if (ehErroDeSeguranca) {
            alert(
                "Não foi possível gerar o PDF porque o navegador bloqueou a leitura de algum " +
                "recurso do documento. Isso costuma acontecer quando a página não está sendo " +
                "servida por HTTP(S) (ex: aberta direto do arquivo local)."
            );
        } else {
            alert("Não foi possível gerar o PDF. Tente novamente.");
        }
    } finally {
        wrapper.remove();
        if (botao) {
            botao.disabled = false;
            botao.innerHTML = botao.dataset.textoOriginal;
        }
    }
}
/* ==========================================================
   ZOOM DO PREVIEW AO VIVO (A4) + TELA CHEIA
========================================================== */
function aplicarZoom() {
    const canvas = document.getElementById("docCanvas");
    if (canvas) canvas.style.transform = `scale(${zoomAtual / 100})`;
    const indicadorZoom = document.getElementById("zoomIndicator");
    if (indicadorZoom) indicadorZoom.innerText = `${zoomAtual}%`;
}
function configurarZoomControls() {
    aplicarZoom();
    ligar("btnZoomOut", () => { zoomAtual = Math.max(50, zoomAtual - 10); aplicarZoom(); });
    ligar("btnZoomIn", () => { zoomAtual = Math.min(200, zoomAtual + 10); aplicarZoom(); });
    ligar("btnFullscreen", () => {
        const viewport = document.getElementById("a4Viewport");
        if (viewport && viewport.requestFullscreen) viewport.requestFullscreen();
    });
}
function ligar(id, funcao) {
    const botao = document.getElementById(id);
    if (botao) botao.addEventListener("click", funcao);
}
