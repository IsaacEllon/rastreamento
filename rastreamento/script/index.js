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
    const response = await fetch('script/cte_pedidos_jms.json');
    if (!response.ok) throw new Error('Erro ao carregar o JSON');

    const pedidos = await response.json();

    const pedido = pedidos.find(p => p.documento_destinatario === termo || p.pedido_jms === termo);

    if (pedido) {
      resultadoDiv.innerHTML = "";

      if (pedido.pedido_jms) {
        rastreioDiv.innerHTML = `
          <p><strong>Pedido encontrado!</strong></p>
          <p>Código de rastreio: <strong>${pedido.pedido_jms}</strong></p>
          <p><a href="https://www.jtexpress.com.br/mobile/expressTracking" target="_blank">Acompanhar na J&T Express</a></p>
        `;
      } else {
        rastreioDiv.innerHTML = `
          <p><strong>Pedido encontrado!</strong></p>
          <p>O pedido está em preparação. O código de rastreio ainda não foi gerado.</p>
        `;
      }

    } else {
      resultadoDiv.innerHTML = "Pedido não encontrado. Verifique os dados digitados.";
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    resultadoDiv.innerHTML = "Erro ao consultar pedidos.";
  }
}
