const ShareDB = require('sharedb');
const WebSocket = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const richText = require('rich-text');

const backend = new ShareDB();
backend.use('type', richText.type);

function generateRandomId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

const docId = '4fG7jK8pL0Q1zRsT'; // Generate a random document ID
const doc = backend.createDocument('documents', docId, { content: '' });

// Save the document
doc.submitOp([{ p: ['content'], oi: 'Initial content' }]);
