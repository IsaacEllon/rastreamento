const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
const PORT = process.env.PORT || 3000;

// Dados do seu app da Nuvemshop
const CLIENT_ID = '18785';
const CLIENT_SECRET = '94d8177394d43838a72861061e6e6fe9e8ff4aeeb9cd2609';

// 🚨 IMPORTANTE: após deploy no Render, troque essa URL pelo domínio real:
const REDIRECT_URI = 'https://meu-app-nuvemshop.onrender.com/callback';

// Escopos necessários para ler pedidos e gerenciar produtos
const SCOPES = 'read_orders,write_products';

// Página inicial: link para autorizar o app
app.get('/', (req, res) => {
  const url = `https://www.nuvemshop.com.br/apps/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPES}`;
  res.send(`
    <h2>Integração com Nuvemshop</h2>
    <p><a href="${url}">Conectar com a Nuvemshop</a></p>
  `);
});

// Callback: troca o "code" pelo token de acesso
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Código de autorização ausente.');
  }

  try {
    const tokenResponse = await axios.post(
      'https://www.nuvemshop.com.br/apps/token',
      qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token, user_id } = tokenResponse.data;
    console.log('Token recebido:', tokenResponse.data);

    // Buscar pedidos da loja conectada
    const orders = await fetchOrders(user_id, access_token);

    res.send(`
      <h2>Pedidos da Loja</h2>
      <p>Total de pedidos: ${orders.length}</p>
      <pre>${JSON.stringify(orders, null, 2)}</pre>
    `);

  } catch (err) {
    console.error('Erro ao trocar o code por token:', err.response?.data || err.message);
    res.status(500).send('Erro ao obter token de acesso.');
  }
});

// Função para buscar todos os pedidos
async function fetchOrders(storeId, accessToken) {
  let page = 1;
  const perPage = 50;
  let orders = [];
  let hasMore = true;

  const headers = {
    'Authorization': `bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'MeuApp (contato@exemplo.com)'
  };

  while (hasMore) {
    try {
      const res = await axios.get(`https://api.nuvemshop.com.br/v1/${storeId}/orders`, {
        headers,
        params: {
          per_page: perPage,
          page,
          status: 'all'
        }
      });

      if (res.data.length === 0) {
        hasMore = false;
      } else {
        orders = orders.concat(res.data);
        page++;
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err.response?.data || err.message);
      hasMore = false;
    }
  }

  return orders;
}

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
