import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Baby, Book, Apple, Settings, AlertCircle, Bell, Moon, Volume2, Info, ChevronRight } from 'lucide-react';
import { DEEPSEEK_API_KEY, DEEPSEEK_API_URL, API_TIMEOUT } from '../lib/config';

interface Message {
  text: string;
  isUser: boolean;
  timestamp?: string;
}

interface ChatbotProps {
  onCreatePlan: () => void;
}

export function Chatbot({ onCreatePlan }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hi!\nWelcome to Baby Nutrition Assistant.\n\nHow can I help you plan your baby's food today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOpenGuides = () => {
      setIsOpen(true);
      setActiveTab('guide');
    };

    document.addEventListener('openChatbotGuides', handleOpenGuides);
    return () => {
      document.removeEventListener('openChatbotGuides', handleOpenGuides);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp }]);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const recentMessages = messages.slice(-6).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Accept': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a knowledgeable baby nutrition assistant. Provide concise, practical advice about baby food and nutrition. Focus on safe, age-appropriate recommendations.'
            },
            ...recentMessages,
            {
              role: 'user',
              content: userMessage
            }
          ],
          model: 'deepseek-chat',
          temperature: 0.7,
          max_tokens: 500,
          stream: false,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to get response from DeepSeek API');
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;

      setMessages(prev => [...prev, { 
        text: botResponse, 
        isUser: false, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, { 
          text: "I apologize, but it's taking longer than expected to process your request. Please try asking a shorter or simpler question.", 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        console.error('Error calling DeepSeek API:', error);
        setMessages(prev => [...prev, { 
          text: "I apologize, but I'm having trouble connecting to the service right now. Please try again in a moment.", 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderGuideContent = () => (
    <div className="space-y-8 p-8">
      {/* Introduction Section */}
      <div className="bg-yellow-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-yellow-100">
        <h3 className="text-xl font-semibold text-yellow-900 mb-4 flex items-center gap-2">
          <Baby size={24} className="text-yellow-600" />
          Getting Started with Baby Food
        </h3>
        <p className="text-yellow-900 mb-4 leading-relaxed">
          Starting your baby on solid foods is an exciting milestone. This guide will help you navigate through the journey of introducing solid foods to your baby.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
            <h4 className="font-medium text-yellow-800 mb-2">When to Start</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-900 text-sm">
              <li>Around 6 months of age</li>
              <li>Can hold head up steadily</li>
              <li>Shows interest in food</li>
              <li>Can sit with support</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
            <h4 className="font-medium text-yellow-800 mb-2">Signs of Readiness</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-900 text-sm">
              <li>Opens mouth for spoon</li>
              <li>Moves food to back of mouth</li>
              <li>Shows interest in others eating</li>
              <li>Doubled birth weight</li>
            </ul>
          </div>
        </div>
      </div>

      {/* First Foods Section */}
      <div className="bg-yellow-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-yellow-100">
        <h3 className="text-xl font-semibold text-yellow-900 mb-4 flex items-center gap-2">
          <Apple size={24} className="text-yellow-600" />
          First Foods Guide
        </h3>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
          <h4 className="font-medium text-yellow-800 mb-3">Recommended First Foods</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-yellow-800 mb-2">Fruits</h5>
              <ul className="list-disc list-inside space-y-1 text-yellow-900 text-sm">
                <li>Mashed banana</li>
                <li>Pureed apple</li>
                <li>Pureed pear</li>
                <li>Mashed avocado</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-yellow-800 mb-2">Vegetables</h5>
              <ul className="list-disc list-inside space-y-1 text-yellow-900 text-sm">
                <li>Sweet potato</li>
                <li>Butternut squash</li>
                <li>Green beans</li>
                <li>Carrots</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Section */}
      <div className="bg-yellow-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-yellow-100">
        <h3 className="text-xl font-semibold text-yellow-900 mb-4 flex items-center gap-2">
          <AlertCircle size={24} className="text-yellow-600" />
          Food Safety Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
            <h4 className="font-medium text-yellow-800 mb-2">Preparation Safety</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-900 text-sm">
              <li>Wash hands thoroughly</li>
              <li>Clean all utensils</li>
              <li>Use fresh ingredients</li>
              <li>Store properly</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
            <h4 className="font-medium text-yellow-800 mb-2">Feeding Safety</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-900 text-sm">
              <li>Always supervise feeding</li>
              <li>Check food temperature</li>
              <li>Start with small portions</li>
              <li>Watch for allergic reactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlansContent = () => (
    <div className="space-y-6 p-8">
      <div className="bg-yellow-50 rounded-xl p-6 hover:shadow-md transition-shadow border border-yellow-100">
        <h4 className="font-medium text-lg mb-3 flex items-center text-yellow-900">
          <Apple size={20} className="mr-2 text-yellow-600" />
          Sample Food Plans
        </h4>
        <div className="space-y-4">
          {[
            { age: '6-8 months', foods: ['Iron-fortified cereal', 'Pureed fruits', 'Pureed vegetables'] },
            { age: '8-10 months', foods: ['Mashed fruits', 'Soft cooked vegetables', 'Soft proteins'] },
            { age: '10-12 months', foods: ['Finger foods', 'Soft table foods', 'Family foods (modified)'] }
          ].map((plan, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-yellow-100">
              <h5 className="font-medium text-sm mb-2 text-yellow-800">{plan.age}</h5>
              <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
                {plan.foods.map((food, i) => (
                  <li key={i}>{food}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onCreatePlan}
        className="w-full bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <MessageCircle size={18} />
        Get Personalized Food Plan
      </button>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6 p-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:shadow-md transition-shadow border border-yellow-100">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-yellow-600" />
            <div>
              <h4 className="font-medium text-sm text-yellow-900">Notifications</h4>
              <p className="text-xs text-yellow-700">Get alerts for new messages</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications ? 'bg-yellow-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:shadow-md transition-shadow border border-yellow-100">
          <div className="flex items-center gap-3">
            <Volume2 size={20} className="text-yellow-600" />
            <div>
              <h4 className="font-medium text-sm text-yellow-900">Sound</h4>
              <p className="text-xs text-yellow-700">Play sound on new messages</p>
            </div>
          </div>
          <button
            onClick={() => setSound(!sound)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sound ? 'bg-yellow-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sound ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:shadow-md transition-shadow border border-yellow-100">
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-yellow-600" />
            <div>
              <h4 className="font-medium text-sm text-yellow-900">Dark Mode</h4>
              <p className="text-xs text-yellow-700">Toggle dark theme</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-yellow-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-yellow-100 pt-4">
        <button className="w-full text-left text-sm text-yellow-900 hover:text-yellow-700 transition-colors flex items-center justify-between p-2">
          <span>Privacy Policy</span>
          <ChevronRight size={16} />
        </button>
        <button className="w-full text-left text-sm text-yellow-900 hover:text-yellow-700 transition-colors flex items-center justify-between p-2">
          <span>Terms of Service</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto messages-container">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}
        >
          <div className="flex items-end gap-2">
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-sm">
                <Baby size={20} className="text-black" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                message.isUser
                  ? 'bg-yellow-500 text-black'
                  : 'bg-yellow-50 text-yellow-900 border border-yellow-100'
              }`}
            >
              <div className={`text-[14px] leading-relaxed ${message.isUser ? 'font-medium' : ''}`}>
                {formatMessage(message.text)}
              </div>
            </div>
          </div>
          <span className="text-xs text-yellow-600 mt-1 px-2">
            {message.timestamp}
          </span>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-sm">
            <Baby size={20} className="text-black" />
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg shadow-sm border border-yellow-100">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderChatContent = () => (
    <div className="flex-1 flex flex-col bg-white">
      {renderMessages()}
      <div className="border-t border-yellow-100 p-4 bg-yellow-50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message here..."
            className="flex-1 border border-yellow-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-[14px] bg-white shadow-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`bg-yellow-500 text-black p-3 rounded-lg shadow-sm ${
              isLoading || !input.trim() 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-yellow-400 hover:shadow-md'
            } transition-all duration-200`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div 
          className="bg-white rounded-xl shadow-xl flex flex-col border border-yellow-100" 
          style={{ 
            height: '70vh',
            width: '550px',
            maxHeight: 'calc(100vh - 80px)',
            maxWidth: 'calc(100vw - 64px)'
          }}
        >
          <div className="bg-yellow-500 text-black px-8 py-5 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-xl mb-1">Baby Nutrition Assistant</h3>
                <p className="text-sm text-black/70">Online</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-black hover:text-black/70 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border-b border-yellow-100">
            <nav className="flex justify-around">
              {[
                { id: 'chat', icon: MessageCircle, label: 'Chat' },
                { id: 'guide', icon: Book, label: 'Guide' },
                { id: 'meal-plans', icon: Apple, label: 'Plans' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === id 
                      ? 'text-yellow-900 border-b-2 border-yellow-500 bg-yellow-50'
                      : 'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-base">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-yellow-50/50 px-6 py-3 border-b border-yellow-100 text-sm text-yellow-900">
            Please do not share any sensitive information in this chat window.
          </div>

          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {activeTab === 'chat' && renderChatContent()}
            {activeTab === 'guide' && (
              <div className="flex-1 overflow-y-auto messages-container">
                {renderGuideContent()}
              </div>
            )}
            {activeTab === 'meal-plans' && (
              <div className="flex-1 overflow-y-auto messages-container">
                {renderPlansContent()}
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto messages-container">
                {renderSettingsContent()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative group">
          {showLabel && (
            <div className="absolute bottom-full right-0 mb-2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm whitespace-nowrap animate-bounce shadow-lg">
              Need help with baby food planning? 👶
              <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-yellow-500"></div>
            </div>
          )}
          
          <button
            onClick={() => setIsOpen(true)}
            className="bg-yellow-500 text-black p-4 rounded-full shadow-xl hover:bg-yellow-400 hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group-hover:pr-6"
          >
            <MessageCircle size={28} className="animate-pulse" />
            <span className="hidden group-hover:inline font-semibold">Baby Food Help</span>
          </button>
        </div>
      )}
    </div>
  );
}