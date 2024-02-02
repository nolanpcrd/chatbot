import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, getDocs, limit } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDf4WPo6xV9ML3y_XoQc_j6REAvhCExKHM",
    authDomain: "messagerie-1be0d.firebaseapp.com",
    projectId: "messagerie-1be0d",
    storageBucket: "messagerie-1be0d.appspot.com",
    messagingSenderId: "970569765584",
    appId: "1:970569765584:web:a8908082215d2b73fec4d5"
};

const firebaseApp = initializeApp(firebaseConfig);

const database = getFirestore(firebaseApp);

const chatBox = document.getElementById('chat-box');

let unsubscribe;
const messagesCollection = collection(database, 'messages');

const messagesArray = [];

function appendMessage(message) {
    messagesArray.push({
        text: message.text,
        timestamp: message.timestamp,
    });

    messagesArray.sort((a, b) => {
        if (a.timestamp === null && b.timestamp !== null) {
            return 1;
        } else if (a.timestamp !== null && b.timestamp === null) {
            return -1;
        } else {
            return a.timestamp - b.timestamp;
        }
    });

    const sortedElements = [];

    messagesArray.forEach((message) => {
        const messageElement = document.createElement('div');
        messageElement.innerText = `${message.text}`;
        messageElement.setAttribute('data-timestamp', message.timestamp);
        sortedElements.push(messageElement);
    });

    chatBox.innerHTML = '';

    sortedElements.forEach((element) => {
        chatBox.appendChild(element);
        chatBox.appendChild(document.createElement('br'));
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

export function listenToMessages() {
    const query1 = query(messagesCollection);

    if (unsubscribe) {
        unsubscribe();
    }

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
    const username = localStorage.getItem('username') + ': ';
    const messageText = username + messageInput.value;

    const options = {
        method: 'POST',
        url: 'https://gpts4u.p.rapidapi.com/llama2',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': 'db52709e4cmshe72b2005455edb3p1351edjsnb1ad6dbffdac',
            'X-RapidAPI-Host': 'gpts4u.p.rapidapi.com'
        },
        data: [
            {
                role: 'user',
                content: messageInput.value
            }
        ]
    };

    if (messageText.trim() !== '') {
        // Récupérer le timestamp du dernier message
        const lastMessageQuery = query(messagesCollection, orderBy('timestamp', 'desc'), limit(1));
        const lastMessageSnapshot = await getDocs(lastMessageQuery);

        let lastTimestamp = 0;

        if (!lastMessageSnapshot.empty) {
            const lastMessageData = lastMessageSnapshot.docs[0].data();
            lastTimestamp = lastMessageData.timestamp.toMillis();
        }

        await addDoc(messagesCollection, {
            text: messageText,
            timestamp: serverTimestamp(),
        });

        await axios.request(options)
            .then(function (response) {
                addDoc(messagesCollection, {
                    text: 'IA: ' + response.data,
                    timestamp: serverTimestamp(),
                });
            })
            .catch(function (error) {
                console.error(error);
            });

        location.reload();
    }
}
