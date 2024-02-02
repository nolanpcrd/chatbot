import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, getDocs, limit } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';
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
function appendMessage(message) {
    // Ajouter le message au tableau des messages
    messagesArray.push({
        text: message.text,
        timestamp: message.timestamp,
    });

    // Trier les messages en plaçant ceux avec un timestamp nul à la fin
    messagesArray.sort((a, b) => {
        if (a.timestamp === null && b.timestamp !== null) {
            return 1;
        } else if (a.timestamp !== null && b.timestamp === null) {
            return -1;
        } else {
            return a.timestamp - b.timestamp;
        }
    });

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

// Écoutez les changements de la base de données
export function listenToMessages() {
    const query1 = query(messagesCollection);

    // Désabonnez-vous des abonnements précédents
    if (unsubscribe) {
        unsubscribe();
    }

    // Abonnez-vous aux nouveaux changements
    unsubscribe = onSnapshot(query1, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const message = { id: change.doc.id, ...change.doc.data() };
                appendMessage(message);
            }
        });
    });
}

export async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value;

    if (messageText.trim() !== '') {
        // Récupérer le timestamp du dernier message
        const lastMessageQuery = query(messagesCollection, orderBy('timestamp', 'desc'), limit(1));
        const lastMessageSnapshot = await getDocs(lastMessageQuery);

        let lastTimestamp = 0;

        if (!lastMessageSnapshot.empty) {
            const lastMessageData = lastMessageSnapshot.docs[0].data();
            lastTimestamp = lastMessageData.timestamp.toMillis();
        }

        // Ajouter le nouveau message avec un timestamp supérieur
        await addDoc(messagesCollection, {
            text: messageText,
            timestamp: serverTimestamp(),
        });

        // Actualiser la page (ou vous pouvez mettre en œuvre une logique pour actualiser uniquement la boîte de chat)
        location.reload();
    }
}
