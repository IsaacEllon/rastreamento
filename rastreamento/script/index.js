async function buscar() {
  const termo = document.getElementById('busca').value.trim();
  const resultadoDiv = document.getElementById('resultado');
  const rastreioDiv = document.getElementById('rastreio');

  resultadoDiv.innerHTML = "Buscando...";
  rastreioDiv.innerHTML = "";

  try {
    const response = await fetch('pedidos.json');
    const pedidos = await response.json();

    const pedidosFiltrados = pedidos.filter(e => e.cpf === termo || e.numero === termo);

    if (pedidosFiltrados.length > 0) {
      resultadoDiv.innerHTML = ``;
      rastreioDiv.innerHTML = "<p><strong>Seus pedidos</strong></p>";

      pedidosFiltrados.forEach(pedido => {
        let infoPedido = "";

        if (!pedido.rastreio || pedido.rastreio.trim() === "") {
          infoPedido = `<p>Pedido <strong>#${pedido.numero}</strong> está em preparação!</p>`;
        } else {
          const linkRastreamento = `https://www.jtexpress.com.br/mobile/expressTracking`;

          infoPedido = `
            <p>Pedido<strong> #${pedido.numero}</strong> já foi enviado!</p>
            <p>Código de rastreio: <b>${pedido.rastreio}</b></p>
            <p><a href="${linkRastreamento}" target="_blank">Acompanhar na J&T Express</a></p>
          `;
        }

        rastreioDiv.innerHTML += infoPedido;
      });

    } else {
      resultadoDiv.innerHTML = "Pedido não encontrado. Verifique os dados digitados.";
      rastreioDiv.innerHTML = "";
    }

  } catch (error) {
    console.error('Erro ao carregar pedidos.json:', error);
    resultadoDiv.innerHTML = "Erro ao consultar pedidos.";
    rastreioDiv.innerHTML = "";
  }
}
