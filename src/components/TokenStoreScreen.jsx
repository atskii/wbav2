import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Mail, Check, Infinity } from 'lucide-react';
import useToasts from '../hooks/useToasts';

export default function TokenStoreScreen({ onClose, userEmail }) {
  const { add } = useToasts();
  const [copied, setCopied] = useState(false);
  
  const creatorEmail = "alek.iglow@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(creatorEmail);
    setCopied(true);
    add("Adres e-mail skopiowany!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const mailToLink = `mailto:${creatorEmail}?subject=Chcę%20kupić%20Monety%20AI&body=Cześć%2C%0A%0AChciałbym%2Fchciałabym%20uzyskać%20więcej%20Monet%20AI%20na%20moim%20koncie.%0AMój%20adres%20e-mail%20przypisany%20do%20konta%20to%3A%20${encodeURIComponent(userEmail || '')}%0A%0AProszę%20o%20informację%20jak%20mogę%20to%20zrobić!`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[9999] bg-[#F9F7F4] flex flex-col overflow-y-auto overflow-x-hidden"
    >
      {/* Pasek Nawigacyjny */}
      <div className="w-full bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center sticky top-0 z-50">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1A2F22] font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Wróć do aplikacji
        </button>
      </div>

      {/* Nagłówek Ekranu */}
      <div className="w-full max-w-6xl mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-[#1A2F22] mb-4">
          Zdobądź więcej Monet AI
        </h1>
        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Monety AI dają Ci dostęp do zaawansowanych algorytmów analizy i generowania planów. Wybierz pakiet, który najbardziej Ci odpowiada.
        </p>
      </div>

      {/* Karty Cenowe */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8">
          
          {/* Karta 1: Tymczasowy Kontakt (Pierwsza na mobile i desktop) */}
          <div className="flex-1 bg-white rounded-[32px] p-6 md:p-8 shadow-xl border-2 border-[#2D9E6B] flex flex-col relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D9E6B] rounded-full blur-[70px] opacity-20 -mr-10 -mt-10 pointer-events-none" />
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#1A2F22] mb-2">Poproś o Monety</h2>
              <p className="text-gray-500 text-sm font-medium">
                Zanim wprowadzimy oficjalne płatności, możesz uzyskać monety bezpłatnie u twórcy.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-[#2D9E6B]">Darmowe</span>
                <span className="text-gray-400 font-medium pb-1">/ na razie</span>
              </div>
            </div>
            
            <div className="bg-[#E8F4ED] rounded-xl p-4 border border-[#2D9E6B]/20 mb-8 flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Twój E-mail w systemie</span>
              <span className="text-sm font-bold text-[#1E5C36] break-all">{userEmail || 'Brak emaila'}</span>
            </div>

            <div className="flex-grow">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-[#2D9E6B] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm font-medium">Brak opłat na ten moment</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-[#2D9E6B] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm font-medium">Szybkie doładowanie przez e-mail</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-[#2D9E6B] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm font-medium">Pełne wsparcie dla testerów</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <a
                href={mailToLink}
                className="w-full bg-[#1A2F22] hover:bg-[#2D9E6B] text-white py-4 px-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Mail size={18} />
                Napisz E-mail
              </a>
              <button
                onClick={handleCopy}
                className="w-full bg-white hover:bg-gray-50 text-[#1A2F22] py-4 px-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-colors border-2 border-gray-200"
              >
                {copied ? <Check size={18} className="text-[#2D9E6B]" /> : <Copy size={18} />}
                {copied ? 'Skopiowano!' : 'Kopiuj e-mail twórcy'}
              </button>
            </div>
          </div>

          {/* Karta 2: 100 Monet (Przyszłość) */}
          <div className="flex-1 bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-200 flex flex-col relative opacity-80">
            <div className="absolute -top-3 -right-3 bg-gray-200 text-gray-500 font-bold px-3 py-1 rounded-full uppercase text-xs tracking-wider shadow-sm">
              Wkrótce
            </div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-700 mb-2">Pakiet Elastyczny (100 Monet)</h2>
              <p className="text-gray-500 text-sm font-medium">
                Idealny dla studentów i osób potrzebujących doraźnego wsparcia w organizacji nauki i zadań.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-gray-300 line-through decoration-2">20 zł</span>
                <span className="text-gray-400 font-medium pb-1">/ jednorazowo</span>
              </div>
            </div>

            <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl font-bold text-center mb-8 cursor-not-allowed">
              Wybierz Pakiet Elastyczny
            </button>

            <div className="flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-sm font-medium">100 zapytań do AI (bez daty ważności)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-sm font-medium">Błyskawiczne generowanie planów nauki i dnia</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-sm font-medium">Podstawowa analiza trendów i nastroju</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500 text-sm font-medium">Płacisz tylko za to, co zużyjesz</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Karta 3: Bez Limitu (Przyszłość) */}
          <div className="flex-1 bg-white rounded-[32px] p-6 md:p-8 shadow-sm border-2 border-amber-200 bg-gradient-to-b from-white to-amber-50/30 flex flex-col relative opacity-80">
            <div className="absolute -top-3 -right-3 bg-amber-200 text-amber-800 font-bold px-3 py-1 rounded-full uppercase text-xs tracking-wider shadow-sm">
              Wkrótce
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white flex-shrink-0">
                  <Infinity size={18} />
                </div>
                <h2 className="text-2xl font-black text-amber-800">Pro Bez Limitu</h2>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                Dla profesjonalistów i menedżerów, którzy cenią swój czas i wymagają doskonałej personalizacji.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-amber-600/40 line-through decoration-2">50 zł</span>
                <span className="text-gray-400 font-medium pb-1">/ miesiąc</span>
              </div>
            </div>

            <button disabled className="w-full bg-amber-100/50 border border-amber-200 text-amber-600/50 py-4 rounded-xl font-bold text-center mb-8 cursor-not-allowed">
              Wybierz pakiet Pro
            </button>

            <div className="flex-grow">
              <div className="text-xs font-black text-amber-800 uppercase tracking-wider mb-4 px-1">
                Wszystko w darmowym, oraz:
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm font-medium">Nielimitowany dostęp do silników AI</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm font-medium">Priorytetowe przetwarzanie (najwyższa prędkość)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm font-medium">Zaawansowana personalizacja harmonogramów</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm font-medium">Wcześniejszy dostęp do nowych integracji i funkcji</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
