async function buscar() {
  let termo = document.getElementById('busca').value.trim();

  const resultadoDiv = document.getElementById('resultado');
  const rastreioDiv = document.getElementById('rastreio');

  resultadoDiv.innerHTML = "";
  rastreioDiv.innerHTML = "";

  if (!termo) {
    resultadoDiv.innerHTML = "Por favor, digite o CPF ou número do pedido.";
    return;
  }

  // 🔍 Limpar termo para conter apenas números
  termo = termo.replace(/\D/g, '');

  resultadoDiv.innerHTML = "Buscando...";

  try {
    const response = await fetch('script/resultado_combinado.json');
    if (!response.ok) throw new Error('Erro ao carregar o JSON');

    const pedidos = await response.json();

    // Converter termo para número se possível
    const numeroDigitado = parseInt(termo);

    // Maior número de pedido com rastreio
    const pedidosComRastreio = pedidos.filter(p =>
      p.pedido_jms && p.detalhes_pedido?.["Número do Pedido"]
    );

    const maiorNumeroComRastreio = Math.max(
      ...pedidosComRastreio.map(p =>
        parseInt(p.detalhes_pedido["Número do Pedido"].toString().replace(/\D/g, ''))
      ).filter(n => !isNaN(n)),
      0
    );

    // 🔎 Buscar por CPF, pedido_jms ou número do pedido (tudo com apenas números)
    const encontrados = pedidos.filter(p =>
      (p.cpf || "").replace(/\D/g, '') === termo ||
      (p.pedido_jms || "").replace(/\D/g, '') === termo ||
      (p.detalhes_pedido?.["Número do Pedido"] || "").toString().replace(/\D/g, '') === termo
    );

    // ✅ Remover duplicados por pedido_jms
    const unicosPorRastreio = [];
    const rastreiosVistos = new Set();

    for (const pedido of encontrados) {
      const rastreioLimpo = (pedido.pedido_jms || 'SEM_CODIGO').toString().replace(/\D/g, '');
      if (!rastreiosVistos.has(rastreioLimpo)) {
        rastreiosVistos.add(rastreioLimpo);
        unicosPorRastreio.push(pedido);
      }
    }

    // Exibe os resultados encontrados
    if (unicosPorRastreio.length > 0) {
      resultadoDiv.innerHTML = `<p><strong>${unicosPorRastreio.length} pedido(s) encontrado(s):</strong></p>`;

      rastreioDiv.innerHTML = unicosPorRastreio.map(pedido => {
        const numeroPedidoOriginal = pedido.detalhes_pedido?.["Número do Pedido"] || "";
        const numeroPedido = numeroPedidoOriginal.toString().replace(/\D/g, '') || "Não informado";

        const codigoRastreioOriginal = pedido.pedido_jms || "";
        const codigoRastreio = codigoRastreioOriginal.toString().replace(/\D/g, '') || "Não informado";

        if (codigoRastreio !== "Não informado") {
          return `
            <div style="margin-bottom: 15px;">
              <p>Número do Pedido:<p id="textoRastreamento"> ${numeroPedido}</p></p>
              <p>Código de Rastreamento:<p id="textoRastreamento"> ${codigoRastreio}</p></p>
              <p><a href="https://www.jtexpress.com.br/mobile/expressTracking" target="_blank">Acompanhar na J&T Express</a></p>
            </div>
          `;
        } else {
          return `
            <div style="margin-bottom: 15px;">
              <p>Número do Pedido: <p id="textoRastreamento">${numeroPedido}</p></p>
              <p><strong>Pedido em preparação.</strong></p>
              <p>O código de rastreio ainda não foi gerado.</p>
            </div>
          `;
        }
      }).join('');

    } else if (!isNaN(numeroDigitado) && numeroDigitado > maiorNumeroComRastreio) {
      // Se for um novo número de pedido
      resultadoDiv.innerHTML = `<p>Pedido <p id="textoRastreamento">${numeroDigitado}</p> ainda não possui código de rastreamento.</p>`;
      rastreioDiv.innerHTML = ``;

    } else {
      resultadoDiv.innerHTML = "Pedido não encontrado. Verifique os dados digitados.";
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    resultadoDiv.innerHTML = "Erro ao consultar pedidos.";
  }
}

// 🔁 Buscar ao pressionar Enter
document.getElementById('busca').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    buscar();
  }
});
