import ChatWidget from './ChatWidget';

const widgetContainer = document.querySelector('.chat-widget-container');
const widget = new ChatWidget(widgetContainer, 'ws://localhost:7070');
widget.start();
