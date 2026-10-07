const https = require('https');

// Token do bot da loja
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8777035783:AAGpUAyVw73WQpjuli0aRb7D729D4rVNvCI';
const SITE_URL = 'https://lmstore-xi.vercel.app';
const WHATSAPP_URL = 'https://wa.me/5592981489393?text=Ol%C3%A1!%20Vim%20pelo%20bot%20do%20Telegram%20da%20Lm%20Exclusive.';

// Função auxiliar para enviar requisições à API do Telegram
function callTelegram(method, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Buscar produtos disponíveis no Firestore via REST
function getAvailableProducts() {
  return new Promise((resolve) => {
    const url = 'https://firestore.googleapis.com/v1/projects/lm-store-2a996/databases/(default)/documents/products?pageSize=100';
    https.get(url, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.documents) return resolve([]);
          const list = json.documents.map(d => {
            const f = d.fields || {};
            const id = d.name.split('/').pop();
            const name = f.name?.stringValue || 'Peça Exclusiva';
            const price = parseFloat(f.price?.doubleValue ?? f.price?.integerValue ?? 0);
            const stock = parseInt(f.stock?.integerValue ?? 1);
            const status = f.status?.stringValue || 'disponivel';
            const color = f.color?.stringValue || '';
            const size = f.size?.stringValue || 'Único';
            const code = f.code?.stringValue || '';
            let img = '';
            if (f.img?.arrayValue?.values && f.img.arrayValue.values.length > 0) {
              img = f.img.arrayValue.values[0].stringValue || '';
            } else if (f.img?.stringValue) {
              img = f.img.stringValue;
            }
            return { id, name, price, stock, status, color, size, code, img };
          }).filter(p => p.stock > 0 && p.status !== 'indisponivel');
          resolve(list);
        } catch(e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

// Menu principal com botões inline
const mainMenuKeyboard = {
  inline_keyboard: [
    [
      { text: "👗 Ver Coleção Disponível", callback_data: "cmd_colecao" },
      { text: "✨ Peças Únicas", callback_data: "cmd_unicas" }
    ],
    [
      { text: "🚚 Frete e Entregas", callback_data: "cmd_frete" },
      { text: "💳 Formas de Pagamento", callback_data: "cmd_pagamento" }
    ],
    [
      { text: "📏 Guia de Tamanhos", callback_data: "cmd_tamanhos" },
      { text: "🔄 Trocas e Devoluções", callback_data: "cmd_trocas" }
    ],
    [
      { text: "🛍️ Acessar Site Oficial", url: SITE_URL },
      { text: "💬 Falar no WhatsApp", url: WHATSAPP_URL }
    ]
  ]
};

// Respostas de FAQ
const faqResponses = {
  cmd_unicas: `✨ <b>Conceito de Peça Única - Lm Exclusive</b>\n\n` +
    `Na nossa loja, <b>todas as peças são modelos únicos e exclusivos</b>.\n\n` +
    `• Cada vestido, conjunto ou look tem apenas 1 exemplar.\n` +
    `• Assim que é vendido, o status muda para <i>Indisponível</i> e não há reposição idêntica.\n` +
    `• Isso garante que o seu visual seja verdadeiramente exclusivo! 💖`,

  cmd_frete: `🚚 <b>Frete e Entregas</b>\n\n` +
    `• <b>Frete Padrão Fixo:</b> Apenas R$ 15,00.\n` +
    `• <b>Envio por Aplicativo (Uber Flash / 99):</b> Ideal para receber rapidinho (valor pago pela cliente no app).\n` +
    `• <b>Despacho Ágil:</b> Enviamos sua peça logo após a confirmação do pedido!`,

  cmd_pagamento: `💳 <b>Formas de Pagamento</b>\n\n` +
    `• <b>PIX:</b> Aprovação imediata e separação prioritária.\n` +
    `• <b>Cartão de Crédito:</b> Em até 12x via InfinitePay com total segurança e criptografia.\n` +
    `• <b>Direto pelo WhatsApp:</b> Pode combinar também direto com a dona!`,

  cmd_tamanhos: `📏 <b>Tamanhos e Medidas</b>\n\n` +
    `Todas as peças contam com o tamanho informado na descrição (ex: P, M, G ou Único).\n\n` +
    `💡 <i>Dica:</i> Se quiser saber as medidas exatas em centímetros (busto, cintura, comprimento) ou pedir um vídeo da peça no corpo, nos chame no WhatsApp!`,

  cmd_trocas: `🔄 <b>Trocas e Devoluções</b>\n\n` +
    `Conforme o Código de Defesa do Consumidor, você tem até <b>7 dias corridos</b> após o recebimento para solicitar troca ou devolução.\n\n` +
    `A peça deve estar sem uso e com as etiquetas originais.`
};

// Normalização para busca de texto livre
function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Handler principal da Serverless Function (Vercel)
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Telegram Bot Webhook is active and running.');
  }

  const update = req.body;
  if (!update) return res.status(200).send('No body');

  // Tratar Callback Query (clique em botão inline)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const data = cb.data;

    // Responder callback para sumir o reloginho
    await callTelegram('answerCallbackQuery', { callback_query_id: cb.id });

    if (data === 'cmd_colecao') {
      await sendProductCatalog(chatId);
      return res.status(200).json({ ok: true });
    }

    if (faqResponses[data]) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: faqResponses[data],
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "👗 Ver Peças Disponíveis", callback_data: "cmd_colecao" },
              { text: "💬 Falar no WhatsApp", url: WHATSAPP_URL }
            ],
            [
              { text: "« Voltar ao Menu", callback_data: "cmd_menu" }
            ]
          ]
        }
      });
      return res.status(200).json({ ok: true });
    }

    if (data === 'cmd_menu') {
      await sendWelcome(chatId);
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  }

  // Tratar quando o bot é adicionado a um grupo
  if (update.message && update.message.new_chat_members) {
    const isBotAdded = update.message.new_chat_members.some(m => m.username === 'Larystoreexclusive_bot');
    if (isBotAdded) {
      const chatId = update.message.chat.id;
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: '💖 <b>Olá a todos do grupo!</b>\n\n' +
              'Fui adicionada para apresentar os looks exclusivos e peças únicas da <b>Lm Exclusive</b>! ✨\n\n' +
              '🛍️ <b>Comandos disponíveis:</b>\n' +
              '• /colecao - Ver fotos e preços das peças disponíveis\n' +
              '• /frete - Valores e opções de envio\n' +
              '• /pagamento - Formas de pagamento (PIX e Cartão 12x)\n' +
              '• /menu - Abrir menu completo\n\n' +
              `Ou acessem nossa vitrine oficial: ${SITE_URL}`,
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard
      });
      return res.status(200).json({ ok: true });
    }
  }

  // Tratar Mensagem de Texto
  if (update.message && update.message.text) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
    const text = msg.text.trim();
    let clean = normalize(text);

    // Remover sufixo @larystoreexclusive_bot se enviado em grupo (ex: /colecao@Larystoreexclusive_bot)
    clean = clean.replace(/@larystoreexclusive_bot/g, '').trim();
    const isMentioned = text.toLowerCase().includes('@larystoreexclusive_bot');

    // Comandos de Início
    if (clean === '/start' || clean === 'start' || clean === '/menu' || clean.startsWith('ola') || clean.startsWith('oi')) {
      await sendWelcome(chatId, msg.from?.first_name);
      return res.status(200).json({ ok: true });
    }

    // Comando de Ver Produtos
    if (clean === '/colecao' || clean === '/produtos' || clean === '/novidades' || clean.includes('catalogo') || clean.includes('colecao') || clean.includes('vestido') || clean.includes('conjunto') || clean.includes('peca')) {
      await sendProductCatalog(chatId);
      return res.status(200).json({ ok: true });
    }

    // Perguntas de Frete
    if (clean.includes('frete') || clean.includes('entrega') || clean.includes('envio') || clean.includes('prazo') || clean.includes('uber')) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: faqResponses.cmd_frete,
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard
      });
      return res.status(200).json({ ok: true });
    }

    // Perguntas de Pagamento
    if (clean.includes('pag') || clean.includes('pix') || clean.includes('cartao') || clean.includes('parcel') || clean.includes('infinite')) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: faqResponses.cmd_pagamento,
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard
      });
      return res.status(200).json({ ok: true });
    }

    // Perguntas de Tamanhos
    if (clean.includes('tamanho') || clean.includes('medida') || clean.includes('busto') || clean.includes('cintura') || clean.includes('quadril') || clean.includes('veste')) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: faqResponses.cmd_tamanhos,
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard
      });
      return res.status(200).json({ ok: true });
    }

    // Perguntas de Peças Únicas
    if (clean.includes('unica') || clean.includes('exclusiv') || clean.includes('reposi') || clean.includes('estoque')) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: faqResponses.cmd_unicas,
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard
      });
      return res.status(200).json({ ok: true });
    }

    // Perguntas de Trocas
    if (clean.includes('troca') || clean.includes('devol') || clean.includes('defeito') || clean.includes('garantia')) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: faqResponses.cmd_trocas,
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard
      });
      return res.status(200).json({ ok: true });
    }

    // Falar com Atendente
    if (clean.includes('whatsapp') || clean.includes('atendente') || clean.includes('falar') || clean.includes('humano') || clean.includes('dona')) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `💬 <b>Atendimento Humanizado no WhatsApp</b>\n\nNossa equipe está pronta para te atender com fotos exclusivas, tirar dúvidas ou ajudar a fechar o seu pedido!`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: "👉 Abrir Conversa no WhatsApp", url: WHATSAPP_URL }]
          ]
        }
      });
      return res.status(200).json({ ok: true });
    }

    // Se estiver em grupo e não foi um comando nem menção direta, ignorar para não fazer spam no grupo
    if (isGroup && !isMentioned && !text.startsWith('/')) {
      return res.status(200).json({ ok: true });
    }

    // Resposta padrão gentil
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `Olá! Sou a assistente virtual da <b>Lm Exclusive</b> 💖\n\nComo posso te ajudar hoje? Escolha uma das opções abaixo ou fale conosco no WhatsApp:`,
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
};

// Enviar mensagem de boas-vindas
async function sendWelcome(chatId, firstName = '') {
  const saudacao = firstName ? `Olá, <b>${firstName}</b>! ` : 'Olá! ';
  const text = `${saudacao}Seja muito bem-vinda à <b>Lm Exclusive - Moda Feminina</b> 💖✨\n\n` +
    `Aqui todas as nossas peças são <b>únicas e exclusivas</b> para valorizar o seu estilo!\n\n` +
    `Como posso te ajudar hoje? Escolha uma das opções abaixo:`;

  await callTelegram('sendMessage', {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    reply_markup: mainMenuKeyboard
  });
}

// Enviar catálogo de produtos disponíveis com fotos e link de compra
async function sendProductCatalog(chatId) {
  const products = await getAvailableProducts();

  if (products.length === 0) {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `No momento todas as nossas peças exclusivas estão reservadas ou esgotadas! Novidades chegando em breve ✨`,
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard
    });
    return;
  }

  // Enviar introdução
  await callTelegram('sendMessage', {
    chat_id: chatId,
    text: `✨ <b>Coleção Exclusiva Disponível (${products.length} peças únicas):</b>\n\nDeslize abaixo para ver os modelos disponíveis para compra imediata:`,
    parse_mode: 'HTML'
  });

  // Enviar até 6 peças principais com foto e botão direto para o site
  const limit = Math.min(6, products.length);
  for (let i = 0; i < limit; i++) {
    const p = products[i];
    const caption = `👗 <b>${p.name}</b>\n` +
      `📏 Tamanho: <b>${p.size}</b>\n` +
      `🎨 Cor: <b>${p.color}</b>\n` +
      `🏷️ Ref: <code>${p.code || p.id}</code>\n` +
      `💰 Preço: <b>R$ ${p.price.toFixed(2).replace('.', ',')}</b> (Peça Única)\n\n` +
      `✨ <i>Disponível para envio imediato!</i>`;

    const productButtons = {
      inline_keyboard: [
        [
          { text: "🛍️ Ver e Comprar no Site", url: `${SITE_URL}#produtos` },
          { text: "💬 Pedir no WhatsApp", url: `https://wa.me/5592981489393?text=${encodeURIComponent('Olá! Vi a peça "' + p.name + '" (Ref: ' + p.code + ') no Telegram e gostaria de garantir!')}` }
        ]
      ]
    };

    if (p.img && p.img.startsWith('http')) {
      await callTelegram('sendPhoto', {
        chat_id: chatId,
        photo: p.img,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: productButtons
      });
    } else {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: caption,
        parse_mode: 'HTML',
        reply_markup: productButtons
      });
    }
  }

  // Mensagem de encerramento com link para o site completo
  await callTelegram('sendMessage', {
    chat_id: chatId,
    text: `Para conferir todas as peças com fotos em alta definição, acesse nossa vitrine completa:`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 Abrir Vitrine Completa no Site", url: `${SITE_URL}#produtos` }],
        [{ text: "« Menu Principal", callback_data: "cmd_menu" }]
      ]
    }
  });
}
