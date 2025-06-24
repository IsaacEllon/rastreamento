const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
const PORT = 3000;

// Configurações do seu app
const CLIENT_ID = '18785';
const CLIENT_SECRET = '94d8177394d43838a72861061e6e6fe9e8ff4aeeb9cd2609';
const REDIRECT_URI = 'http://localhost:3000/callback'; // ou sua URL em produção
const SCOPES = 'read_orders,write_products';

// Rota inicial: gera o link de autorização
app.get('/', (req, res) => {
  const authUrl = `https://www.nuvemshop.com.br/apps/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPES}`;
  res.send(`<a href="${authUrl}">Conectar com a Nuvemshop</a>`);
});

// Rota de callback: recebe o "code" e troca por access_token
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Code não fornecido.');
  }

  try {
    const response = await axios.post('https://www.nuvemshop.com.br/apps/token', qs.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, user_id, scope } = response.data;

    console.log('Token recebido:', response.data);

    // Buscar pedidos da loja com o token
    const orders = await getAllOrders(user_id, access_token);

    res.send(`<h2>Pedidos Recebidos: ${orders.length}</h2><pre>${JSON.stringify(orders, null, 2)}</pre>`);

  } catch (error) {
    console.error('Erro ao trocar code por token:', error.response?.data || error.message);
    res.status(500).send('Erro ao obter access_token.');
  }
});

// Função para buscar pedidos usando o token
const getAllOrders = async (storeId, accessToken) => {
  const headers = {
    'Authorization': `bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Rastreamento (isaacellon2018@gmail.com)'
  };

  let page = 1;
  const perPage = 50;
  let orders = [];
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(`https://api.nuvemshop.com.br/v1/${storeId}/orders`, {
        headers,
        params: {
          per_page: perPage,
          page,
          status: 'all'
        }
      });

      const data = response.data;
      if (data.length === 0) {
        hasMore = false;
      } else {
        orders = orders.concat(data);
        page++;
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error.response?.data || error.message);
      hasMore = false;
    }
  }

  return orders;
};

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
