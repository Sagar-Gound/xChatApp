// Firebase Realtime Database helper with local sync fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

let db = null;
let fbRef = null;
let fbPush = null;
let fbSet = null;
let fbOnValue = null;
let fbServerTimestamp = null;

// Initialize Firebase if configured
const initFirebase = async () => {
  if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
    try {
      let sdk = window.FirebaseSDK;
      if (!sdk) {
        const appMod = await import(
          /* @vite-ignore */ "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js"
        );
        const dbMod = await import(
          /* @vite-ignore */ "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js"
        );
        sdk = { ...appMod, ...dbMod };
      }
      if (sdk?.initializeApp && sdk?.getDatabase) {
        const app = sdk.initializeApp(firebaseConfig);
        db = sdk.getDatabase(app);
        fbRef = sdk.ref;
        fbPush = sdk.push;
        fbSet = sdk.set;
        fbOnValue = sdk.onValue;
        fbServerTimestamp = sdk.serverTimestamp;
      }
    } catch {
      // Fallback to local storage sync if Firebase module is unavailable
    }
  }
};

initFirebase();

// Send message to Firebase RTDB with local fallback
export const sendMessage = async (roomId, messageData) => {
  const timestamp = Date.now();
  const fullMessage = {
    content: messageData.content,
    senderId: messageData.senderId,
    timestamp,
  };

  // Local storage sync
  try {
    const key = `xchat_messages_${roomId}`;
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    stored.push(fullMessage);
    localStorage.setItem(key, JSON.stringify(stored));
    window.dispatchEvent(
      new CustomEvent("xchat_message_received", {
        detail: { roomId, message: fullMessage },
      })
    );
  } catch {
    // Ignore storage errors
  }

  // Push to Firebase Realtime Database if available
  if (db && fbPush && fbRef) {
    try {
      const messagesRef = fbRef(db, `messages/${roomId}`);
      await fbPush(messagesRef, {
        content: messageData.content,
        senderId: messageData.senderId,
        timestamp: fbServerTimestamp ? fbServerTimestamp() : timestamp,
      });
    } catch {
      // Continue with local sync
    }
  }

  return fullMessage;
};

// Subscribe to messages for a room
export const subscribeToMessages = (roomId, callback) => {
  const getLocalMessages = () => {
    try {
      const key = `xchat_messages_${roomId}`;
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };

  // Deliver current local messages
  callback(getLocalMessages());

  // Listen for local changes
  const handleLocalEvent = (e) => {
    if (e.detail?.roomId === roomId) {
      callback(getLocalMessages());
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === `xchat_messages_${roomId}`) {
      callback(getLocalMessages());
    }
  };

  window.addEventListener("xchat_message_received", handleLocalEvent);
  window.addEventListener("storage", handleStorageEvent);

  let unsubscribeFirebase = null;
  if (db && fbOnValue && fbRef) {
    try {
      const messagesRef = fbRef(db, `messages/${roomId}`);
      unsubscribeFirebase = fbOnValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data);
          callback(list);
        }
      });
    } catch {
      // Ignore Firebase subscription errors
    }
  }

  return () => {
    window.removeEventListener("xchat_message_received", handleLocalEvent);
    window.removeEventListener("storage", handleStorageEvent);
    if (typeof unsubscribeFirebase === "function") {
      unsubscribeFirebase();
    }
  };
};

// Update typing indicator
export const setTypingStatus = async (roomId, userId, isTyping) => {
  const status = { isTyping, timestamp: Date.now() };
  try {
    sessionStorage.setItem(`xchat_typing_${roomId}_${userId}`, JSON.stringify(status));
    window.dispatchEvent(
      new CustomEvent("xchat_typing_update", {
        detail: { roomId, userId, isTyping },
      })
    );
  } catch {
    // Ignore storage errors
  }

  if (db && fbSet && fbRef) {
    try {
      const typingRef = fbRef(db, `typing/${roomId}/${userId}`);
      await fbSet(typingRef, status);
    } catch {
      // Ignore
    }
  }
};

// Subscribe to typing indicator
export const subscribeToTyping = (roomId, otherUserId, callback) => {
  const handleEvent = (e) => {
    if (e.detail?.roomId === roomId && e.detail?.userId === otherUserId) {
      callback(e.detail.isTyping);
    }
  };

  window.addEventListener("xchat_typing_update", handleEvent);

  let unsubscribeFirebase = null;
  if (db && fbOnValue && fbRef) {
    try {
      const typingRef = fbRef(db, `typing/${roomId}/${otherUserId}`);
      unsubscribeFirebase = fbOnValue(typingRef, (snapshot) => {
        const data = snapshot.val();
        callback(Boolean(data?.isTyping));
      });
    } catch {
      // Ignore
    }
  }

  return () => {
    window.removeEventListener("xchat_typing_update", handleEvent);
    if (typeof unsubscribeFirebase === "function") {
      unsubscribeFirebase();
    }
  };
};

// Update user presence status
export const setUserStatus = async (userId, online) => {
  const status = { online, lastSeen: Date.now() };
  if (db && fbSet && fbRef) {
    try {
      const statusRef = fbRef(db, `status/${userId}`);
      await fbSet(statusRef, status);
    } catch {
      // Ignore
    }
  }
};

export default {
  sendMessage,
  subscribeToMessages,
  setTypingStatus,
  subscribeToTyping,
  setUserStatus,
};
