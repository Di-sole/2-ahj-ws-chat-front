import ChatWidget from './ChatWidget';

const widgetContainer = document.querySelector('.chat-widget-container');
const widget = new ChatWidget(widgetContainer, 'wss://ahj-wschat.herokuapp.com/');
widget.start();
