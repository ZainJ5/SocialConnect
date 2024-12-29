import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

const AIChatbot = ({ darkMode, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm an AI assistant. How can I help you today?", isBot: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Validate API key prop
  useEffect(() => {
    if (!apiKey) {
      console.error('API key is required for the chatbot to function');
    }
  }, [apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateGeminiResponse = async (userMessage) => {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: userMessage
            }]
          }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
        throw new Error('No valid response from Gemini API');
      }

      if (data.promptFeedback?.blockReason) {
        return `I apologize, but I cannot provide a response due to content safety restrictions. (Reason: ${data.promptFeedback.blockReason})`;
      }

      const text = data.candidates[0].content.parts[0].text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      return text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (error.message.includes('HTTP error! status: 429')) {
        return "I apologize, but the API rate limit has been reached. Please try again in a moment.";
      }
      return "I apologize, but I encountered an error processing your request. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = { id: messages.length + 1, text: message, isBot: false };
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      setIsLoading(true);

      try {
        const response = await generateGeminiResponse(message);
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: response,
          isBot: true
        }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: "I apologize, but I encountered an error. Please try again.",
          isBot: true
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-96 mb-4`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.isBot
                      ? darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? 'bg-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default AIChatbot;