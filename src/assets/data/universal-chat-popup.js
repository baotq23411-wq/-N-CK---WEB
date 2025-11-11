(function(h,a){typeof exports=="object"&&typeof module<"u"?a(exports):typeof define=="function"&&define.amd?define(["exports"],a):(h=typeof globalThis<"u"?globalThis:h||self,a(h.UniversalChatPopup={}))})(this,function(h){"use strict";var M=Object.defineProperty;var v=(h,a,u)=>a in h?M(h,a,{enumerable:!0,configurable:!0,writable:!0,value:u}):h[a]=u;var n=(h,a,u)=>v(h,typeof a!="symbol"?a+"":a,u);class a extends HTMLElement{constructor(){super();n(this,"shadow");this.shadow=this.attachShadow({mode:"closed"})}addStyles(e){const t=new CSSStyleSheet;t.replaceSync(e),this.shadow.adoptedStyleSheets=[t]}createElement(e,t,s){const i=document.createElement(e);return t&&(i.className=t),s&&(i.textContent=s),i}}class u extends a{constructor(){super();n(this,"styles",`
    .launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--theme-color, #1E40AF);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .launcher:hover {
      transform: scale(1.05);
    }

    .launcher svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
  `);n(this,"isOpen",!1);this.addStyles(this.styles),this.render()}static get observedAttributes(){return["theme-color"]}attributeChangedCallback(e,t,s){t!==s&&e==="theme-color"&&this.render()}render(){this.shadow.innerHTML="";const e=this.createElement("button","launcher");e.innerHTML=this.getChatIcon(),e.addEventListener("click",()=>this.toggleChat()),this.shadow.appendChild(e)}toggleChat(){this.isOpen=!this.isOpen,this.dispatchEvent(new CustomEvent("toggleChat",{detail:{isOpen:this.isOpen},bubbles:!0,composed:!0}))}getChatIcon(){return`
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    `}}customElements.define("chat-launcher",u);class m{constructor(o){n(this,"storageKey");this.storageKey=`chat_history_${btoa(o)}`}getMessages(){try{const o=localStorage.getItem(this.storageKey);return o?JSON.parse(o):[]}catch(o){return console.error("Failed to load chat history:",o),[]}}addMessage(o){try{const e=this.getMessages();e.push(o),localStorage.setItem(this.storageKey,JSON.stringify(e))}catch(e){console.error("Failed to save message:",e)}}updateMessage(o,e){try{const t=this.getMessages(),s=t.findIndex(i=>i.id===o);s!==-1&&(t[s]={...t[s],...e},localStorage.setItem(this.storageKey,JSON.stringify(t)))}catch(t){console.error("Failed to update message:",t)}}clearHistory(){try{localStorage.removeItem(this.storageKey)}catch(o){console.error("Failed to clear history:",o)}}}class b{constructor(o){n(this,"url");n(this,"controller",null);this.url=o}async sendMessage(o){this.controller&&this.controller.abort(),this.controller=new AbortController;try{const e=await fetch(this.url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o),signal:this.controller.signal});if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);const t=await e.json();return this.controller=null,t}catch(e){throw e instanceof Error&&e.name==="AbortError"?new Error("Request cancelled"):e}}cancelRequest(){this.controller&&(this.controller.abort(),this.controller=null)}}class C extends a{constructor(){super();n(this,"styles",`
    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 320px;
      height: 480px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    }

    .chat-window.open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    :host([position="bottom-left"]) .chat-window {
      right: auto;
      left: 0;
    }

    .header {
      padding: 16px;
      background-color: var(--theme-color, #1E40AF);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .header button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .header button:hover {
      opacity: 1;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .message {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
    }

    .message.user {
      align-self: flex-end;
      background-color: var(--theme-color, #1E40AF);
      color: white;
    }

    .message.backend {
      align-self: flex-start;
      background-color: #f0f0f0;
      color: #333;
    }

    .message.system {
      align-self: center;
      background-color: #f5f5f5;
      color: #666;
      font-style: italic;
      font-size: 13px;
    }

    .message.error {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .message-status {
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.8;
    }

    .cancel-button {
      font-size: 12px;
      padding: 2px 6px;
      background: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 8px;
    }

    .input-area {
      padding: 16px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
    }

    .input-area input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 14px;
    }

    .input-area button {
      background-color: var(--theme-color, #1E40AF);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.2s;
    }

    .input-area button:hover {
      opacity: 0.9;
    }

    .input-area button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `);n(this,"isOpen",!1);n(this,"storage");n(this,"webhook");n(this,"sessionId");n(this,"hasShownWelcomeMessage",!1);const e=this.getAttribute("webhook-url")||"";this.storage=new m(e),this.webhook=new b(e),this.sessionId=crypto.randomUUID(),this.addStyles(this.styles),this.render()}static get observedAttributes(){return["webhook-url","title","welcome-message","history-enabled","history-clear-button","position"]}render(){const e=this.createElement("div","chat-window"),t=this.createElement("div","header"),s=this.createElement("h2","",this.getAttribute("title")||"Chat with us"),i=this.createElement("div","header-actions");if(this.getAttribute("history-enabled")!=="false"&&this.getAttribute("history-clear-button")!=="false"){const d=this.createElement("button","","🗑️");d.title="Clear history",d.addEventListener("click",()=>this.clearHistory()),i.appendChild(d)}const l=this.createElement("button","","✕");l.addEventListener("click",()=>this.close()),i.appendChild(l),t.appendChild(s),t.appendChild(i);const c=this.createElement("div","messages");this.getAttribute("history-enabled")!=="false"&&this.storage.getMessages().forEach(E=>this.renderMessage(E,c));const g=this.createElement("div","input-area"),p=this.createElement("input");p.type="text",p.placeholder="Type your message...";const f=this.createElement("button","","Send"),y=()=>{const d=p.value.trim();d&&(this.sendMessage(d),p.value="")};f.addEventListener("click",y),p.addEventListener("keypress",d=>{d.key==="Enter"&&!d.shiftKey&&(d.preventDefault(),y())}),g.appendChild(p),g.appendChild(f),e.appendChild(t),e.appendChild(c),e.appendChild(g),this.shadow.innerHTML="",this.shadow.appendChild(e);const x=this.getAttribute("welcome-message");x&&!this.hasShownWelcomeMessage&&this.isOpen&&(this.addSystemMessage(x),this.hasShownWelcomeMessage=!0)}async sendMessage(e){const t=crypto.randomUUID(),s=new Date().toISOString(),i={id:t,text:e,sender:"user",timestamp:s,status:"sending"};this.storage.addMessage(i),this.renderMessage(i);try{const l=await this.webhook.sendMessage({message:e,timestamp:s,sessionId:this.sessionId,context:{url:window.location.href},history:this.storage.getMessages().slice(-10)});i.status="sent",this.storage.updateMessage(t,{status:"sent"}),this.updateMessageStatus(t,"sent");const c={id:crypto.randomUUID(),text:l.response,sender:"backend",timestamp:new Date().toISOString()};this.storage.addMessage(c),this.renderMessage(c)}catch(l){l instanceof Error&&l.message==="Request cancelled"?(i.status="cancelled",this.storage.updateMessage(t,{status:"cancelled"}),this.updateMessageStatus(t,"cancelled")):(i.status="error",this.storage.updateMessage(t,{status:"error"}),this.updateMessageStatus(t,"error"),this.addSystemMessage("Failed to send message. Please try again."))}}renderMessage(e,t){const s=t||this.shadow.querySelector(".messages");if(!s)return;const i=this.createElement("div",`message ${e.sender}`);if(i.textContent=e.text,i.dataset.messageId=e.id,e.sender==="user"&&e.status){const l=this.createElement("div","message-status");if(l.textContent=e.status,e.status==="sending"){const c=this.createElement("button","cancel-button","Cancel");c.addEventListener("click",()=>{this.webhook.cancelRequest()}),l.appendChild(c)}i.appendChild(l)}s.appendChild(i),s.scrollTop=s.scrollHeight}updateMessageStatus(e,t){const s=this.shadow.querySelector(`[data-message-id="${e}"]`);if(s){const i=s.querySelector(".message-status");i&&(i.textContent=t)}}clearHistory(){if(confirm("Are you sure you want to clear the chat history?")){this.storage.clearHistory();const e=this.shadow.querySelector(".messages");e&&(e.innerHTML=""),this.hasShownWelcomeMessage=!1}}addSystemMessage(e){const t={id:crypto.randomUUID(),text:e,sender:"system",timestamp:new Date().toISOString()};this.getAttribute("history-enabled")!=="false"&&this.storage.addMessage(t),this.renderMessage(t)}close(){this.isOpen=!1,this.updateVisibility(),this.dispatchEvent(new CustomEvent("close"))}setOpen(e){if(this.isOpen=e,this.updateVisibility(),e&&!this.hasShownWelcomeMessage){const t=this.getAttribute("welcome-message");t&&(this.addSystemMessage(t),this.hasShownWelcomeMessage=!0)}}updateVisibility(){const e=this.shadow.querySelector(".chat-window");e&&(this.isOpen?e.classList.add("open"):e.classList.remove("open"))}attributeChangedCallback(e,t,s){if(t!==s){if(e==="webhook-url"){const i=s||"";this.storage=new m(i),this.webhook=new b(i)}this.render()}}}customElements.define("chat-window",C);class S extends a{constructor(){super();n(this,"styles",`
    :host {
      position: fixed;
      z-index: 9999;
      bottom: 20px;
      right: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    :host([position="bottom-left"]) {
      right: auto;
      left: 20px;
    }

    .chat-widget-container {
      --theme-color: ${this.getAttribute("theme-color")||"#1E40AF"};
    }
  `);n(this,"window",null);this.addStyles(this.styles),this.render()}static get observedAttributes(){return["webhook-url","theme-color","position","title","welcome-message","history-enabled","history-clear-button"]}render(){this.shadow.innerHTML="";const e=this.createElement("div","chat-widget-container"),t=this.getConfig(),s=document.createElement("chat-window");s.setAttribute("webhook-url",t.webhookUrl),s.setAttribute("theme-color",t.themeColor),s.setAttribute("title",t.title),s.setAttribute("welcome-message",t.welcomeMessage),s.setAttribute("history-enabled",String(t.historyEnabled)),s.setAttribute("history-clear-button",String(t.historyClearButton)),s.setAttribute("position",t.position),this.window=s;const i=document.createElement("chat-launcher");i.setAttribute("theme-color",t.themeColor),i.addEventListener("toggleChat",l=>{const{isOpen:c}=l.detail;this.handleToggleChat(c)}),e.appendChild(s),e.appendChild(i),this.shadow.appendChild(e)}handleToggleChat(e){this.window&&this.window.setOpen(e)}getConfig(){return{webhookUrl:this.getAttribute("webhook-url")||"",themeColor:this.getAttribute("theme-color")||"#1E40AF",position:this.getAttribute("position")||"bottom-right",title:this.getAttribute("title")||"Chat with us",welcomeMessage:this.getAttribute("welcome-message")||"",historyEnabled:this.getAttribute("history-enabled")!=="false",historyClearButton:this.getAttribute("history-clear-button")!=="false"}}attributeChangedCallback(e,t,s){t!==s&&(e==="theme-color"&&this.addStyles(`
          :host {
            position: fixed;
            z-index: 9999;
            bottom: 20px;
            right: 20px;
            font-family: system-ui, -apple-system, sans-serif;
          }

          :host([position="bottom-left"]) {
            right: auto;
            left: 20px;
          }

          .chat-widget-container {
            --theme-color: ${s||"#1E40AF"};
          }
        `),this.render())}}customElements.define("chat-widget",S);function w(r){var e,t;const o=document.createElement("chat-widget");return o.setAttribute("webhook-url",r.webhookUrl),r.themeColor&&o.setAttribute("theme-color",r.themeColor),r.position&&o.setAttribute("position",r.position),r.title&&o.setAttribute("title",r.title),r.welcomeMessage&&o.setAttribute("welcome-message",r.welcomeMessage),((e=r.history)==null?void 0:e.enabled)!==void 0&&o.setAttribute("history-enabled",String(r.history.enabled)),((t=r.history)==null?void 0:t.clearButton)!==void 0&&o.setAttribute("history-clear-button",String(r.history.clearButton)),document.body.appendChild(o),o}if(document.currentScript instanceof HTMLScriptElement){const r=document.currentScript;w({webhookUrl:r.dataset.webhookUrl||"",themeColor:r.dataset.themeColor,position:r.dataset.position,title:r.dataset.title,welcomeMessage:r.dataset.welcomeMessage,history:{enabled:r.dataset.historyEnabled!=="false",clearButton:r.dataset.historyClearButton!=="false"}})}h.initChatPopup=w,Object.defineProperty(h,Symbol.toStringTag,{value:"Module"})});