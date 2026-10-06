/**
 * Chatbot de Atendimento ao Cliente - Lm Exclusive
 * Especializado em dúvidas comuns de e-commerce e moda feminina exclusiva
 */

(function(){
  // Base de conhecimento estruturada com padrões de mercado
  const knowledgeBase = [
    {
      id: 'tamanhos',
      btn: '📏 Tamanhos e Medidas',
      keywords: ['tamanho', 'tamanhos', 'medida', 'medidas', 'veste', 'numeracao', 'numeração', 'busto', 'cintura', 'quadril', 'tabela'],
      response: `👗 <strong>Tamanhos e Medidas:</strong><br><br>
Todas as nossas peças são exclusivas e contam com o tamanho informado no próprio card (P, M, G ou Peça Única).<br><br>
✨ <em>Dica de ouro:</em> se você quiser saber as medidas exatas em centímetros (busto, cintura, comprimento) ou pedir um vídeo da peça no corpo, nos chame no WhatsApp!`,
      action: {
        text: 'Pedir medidas no WhatsApp',
        url: 'https://wa.me/5592981489393?text=Ol%C3%A1!%20Gostaria%20de%20saber%20as%20medidas%20de%20uma%20pe%C3%A7a%20do%20site.'
      }
    },
    {
      id: 'pagamento',
      btn: '💳 Formas de Pagamento',
      keywords: ['pagamento', 'pagamentos', 'pagar', 'cartao', 'cartão', 'pix', 'parcela', 'parcelas', 'parcelamento', 'infinitepay', 'debito', 'débito', 'dinheiro'],
      response: `💳 <strong>Formas de Pagamento Aceitas:</strong><br><br>
• <strong>PIX:</strong> Confirmação e separação imediata da peça.<br>
• <strong>Cartão de Crédito:</strong> Em até 12x com ambiente criptografado e seguro via <em>InfinitePay</em>.<br>
• <strong>Pelo WhatsApp:</strong> Você também pode acertar diretamente com a nossa equipe.`,
      action: {
        text: 'Ver Peças na Coleção',
        scroll: '#produtos'
      }
    },
    {
      id: 'frete',
      btn: '🚚 Frete e Entregas',
      keywords: ['frete', 'entrega', 'entregas', 'envio', 'envios', 'prazo', 'tempo', 'demora', 'uber', 'correios', 'taxa', 'receber'],
      response: `🚚 <strong>Frete e Prazos de Envio:</strong><br><br>
• <strong>Frete Fixo Padrão:</strong> Apenas R$ 15,00.<br>
• <strong>Envio por Aplicativo (Uber Flash / 99):</strong> Disponível para Manaus e região, com valor por conta da cliente.<br>
• <strong>Envios Rápidos:</strong> Despachamos sua peça logo após a confirmação do pedido!`,
      action: {
        text: 'Consultar envio no WhatsApp',
        url: 'https://wa.me/5592981489393?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20o%20frete%20para%20o%20meu%20endere%C3%A7o.'
      }
    },
    {
      id: 'pecas_unicas',
      btn: '✨ Como funcionam as Peças Únicas?',
      keywords: ['unica', 'única', 'unicas', 'únicas', 'exclusiva', 'exclusivo', 'reposicao', 'reposição', 'estoque', 'acabar', 'indisponivel', 'indisponível'],
      response: `✨ <strong>Exclusividade Lm Exclusive:</strong><br><br>
Trabalhamos com o conceito de <strong>peça única</strong>! Cada look do site possui apenas 1 unidade disponível.<br><br>
Assim que é vendida, ela passa para o status <em>"Indisponível"</em> e não tem reposição igual. Isso garante que seu visual seja verdadeiramente exclusivo! 💖`,
      action: {
        text: 'Explorar Peças Disponíveis',
        scroll: '#produtos'
      }
    },
    {
      id: 'trocas',
      btn: '🔄 Trocas e Devoluções',
      keywords: ['troca', 'trocas', 'trocar', 'devolucao', 'devolução', 'devolver', 'defeito', 'garantia', 'serviu', 'direito'],
      response: `🔄 <strong>Política de Troca e Devolução:</strong><br><br>
Conforme o Código de Defesa do Consumidor, você tem até <strong>7 dias corridos</strong> após o recebimento para solicitar troca ou devolução.<br><br>
A peça deve estar sem uso, sem odores e com as etiquetas originais afixadas. A nossa equipe auxilia em todo o processo pelo WhatsApp.`,
      action: {
        text: 'Falar sobre Troca',
        url: 'https://wa.me/5592981489393?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20troca/devolu%C3%A7%C3%A3o.'
      }
    },
    {
      id: 'como_comprar',
      btn: '🛍️ Como Comprar no Site?',
      keywords: ['comprar', 'compro', 'pedido', 'pedir', 'sacola', 'carrinho', 'finalizar', 'passo', 'como faco', 'como faço'],
      response: `🛍️ <strong>Como Fazer Seu Pedido:</strong><br><br>
1. Navegue pelo catálogo e escolha sua peça exclusiva.<br>
2. Clique no botão <strong>"Comprar"</strong> ou <strong>"Adicionar"</strong>.<br>
3. Abra a sacola de compras no canto superior direito.<br>
4. Escolha entre pagar online via <em>InfinitePay</em> ou enviar o pedido pronto para o nosso <em>WhatsApp</em>!`,
      action: {
        text: 'Ver Vitrine Agora',
        scroll: '#produtos'
      }
    },
    {
      id: 'atendente',
      btn: '💬 Falar com a Atendente',
      keywords: ['atendente', 'humano', 'falar', 'pessoa', 'whatsapp', 'whats', 'zap', 'telefone', 'contato', 'laryssa', 'dona'],
      response: `💖 <strong>Atendimento Humanizado:</strong><br><br>
Nossa equipe está disponível no WhatsApp para te ajudar com fotos adicionais, dúvidas sobre tecidos, caimento ou para montar seu pedido personalizado!`,
      action: {
        text: 'Abrir Conversa no WhatsApp',
        url: 'https://wa.me/5592981489393?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Lm%20Exclusive%20e%20gostaria%20de%20ajuda!'
      }
    }
  ];

  // Injetar HTML do Chatbot
  function injectChatbotHTML() {
    if (document.getElementById('lmChatWidget')) return;

    const chatHTML = `
      <!-- BOTÃO FLUTUANTE DO CHATBOT -->
      <div class="lm-chat-launcher" id="lmChatLauncher" title="Tire suas dúvidas conosco">
        <span class="lm-chat-pulse"></span>
        <div class="lm-chat-badge-status"></div>
        <span class="lm-chat-launcher-icon">💬</span>
        <span class="lm-chat-launcher-close">✕</span>
        <div class="lm-chat-tooltip" id="lmChatTooltip">Dúvidas? Fale com a gente! ✨</div>
      </div>

      <!-- JANELA DO CHATBOT -->
      <div class="lm-chat-box" id="lmChatBox" aria-hidden="true">
        <!-- CABEÇALHO -->
        <div class="lm-chat-header">
          <div class="lm-chat-header-info">
            <div class="lm-chat-avatar">✨</div>
            <div>
              <div class="lm-chat-title">Assistente Lm Exclusive</div>
              <div class="lm-chat-status">
                <span class="lm-chat-dot"></span> Atendimento Online
              </div>
            </div>
          </div>
          <button class="lm-chat-close-btn" id="lmChatCloseBtn" aria-label="Fechar chat">✕</button>
        </div>

        <!-- HISTÓRICO DE MENSAGENS -->
        <div class="lm-chat-messages" id="lmChatMessages">
          <div class="lm-chat-msg bot">
            <div class="lm-chat-bubble">
              Olá! Seja muito bem-vinda à <strong>Lm Exclusive</strong> 💖<br><br>
              Como todas as nossas peças são <strong>únicas e exclusivas</strong>, estou aqui para tirar suas dúvidas em segundos. Escolha um assunto abaixo ou digite sua pergunta:
            </div>
            <span class="lm-chat-time">Agora</span>
          </div>

          <!-- BOTÕES RÁPIDOS SUGERIDOS -->
          <div class="lm-chat-chips" id="lmChatChips">
            ${knowledgeBase.map(item => `
              <button type="button" class="lm-chat-chip" data-kb="${item.id}">${item.btn}</button>
            `).join('')}
          </div>
        </div>

        <!-- INDICADOR DIGITANDO -->
        <div class="lm-chat-typing" id="lmChatTyping" style="display:none;">
          <span></span><span></span><span></span>
        </div>

        <!-- CAMPO DE ENTRADA -->
        <form class="lm-chat-footer" id="lmChatForm">
          <input type="text" id="lmChatInput" placeholder="Digite sua dúvida aqui..." autocomplete="off">
          <button type="submit" id="lmChatSendBtn" aria-label="Enviar mensagem">➤</button>
        </form>
        <div class="lm-chat-subfooter">
          Atendimento seguro • <a href="https://wa.me/5592981489393?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Lm%20Exclusive." target="_blank" rel="noopener">Falar no WhatsApp</a>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.id = 'lmChatWidget';
    div.innerHTML = chatHTML;
    document.body.appendChild(div);
  }

  // Estilos CSS do Chatbot
  function injectChatbotCSS() {
    if (document.getElementById('lmChatStyles')) return;
    const style = document.createElement('style');
    style.id = 'lmChatStyles';
    style.textContent = `
      /* Launcher Flutuante */
      .lm-chat-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4F4352 0%, #2D242E 100%);
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        z-index: 999;
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .lm-chat-launcher:hover {
        transform: scale(1.06);
        box-shadow: 0 8px 26px rgba(0,0,0,0.32);
      }
      .lm-chat-launcher-icon {
        font-size: 1.65rem;
        transition: transform .25s ease;
      }
      .lm-chat-launcher-close {
        display: none;
        font-size: 1.4rem;
        font-weight: bold;
      }
      .lm-chat-launcher.open .lm-chat-launcher-icon {
        display: none;
      }
      .lm-chat-launcher.open .lm-chat-launcher-close {
        display: block;
      }
      .lm-chat-badge-status {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 13px;
        height: 13px;
        background: #10B981;
        border: 2px solid #FFFFFF;
        border-radius: 50%;
      }
      .lm-chat-tooltip {
        position: absolute;
        right: 70px;
        background: var(--ink, #110E13);
        color: #FFFFFF;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        pointer-events: none;
        opacity: 0;
        transform: translateX(10px);
        transition: all .3s ease;
      }
      .lm-chat-tooltip.show {
        opacity: 1;
        transform: translateX(0);
      }

      /* Janela do Chat */
      .lm-chat-box {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 375px;
        max-width: calc(100vw - 32px);
        height: 540px;
        max-height: calc(85vh - 100px);
        background: #FFFFFF;
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.22);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transform: translateY(20px) scale(0.96);
        transition: opacity .3s cubic-bezier(0.16, 1, 0.3, 1), transform .3s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(0,0,0,0.08);
      }
      .lm-chat-box.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      /* Cabeçalho */
      .lm-chat-header {
        background: linear-gradient(135deg, #4F4352 0%, #302633 100%);
        color: #FFFFFF;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .lm-chat-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .lm-chat-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255,255,255,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .lm-chat-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.18rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        line-height: 1.2;
      }
      .lm-chat-status {
        font-size: 0.72rem;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .lm-chat-dot {
        width: 7px;
        height: 7px;
        background: #10B981;
        border-radius: 50%;
        display: inline-block;
      }
      .lm-chat-close-btn {
        background: none;
        border: none;
        color: #FFFFFF;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.8;
        padding: 4px;
        line-height: 1;
        transition: opacity .2s;
      }
      .lm-chat-close-btn:hover {
        opacity: 1;
      }

      /* Mensagens */
      .lm-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #FAF7F9;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .lm-chat-msg {
        display: flex;
        flex-direction: column;
        max-width: 86%;
        animation: chatMsgIn .25s ease-out;
      }
      @keyframes chatMsgIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .lm-chat-msg.bot {
        align-self: flex-start;
      }
      .lm-chat-msg.user {
        align-self: flex-end;
      }
      .lm-chat-bubble {
        padding: 11px 14px;
        font-size: 0.86rem;
        line-height: 1.45;
        border-radius: 12px;
        word-break: break-word;
      }
      .lm-chat-msg.bot .lm-chat-bubble {
        background: #FFFFFF;
        color: #110E13;
        border: 1px solid #EBE4E9;
        border-bottom-left-radius: 2px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      }
      .lm-chat-msg.user .lm-chat-bubble {
        background: #4F4352;
        color: #FFFFFF;
        border-bottom-right-radius: 2px;
        box-shadow: 0 2px 6px rgba(79,67,82,0.25);
      }
      .lm-chat-time {
        font-size: 0.65rem;
        color: #8C828D;
        margin-top: 4px;
        padding: 0 4px;
      }
      .lm-chat-msg.user .lm-chat-time {
        text-align: right;
      }

      /* Botões rápidos (Chips) */
      .lm-chat-chips {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 6px;
      }
      .lm-chat-chip {
        background: #FFFFFF;
        border: 1px solid #DDD3DC;
        border-radius: 18px;
        padding: 8px 12px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #4F4352;
        text-align: left;
        cursor: pointer;
        transition: all .2s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      }
      .lm-chat-chip:hover {
        background: #4F4352;
        color: #FFFFFF;
        border-color: #4F4352;
        transform: translateX(3px);
      }

      /* Botão de ação anexado à resposta */
      .lm-chat-action-btn {
        display: inline-block;
        margin-top: 8px;
        background: #10B981;
        color: #FFFFFF !important;
        font-weight: 700;
        font-size: 0.78rem;
        padding: 8px 14px;
        border-radius: 20px;
        text-decoration: none;
        text-align: center;
        transition: background .2s ease;
      }
      .lm-chat-action-btn:hover {
        background: #059669;
      }

      /* Indicador de Digitação */
      .lm-chat-typing {
        padding: 8px 16px;
        background: #FAF7F9;
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .lm-chat-typing span {
        width: 6px;
        height: 6px;
        background: #B5A6B1;
        border-radius: 50%;
        animation: typingDot 1.2s infinite ease-in-out;
      }
      .lm-chat-typing span:nth-child(2) { animation-delay: .2s; }
      .lm-chat-typing span:nth-child(3) { animation-delay: .4s; }
      @keyframes typingDot {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* Entrada de Texto */
      .lm-chat-footer {
        padding: 10px 12px;
        background: #FFFFFF;
        border-top: 1px solid #EBE4E9;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .lm-chat-footer input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #DDD3DC;
        border-radius: 20px;
        font-family: inherit;
        font-size: 0.85rem;
        outline: none;
        color: #110E13;
        background: #FAF7F9;
        transition: border-color .2s;
      }
      .lm-chat-footer input:focus {
        border-color: #4F4352;
        background: #FFFFFF;
      }
      .lm-chat-footer button {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #4F4352;
        color: #FFFFFF;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        transition: background .2s;
      }
      .lm-chat-footer button:hover {
        background: #332936;
      }
      .lm-chat-subfooter {
        text-align: center;
        font-size: 0.68rem;
        color: #8C828D;
        padding: 5px 0 8px;
        background: #FFFFFF;
      }
      .lm-chat-subfooter a {
        color: #10B981;
        font-weight: 700;
        text-decoration: underline;
      }

      /* Modo Escuro */
      [data-theme="dark"] .lm-chat-box {
        background: #1E293B;
        border-color: #334155;
      }
      [data-theme="dark"] .lm-chat-messages {
        background: #0F172A;
      }
      [data-theme="dark"] .lm-chat-msg.bot .lm-chat-bubble {
        background: #1E293B;
        color: #F1F5F9;
        border-color: #334155;
      }
      [data-theme="dark"] .lm-chat-chip {
        background: #1E293B;
        color: #F1F5F9;
        border-color: #334155;
      }
      [data-theme="dark"] .lm-chat-chip:hover {
        background: #F06292;
        border-color: #F06292;
        color: #0F172A;
      }
      [data-theme="dark"] .lm-chat-footer,
      [data-theme="dark"] .lm-chat-subfooter {
        background: #1E293B;
        border-color: #334155;
      }
      [data-theme="dark"] .lm-chat-footer input {
        background: #0F172A;
        color: #FFFFFF;
        border-color: #334155;
      }

      /* Responsividade no Celular */
      @media (max-width: 600px) {
        .lm-chat-launcher {
          bottom: 18px;
          right: 18px;
          width: 54px;
          height: 54px;
        }
        .lm-chat-box {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100vw;
          max-width: 100vw;
          height: 85vh;
          max-height: 85vh;
          border-radius: 18px 18px 0 0;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.3);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Normalização para busca de texto
  function normalizeText(text) {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Encontrar melhor resposta
  function findBestResponse(userText) {
    const clean = normalizeText(userText);

    // Saudação
    if (/^(oi|ola|olá|bom dia|boa tarde|boa noite|opa)/i.test(clean)) {
      return {
        response: `Olá! Que alegria ter você aqui na Lm Exclusive ✨<br><br>Todas as nossas peças são modelos únicos e exclusivos. Sobre o que você gostaria de saber?`,
        chips: knowledgeBase
      };
    }

    // Busca por palavra-chave na base de conhecimento
    for (const item of knowledgeBase) {
      for (const kw of item.keywords) {
        if (clean.includes(normalizeText(kw))) {
          return item;
        }
      }
    }

    // Resposta padrão caso não reconheça
    return {
      response: `Ainda estou aprendendo sobre esse assunto específico, mas a nossa equipe pode te responder em detalhes agora mesmo! 💖<br><br>Você gostaria de falar com a dona no WhatsApp ou escolher uma das opções abaixo?`,
      action: {
        text: 'Chamar no WhatsApp',
        url: `https://wa.me/5592981489393?text=${encodeURIComponent('Olá! Estava no chat do site com a seguinte dúvida: ' + userText)}`
      },
      chips: knowledgeBase.slice(0, 4)
    };
  }

  // Adicionar mensagem no chat
  function addMessage(htmlContent, isUser = false, action = null, chips = null) {
    const container = document.getElementById('lmChatMessages');
    if (!container) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `lm-chat-msg ${isUser ? 'user' : 'bot'}`;

    let actionHTML = '';
    if (action) {
      if (action.url) {
        actionHTML = `<br><a href="${action.url}" target="_blank" rel="noopener" class="lm-chat-action-btn">${action.text} ➔</a>`;
      } else if (action.scroll) {
        actionHTML = `<br><a href="${action.scroll}" class="lm-chat-action-btn lm-chat-scroll-btn">${action.text} ➔</a>`;
      }
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    msgDiv.innerHTML = `
      <div class="lm-chat-bubble">${htmlContent} ${actionHTML}</div>
      <span class="lm-chat-time">${timeStr}</span>
    `;

    container.appendChild(msgDiv);

    // Adicionar chips de continuação se houver
    if (chips && chips.length > 0) {
      const chipsDiv = document.createElement('div');
      chipsDiv.className = 'lm-chat-chips';
      chipsDiv.innerHTML = chips.map(c => `<button type="button" class="lm-chat-chip" data-kb="${c.id}">${c.btn}</button>`).join('');
      container.appendChild(chipsDiv);
    }

    // Scroll para o fim
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }

  // Eventos e inicialização
  function initChatEvents() {
    const launcher = document.getElementById('lmChatLauncher');
    const box = document.getElementById('lmChatBox');
    const closeBtn = document.getElementById('lmChatCloseBtn');
    const form = document.getElementById('lmChatForm');
    const input = document.getElementById('lmChatInput');
    const typing = document.getElementById('lmChatTyping');
    const tooltip = document.getElementById('lmChatTooltip');

    if (!launcher || !box) return;

    // Mostrar tooltip após 4 segundos
    setTimeout(() => {
      if (tooltip && !box.classList.contains('open')) {
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 6000);
      }
    }, 3500);

    // Toggle chat
    function toggleChat() {
      const isOpen = box.classList.contains('open');
      if (isOpen) {
        box.classList.remove('open');
        launcher.classList.remove('open');
        box.setAttribute('aria-hidden', 'true');
      } else {
        box.classList.add('open');
        launcher.classList.add('open');
        box.setAttribute('aria-hidden', 'false');
        if (tooltip) tooltip.classList.remove('show');
        setTimeout(() => input.focus(), 300);
      }
    }

    launcher.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Responder clique em chips de dúvidas rápidas
    document.addEventListener('click', function(e) {
      const chip = e.target.closest('.lm-chat-chip');
      if (chip) {
        const kbId = chip.dataset.kb;
        const item = knowledgeBase.find(k => k.id === kbId);
        if (item) {
          addMessage(chip.textContent, true);
          typing.style.display = 'flex';
          const container = document.getElementById('lmChatMessages');
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

          setTimeout(() => {
            typing.style.display = 'none';
            addMessage(item.response, false, item.action);
          }, 450);
        }
        return;
      }

      // Scroll interno ao clicar em ação de ver produtos
      const scrollBtn = e.target.closest('.lm-chat-scroll-btn');
      if (scrollBtn) {
        toggleChat();
      }
    });

    // Enviar mensagem digitada
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      addMessage(text, true);
      input.value = '';

      typing.style.display = 'flex';
      const container = document.getElementById('lmChatMessages');
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

      setTimeout(() => {
        typing.style.display = 'none';
        const match = findBestResponse(text);
        addMessage(match.response, false, match.action, match.chips);
      }, 550);
    });
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectChatbotCSS();
      injectChatbotHTML();
      initChatEvents();
    });
  } else {
    injectChatbotCSS();
    injectChatbotHTML();
    initChatEvents();
  }
})();
