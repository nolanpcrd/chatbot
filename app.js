import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';

// Remplacez ces valeurs par la configuration de votre projet Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDf4WPo6xV9ML3y_XoQc_j6REAvhCExKHM",
    authDomain: "messagerie-1be0d.firebaseapp.com",
    projectId: "messagerie-1be0d",
    storageBucket: "messagerie-1be0d.appspot.com",
    messagingSenderId: "970569765584",
    appId: "1:970569765584:web:a8908082215d2b73fec4d5"
};

// Initialisez Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Obtenez la référence de la base de données en temps réel
const database = getFirestore(firebaseApp);

const chatBox = document.getElementById('chat-box');

// Écoutez les changements de la base de données
const messagesCollection = collection(database, 'messages');
const query1 = query(messagesCollection, orderBy('timestamp', 'asc')); // Tri des messages par horodatage
const unsubscribe = onSnapshot(query1, (snapshot) => {
    // Nettoyez la boîte de chat avant d'ajouter de nouveaux messages
    chatBox.innerHTML = '';

    snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
            const message = change.doc.data();
            appendMessage(message);
        }
    });
});

export function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value;

    if (messageText.trim() !== '') {
        addDoc(messagesCollection, {
            text: messageText,
            timestamp: serverTimestamp()
        });

        messageInput.value = '';
    }
}

// Fonction pour ajouter un message à la boîte de chat
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = `${message.text}`;
    chatBox.appendChild(messageElement);

    // Faites défiler vers le bas pour voir le dernier message
    chatBox.scrollTop = chatBox.scrollHeight;
}
