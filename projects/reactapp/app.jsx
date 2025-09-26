import React, { useState, useCallback, useEffect } from 'react';
import { 
  getFirestore, collection, onSnapshot, addDoc, deleteDoc, 
  query, serverTimestamp, doc
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';


const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const getNoteCollectionPath = (uid) => 
  `artifacts/${appId}/users/${uid}/notes`;

const App = () => {
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    const [notes, setNotes] = useState([]);
    const [newNoteText, setNewNoteText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);
            
            setDb(firestoreDb);

            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        if (initialAuthToken) {
                            const userCredential = await signInWithCustomToken(firebaseAuth, initialAuthToken);
                            setUserId(userCredential.user.uid);
                        } else {
                            const userCredential = await signInAnonymously(firebaseAuth);
                            setUserId(userCredential.user.uid);
                        }
                    } catch (error) {
                        console.error("Authentication error, signing in anonymously as fallback:", error);
                        if (!firebaseAuth.currentUser) {
                             const userCredential = await signInAnonymously(firebaseAuth);
                             setUserId(userCredential.user.uid);
                        }
                    }
                    setIsAuthReady(true);
                }
                setIsLoading(false);
            });
            
            return () => unsubscribe();

        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!db || !isAuthReady || !userId) return;

        const notesCollectionRef = collection(db, getNoteCollectionPath(userId));
        const q = query(notesCollectionRef); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            fetchedNotes.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

            setNotes(fetchedNotes);
        }, (error) => {
            console.error("Error fetching notes:", error);
        });

        return () => unsubscribe();
    }, [db, isAuthReady, userId]);

    const handleNoteChange = useCallback((event) => {
        setNewNoteText(event.target.value);
    }, []);

    const addNote = useCallback(async (event) => {
        event.preventDefault();
        if (newNoteText.trim() === '' || !db || !userId) return;

        try {
            const notesCollectionRef = collection(db, getNoteCollectionPath(userId));
            
            await addDoc(notesCollectionRef, {
                text: newNoteText.trim(),
                timestamp: serverTimestamp(),
            });
            setNewNoteText('');
        } catch (error) {
            console.error("Error adding note:", error);
        }
    }, [newNoteText, db, userId]);

    const deleteNote = useCallback(async (id) => {
        if (!db || !userId) return;
        
        try {
            const noteDocRef = doc(db, getNoteCollectionPath(userId), id);
            await deleteDoc(noteDocRef);
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    }, [db, userId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-indigo-600 font-semibold animate-pulse">
                    Connecting to the Cloud Database...
                </p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-8 font-sans">
            <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl p-6 sm:p-8 space-y-6">
                
                <header className="border-b pb-4 mb-4">
                    <h1 className="text-3xl font-extrabold text-indigo-600">
                        Real-Time Scratchpad
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Your private notes are instantly saved and retrieved from the database.
                    </p>
                    <p className="text-xs text-gray-400 mt-2 break-words p-1 bg-gray-50 rounded">
                        User ID: **{userId}**
                    </p>
                </header>

                <form onSubmit={addNote} className="space-y-4">
                    <textarea
                        value={newNoteText}
                        onChange={handleNoteChange}
                        placeholder="Type a new note here..."
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none text-base"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={newNoteText.trim() === ''}
                        className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-500 rounded-lg shadow-md hover:bg-indigo-600 disabled:bg-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-150 transform hover:scale-[1.005] active:scale-[0.99]"
                    >
                        Save Note
                    </button>
                </form>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h2 className="text-xl font-bold text-gray-700">My Notes ({notes.length})</h2>
                    {notes.length === 0 ? (
                        <p className="text-gray-500 italic p-4 border rounded-lg bg-gray-50">
                            You don't have any notes yet. Start typing one above!
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {notes.map((note) => (
                                <li 
                                    key={note.id} 
                                    className="flex justify-between items-start bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200"
                                >
                                    <div className="pr-4 flex-1">
                                        <p className="text-gray-800 whitespace-pre-wrap break-words">
                                            {note.text}
                                        </p>
                                        <small className="text-gray-400 block mt-1">
                                            {note.timestamp ? new Date(note.timestamp.seconds * 1000).toLocaleString() : 'Saving...'}
                                        </small>
                                    </div>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="flex-shrink-0 ml-4 p-2 text-sm text-red-500 hover:text-white bg-white hover:bg-red-500 border border-red-500 rounded-full transition duration-150"
                                        aria-label="Delete note"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
