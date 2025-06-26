function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;

  return cpf.charAt(9) == digito1 && cpf.charAt(10) == digito2;
}

async function buscar() {
  let termo = document.getElementById('busca').value.trim();
  termo = termo.replace(/\D/g, ''); // Apenas números

  const resultadoDiv = document.getElementById('resultado');
  const rastreioDiv = document.getElementById('rastreio');

  resultadoDiv.innerHTML = "";
  rastreioDiv.innerHTML = "";

  if (!termo) {
    resultadoDiv.innerHTML = "Por favor, digite o CPF.";
    return;
  }

  if (termo.length !== 11 || !validarCPF(termo)) {
    resultadoDiv.innerHTML = "O CPF informado é inválido. Verifique e tente novamente.";
    return;
  }

  resultadoDiv.innerHTML = `<div class="spinner"></div>`;

  try {
    const response = await fetch('script/resultado_combinado.json');
    if (!response.ok) throw new Error('Erro ao carregar o JSON');

    const pedidos = await response.json();

    const encontrados = pedidos.filter(p =>
      (p.cpf || "").replace(/\D/g, '') === termo
    );

    const unicosPorRastreio = [];
    const rastreiosVistos = new Set();

    for (const pedido of encontrados) {
      const rastreioLimpo = (pedido.pedido_jms || 'SEM_CODIGO').toString().replace(/\D/g, '');
      if (!rastreiosVistos.has(rastreioLimpo)) {
        rastreiosVistos.add(rastreioLimpo);
        unicosPorRastreio.push(pedido);
      }
    }

    if (unicosPorRastreio.length > 0) {
      resultadoDiv.innerHTML = `<p><strong>${unicosPorRastreio.length} pedido(s) encontrado(s):</strong></p>`;

      rastreioDiv.innerHTML = unicosPorRastreio.map(pedido => {
        const numeroPedido = (pedido.detalhes_pedido?.["Número do Pedido"] || "Não informado").toString().replace(/\D/g, '');
        const codigoRastreio = (pedido.pedido_jms || "").toString().replace(/\D/g, '') || "";

        if (codigoRastreio) {
          return `
            <div>
              <p class="pedido-id">Pedido: <span>${numeroPedido}</span></p>
              <div class="bloco-rastreamento">
                <p class="label-rastreamento">código de rastreamento:</p>
                <p class="codigo-rastreamento">${codigoRastreio}</p>
              </div>
              <a class="jt-button" href="https://www.jtexpress.com.br/mobile/expressTracking" target="_blank">acompanhar na J&T Express</a>
            </div>
          `;
        } else {
          return `
            <div>
              <p class="pedido-id">Pedido: <span>${numeroPedido}</span></p>
              <p><strong>Pedido em preparação.</strong></p>
              <p>O código de rastreio ainda não foi gerado.</p>
            </div>
          `;
        }
      }).join('');
    } else {
      resultadoDiv.innerHTML = `<p>Não localizamos pedidos com este CPF no momento. Se acabou de comprar, aguarde alguns minutos e tente novamente.</p>`;
      rastreioDiv.innerHTML = "";
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    resultadoDiv.innerHTML = "Erro ao consultar pedidos.";
  }
}

// Aciona busca com Enter
document.getElementById('busca').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    buscar();
  }
});
