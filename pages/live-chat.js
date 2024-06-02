import { useState, useEffect } from 'react'
import { getFirestore, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../constants/firebaseConfig'
import { useMoralis } from 'react-moralis'

export default function LiveChat() {
  const { account } = useMoralis();
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"))
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })))
    })
    return unsubscribe
  }, [])

  const sendMessage = async () => {
    await addDoc(collection(db, "messages"), {
      uid: account,
      text: newMessage,
      timestamp: serverTimestamp()
    })

    setNewMessage("")
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to Date object
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} at ${day}/${month}/${year}`;
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 text-white'>
      {account ? (
        <div className=' mt-5 w-full max-w-4xl pb-16'> {/* Added padding bottom to create space */}
          <div className='text-center mb-6  text-gray-400 font-bold text-3xl'>Welcome {account}!</div>
          <div className='flex flex-col gap-4'>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.data.uid === account ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-6 rounded-xl ${msg.data.uid === account ? 'bg-pink-700' : 'bg-gray-700'}`}>
                  <p className='text-xl'>{msg.data.text}</p>
                  <p className='text-sm text-gray-400 mt-2'>By {msg.data.uid} - {msg.data.timestamp ? formatTimestamp(msg.data.timestamp) : 'Timestamp unavailable'}</p>
                </div>
              </div>
            ))}
          </div>
          <div className='w-full mt-6 flex items-center justify-center'>
            <input
              className='w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none border-2 border-gray-600 text-lg'
              placeholder='Type your message...'
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button
              className='ml-4 px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 focus:outline-none text-lg'
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
