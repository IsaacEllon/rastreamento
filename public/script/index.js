async function buscar() {
  const termo = document.getElementById('busca').value.trim();
  const resultadoDiv = document.getElementById('resultado');
  const rastreioDiv = document.getElementById('rastreio');

  resultadoDiv.innerHTML = "";
  rastreioDiv.innerHTML = "";

  if (!termo) {
    resultadoDiv.innerHTML = "Por favor, digite o CPF ou número do pedido.";
    return;
  }

  resultadoDiv.innerHTML = "Buscando...";

  try {
    const response = await fetch('script/resultado_combinado.json');
    if (!response.ok) throw new Error('Erro ao carregar o JSON');

    const pedidos = await response.json();

    const pedidosEncontrados = pedidos.filter(p =>
      p.cpf === termo || p.pedido_jms === termo || p.detalhes_pedido?.["Número do Pedido"] === termo
    );

    if (pedidosEncontrados.length > 0) {
      resultadoDiv.innerHTML = `<p><strong>${pedidosEncontrados.length} pedido(s) encontrado(s):</strong></p>`;

      rastreioDiv.innerHTML = pedidosEncontrados.map(pedido => {
        const numeroPedido = pedido.detalhes_pedido?.["Número do Pedido"] || "Não informado";
        const codigoRastreio = pedido.pedido_jms || "";

        if (codigoRastreio) {
          return `
            <div style="margin-bottom: 15px;">
              <p><strong>Número do Pedido:</strong> ${numeroPedido}</p>
              <p><strong>Código de Rastreamento:</strong> ${codigoRastreio}</p>
              <p><a href="https://www.jtexpress.com.br/mobile/expressTracking" target="_blank">Acompanhar na J&T Express</a></p>
            </div>
          `;
        } else {
          return `
            <div style="margin-bottom: 15px;">
              <p><strong>Número do Pedido:</strong> ${numeroPedido}</p>
              <p><strong>Pedido em preparação.</strong></p>
              <p>O código de rastreio ainda não foi gerado.</p>
            </div>
          `;
        }
      }).join('');
    } else {
      resultadoDiv.innerHTML = "Pedido não encontrado. Verifique os dados digitados.";
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    resultadoDiv.innerHTML = "Erro ao consultar pedidos.";
  }
}
