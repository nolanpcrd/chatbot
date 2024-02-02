import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';

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

let unsubscribe; // Déclarer la variable unsubscribe en dehors de la fonction
const messagesCollection = collection(database, 'messages'); // Déclarer messagesCollection en dehors de la fonction

// Écoutez les changements de la base de données
// Déclarer un tableau en dehors de la fonction pour stocker les messages
const messagesArray = [];

// Fonction pour ajouter un message à la boîte de chat
export function listenToMessages() {
    const query1 = query(messagesCollection);

    // Désabonnez-vous des abonnements précédents
    if (unsubscribe) {
        unsubscribe();
    }

    // Abonnez-vous aux nouveaux changements
    unsubscribe = onSnapshot(query1, (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                text: data.text,
                timestamp: data.timestamp.toMillis(), // Convertir le timestamp Firestore en millisecondes
            };
        });

        appendMessages(messages);
    });
}

// Fonction pour ajouter des messages à la boîte de chat
function appendMessages(messages) {
    // Ajouter les messages au tableau des messages
    messagesArray.push(...messages);

    // Trier les messages par timestamp
    messagesArray.sort((a, b) => a.timestamp - b.timestamp);

    // Créer un tableau pour stocker les éléments triés
    const sortedElements = [];

    // Ajouter les messages triés au tableau
    messagesArray.forEach((message) => {
        const messageElement = document.createElement('div');
        messageElement.innerText = `${message.text}`;
        messageElement.setAttribute('data-timestamp', message.timestamp);
        sortedElements.push(messageElement);
    });

    // Vider complètement la boîte de chat
    chatBox.innerHTML = '';

    // Ajouter tous les éléments triés à la boîte de chat
    sortedElements.forEach((element) => {
        chatBox.appendChild(element);
    });

    // Faites défiler vers le bas pour voir le dernier message
    chatBox.scrollTop = chatBox.scrollHeight;
}


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
