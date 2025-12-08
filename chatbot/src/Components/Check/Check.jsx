
import React, { useState ,useEffect} from 'react';
import { Link } from 'react-router-dom';
import './Check.css';
// import video from './new.mp4';
// import newvideo from './newvid.mp4';
import list from './micro.png'
import stop from './stop.png'
import book from './book.jpg'
import cross from './cross_btn.svg'


import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function Check() {
  const [userInput, setUserInput] = useState('');
  const [showReset, setShowReset] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition, isListening } = useSpeechRecognition();

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    const chatContainer = document.querySelector('.chat-history');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  
  const handleChange = (event) => {
    setUserInput(event.target.value);
  };

  const startListening = () => {
    
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
      setShowReset(true);
  };

  const stopListening = () => {
      SpeechRecognition.stopListening();
  };


  const handleResetClick = () => {
    resetTranscript();
    setShowReset(false);

  };

 

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (userInput.trim() !== '') {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const response = await fetch(`${baseUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput }),
        });
        chatHistory.scrollTop = chatHistory.scrollHeight;

        if (!response.ok) {
            console.error("Chat response not OK:", response.status, response.statusText);
            throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        const botMessage = data.response;

        setChatHistory([
          ...chatHistory,
          { role: 'user', message: userInput },
          { role: 'bot', message: botMessage },

        ]);

        

        setUserInput('');
      } catch (error) {
        console.error('Error:', error);
        setChatHistory([
            ...chatHistory,
            { role: 'user', message: userInput },
            { role: 'bot', message: "Sorry, I couldn't reach the server." },
        ]);
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    }
        //  chatHistory.scrollTop = chatHistory.scrollHeight,

  };

  const handleVoiceSubmit = () => {
    if (transcript.trim() !== '') {
      setUserInput(transcript);
      resetTranscript(); 
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (isListening) {
      stopListening();
    }
    if (transcript.trim() !== '') {
      handleVoiceSubmit();
    } else {
      handleSubmit(event);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Voice recognition not supported</div>;
  }

  return (
    <div className="App">

      <div className="chat-container">
        <h1>WellBot</h1>
        <div className="chat-history">
          {chatHistory.map((item, index) => (
            <div key={index} className={`message ${item.role}`}>
              {item.message}
            </div>
          ))}
        </div>
        <form onSubmit={handleFormSubmit} className="chat-form">
          <input
            type="text"
            value={userInput}
            onChange={handleChange}
            placeholder="Enter your message"
          />
          <img src={list} className='microphone-btn' alt="" onClick={startListening} />
         
          <img src={stop} className='stop-btn' alt="" onClick={stopListening} />
          <button className='submit-btn' type="submit">Send</button>
        </form>
        <div className="transcript">{transcript}
        </div>
        <div className='cross-btn'>{transcript!==""?<img  src={cross} onClick={handleResetClick} alt="" />:<></>}
</div>
      </div>
      <div className="booking">
      <Link to='/booking'><img src={book} alt="" /></Link>
      </div>
    </div>
  );
}

export default Check;


