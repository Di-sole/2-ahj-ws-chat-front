export default class ChatWidget {
  constructor(container, url) {
    this.container = container;
    this.url = url;
    this.user = null;
    this.form = container.querySelector('.register-form');

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChatSubmit = this.onChatSubmit.bind(this);
    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.onChatClose = this.onChatClose.bind(this);
  }

  start() {
    this.form.addEventListener('submit', this.onFormSubmit);
    window.addEventListener('beforeunload', this.onChatClose);

    const ws = new WebSocket(this.url);

    ws.addEventListener('message', this.onMessageReceived);

    ws.addEventListener('open', () => {
      console.log('connection open');
    });

    ws.addEventListener('close', (event) => {
      console.log('connection close', event);
    });

    ws.addEventListener('error', (event) => {
      console.log('error', event);
    });

    this.ws = ws;
  }

  onMessageReceived(e) {
    const message = JSON.parse(e.data);

    switch (message.type) {
      case 'logIn':
        if (message.data === 'fail') {
          this.showError('Имя пользователя уже занято, выберите другой псевдоним');
        } else if (message.data === 'success') {
          this.removeForm();
          this.openChat();
        }
        break;
      case 'contacts':
        this.showContacts(message.data);
        break;
      case 'newMessage':
        this.addMessage(message.data);
        break;
      default:
        console.log('я тебя не понял');
    }
  }

  // регистрация

  onFormSubmit(e) {
    e.preventDefault();

    this.user = this.form.name.value;
    this.form.name.value = '';

    const message = {
      type: 'addContact',
      name: this.user,
    };

    this.ws.send(JSON.stringify(message));
  }

  showError(text) {
    const errorText = this.container.querySelector('.error-text');

    if (errorText) {
      return;
    }

    const errorEl = document.createElement('p');
    errorEl.classList.add('error-text');
    errorEl.textContent = text;
    this.form.insertAdjacentElement('beforeend', errorEl);
  }

  removeForm() {
    this.form.remove();
  }

  // чат

  openChat() {
    const chatEl = document.createElement('div');
    chatEl.classList.add('chat-widget');
    chatEl.innerHTML = `
      <section class="chat-users">
        <ul class="chat-user-list"></ul>
      </section>
      <section class="chat-content">
        <div class="messages"></div>
        <form class="chat-form">
          <input class="chat-input" name="message" placeholder="Type your message here" required>
        </form>
      </section>
    `;

    this.container.appendChild(chatEl);

    const chatForm = this.container.querySelector('.chat-form');
    chatForm.addEventListener('submit', this.onChatSubmit);
  }

  onChatSubmit(e) {
    e.preventDefault();

    const messageText = this.container.querySelector('.chat-input').value;
    const messageDate = `${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`;
    const message = {
      type: 'addMessage',
      name: this.user,
      date: messageDate,
      text: messageText,
    };

    this.ws.send(JSON.stringify(message));
    this.container.querySelector('.chat-input').value = '';
  }

  onChatClose() {
    this.ws.send(JSON.stringify({ type: 'deleteContact', name: this.user }));
    this.user = null;
  }

  showContacts(data) {
    const userList = this.container.querySelector('.chat-user-list');

    if (!userList) {
      return;
    }

    userList.innerHTML = '';
    data.forEach((user) => {
      const userEl = document.createElement('li');
      userEl.classList.add('user');

      if (user.name === this.user) {
        userEl.classList.add('own');
        userEl.textContent = 'You';
      } else {
        userEl.textContent = user.name;
      }

      userList.appendChild(userEl);
    });
  }

  addMessage(data) {
    let messageInfo;

    const messagesContainer = this.container.querySelector('.messages');
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');

    if (data.name === this.user) {
      messageEl.classList.add('own-mes');
      messageInfo = `<span class="message-info own">You, ${data.date}</span>`;
    } else {
      messageInfo = `<span class="message-info">${data.name}, ${data.date}</span>`;
    }

    messageEl.innerHTML = `
      <div class="message-header">
        ${messageInfo}
      </div>
      <div class="message-body">
        <p class="message-text">${data.text}</p>
      </div>
    `;

    messagesContainer.appendChild(messageEl);
  }
}
