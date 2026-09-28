import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, AlertTriangle, ArrowRight, Stethoscope, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecialty: (specialty: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedSpecialty?: string;
  clarifyingQuestions?: string[];
  urgency?: 'ROUTINE' | 'URGENT_EMERGENCY';
  recommendedAction?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectSpecialty,
}) => {
  const { t } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your MediLink Health Navigation Assistant. Tell me what symptoms or health concerns you are experiencing, and I can help guide you to the right medical specialist. (Note: I provide specialty guidance and do not diagnose medical conditions).',
      clarifyingQuestions: [
        'e.g. "I have persistent dry cough and low-grade fever for 3 days"',
        'e.g. "Sudden itchy red patches on my arm"',
        'e.g. "Heart palpitations after morning exercise"',
      ],
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          previousMessages: newMessages.slice(-4),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.responseMessage,
            suggestedSpecialty: data.suggestedSpecialty,
            clarifyingQuestions: data.clarifyingQuestions,
            urgency: data.urgency,
            recommendedAction: data.recommendedAction,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Sorry, I encountered an issue analyzing your query. Please select a specialist directly from our doctors list.',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to the navigation engine right now. You can browse all verified specialists in the doctors directory.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl flex flex-col h-[650px] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">AI Health Navigation Assistant</h3>
                <span className="text-[10px] bg-emerald-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                  Triage Guide
                </span>
              </div>
              <p className="text-xs text-teal-100">Specialty guidance • No medical diagnosis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Prominent Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-start gap-2.5 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Medical Disclaimer:</strong> This assistant does not diagnose diseases, interpret lab tests, or prescribe medications. It helps you navigate symptoms to the most relevant medical specialty.
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-xs ${
                  m.role === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : m.urgency === 'URGENT_EMERGENCY'
                    ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                {/* Suggested Specialty Pill & Actions */}
                {m.suggestedSpecialty && m.urgency !== 'URGENT_EMERGENCY' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      Recommended Specialty:
                    </div>
                    <div className="flex items-center justify-between bg-teal-50/80 border border-teal-200 rounded-xl p-2.5">
                      <span className="font-bold text-teal-900 text-sm">{m.suggestedSpecialty}</span>
                      <button
                        onClick={() => {
                          onSelectSpecialty(m.suggestedSpecialty!);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Find {m.suggestedSpecialty}s</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Clarification Prompts / Follow-up chips */}
                {m.clarifyingQuestions && m.clarifyingQuestions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {m.role === 'assistant' && idx === 0 ? 'Example queries you can tap:' : 'Follow-up considerations:'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.clarifyingQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q.replace(/^e\.g\.\s*"/, '').replace(/"$/, ''))}
                          className="text-left text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl p-3 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Analyzing symptom context and specialty matching...</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your symptoms (e.g. fever, headache, back pain, skin rash)..."
            className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm px-4 py-2.5 rounded-xl border border-transparent focus:border-teal-500 focus:outline-hidden transition-all text-slate-900"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
