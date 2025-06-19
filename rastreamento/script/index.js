async function buscar() {
  const termo = document.getElementById('busca').value.trim();
  const resultadoDiv = document.getElementById('resultado');
  const rastreioDiv = document.getElementById('rastreio');

  resultadoDiv.innerHTML = "Buscando...";
  rastreioDiv.innerHTML = "";

  try {
    const response = await fetch('pedidos.json');
    const pedidos = await response.json();

    const pedido = pedidos.find(p => p.cpf === termo || p.numero === termo);

    if (pedido) {
      if (!pedido.rastreio || pedido.rastreio.trim() === "") {
        resultadoDiv.innerHTML = `Seu pedido está em preparação`;
        rastreioDiv.innerHTML = "";
      } else {
        resultadoDiv.innerHTML = `<strong>Pedido encontrado!</strong><br>Código de rastreio: <b>${pedido.rastreio}</b>`;

        const linkRastreamento = `https://www.jtexpress.com.br/mobile/expressTracking?code=${pedido.rastreio}`;

        rastreioDiv.innerHTML = `
          <p>Acompanhamento no site da transportadora:</p>
          <iframe src="${linkRastreamento}" style="width:100%; height:400px; border:none;"></iframe>
        `;
      }
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
