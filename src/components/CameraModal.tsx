import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  RotateCw,
  ArrowRight
} from 'lucide-react';
import { LanguageCode, WordItem } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { getCustomApiKey } from '../utils/storage';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  onImportWords: (words: Array<Omit<WordItem, 'id' | 'createdAt'>>, detectedLang: LanguageCode) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onImportWords,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<Array<Omit<WordItem, 'id' | 'createdAt'> & { selected: boolean }>>([]);
  const [detectedLang, setDetectedLang] = useState<LanguageCode | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
    setExtractedWords([]);
    setDetectedLang(null);
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Step 1: Compress image via HTML5 Canvas (max 1200px, JPEG 0.8)
      setLoadingStep('Komprimerar bild för snabb sändning...');
      const { base64, mimeType } = await compressImage(selectedFile, 1200, 1200, 0.8);

      // Step 2: Send to backend Gemini 2.5 Flash
      setLoadingStep('🤖 Gemini 2.5 Flash läser av din glosläxa...');
      const customKey = getCustomApiKey();

      const response = await fetch('/api/scan-homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customKey ? { 'x-gemini-api-key': customKey } : {}),
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          currentLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Serverfel: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.words || data.words.length === 0) {
        throw new Error('Inga glosor hittades i bilden. Se till att läxan är väl upplyst och att texten syns tydligt.');
      }

      setDetectedLang(data.detectedLang || currentLang);
      setExtractedWords(
        data.words.map((w: any) => ({
          sv: w.sv || '',
          target: w.target || '',
          example: w.example || '',
          mastered: false,
          selected: true,
        }))
      );
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'Kunde inte läsa in glosorna. Kontrollera internetanslutningen och försök igen.');
    } finally {
      setIsProcessing(false);
      setLoadingStep('');
    }
  };

  const handleToggleSelectWord = (index: number) => {
    setExtractedWords((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSaveWords = () => {
    const selected = extractedWords
      .filter((w) => w.selected)
      .map(({ selected, ...rest }) => rest);

    if (selected.length === 0) {
      setErrorMessage('Välj minst ett ord att importera.');
      return;
    }

    onImportWords(selected, detectedLang || currentLang);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsProcessing(false);
    setErrorMessage(null);
    setExtractedWords([]);
    setDetectedLang(null);
  };

  const selectedCount = extractedWords.filter((w) => w.selected).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          title="Stäng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Fota ny läxa
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Ta en bild på ditt gloshäfte eller ladda upp ett foto så läser AI in orden automatiskt.
        </p>

        {/* Hidden File Inputs */}
        {/* Camera capture directly for phones */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        {/* Regular file picker for desktop/galleries */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Step 1: No file selected yet */}
        {!previewUrl && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Snap Photo Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-800/80 to-slate-900 border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="font-bold text-sm text-white block">
                  Ta bild med kameran 📸
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Öppnar mobilens kamera direkt
                </span>
              </button>

              {/* Upload Existing Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl bg-slate-800/40 border-2 border-dashed border-slate-700 hover:border-slate-500 flex flex-col items-center justify-center text-center group cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <span className="font-bold text-sm text-white block">
                  Välj bild från galleri 🖼️
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Ladda upp foto eller skärmdump
                </span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Tips: Håll kameran stadigt och se till att både de svenska och utländska orden syns i bild!
              </span>
            </div>
          </div>
        )}

        {/* Step 2: File selected, preview & scan */}
        {previewUrl && extractedWords.length === 0 && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black max-h-64 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Läxfoto"
                className="max-h-64 w-auto object-contain"
              />
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium flex items-center gap-1 backdrop-blur-sm cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Byt bild</span>
              </button>
            </div>

            {isProcessing ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-900/60 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-sm font-bold text-white">{loadingStep}</p>
                <p className="text-xs text-slate-400">
                  Bilden skalas automatiskt ner till 1200px JPEG för blixtsnabb analys.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tolka glosor med AI 🚀</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Extracted words review */}
        {extractedWords.length > 0 && (
          <div className="space-y-4">
            {/* Language notification banner */}
            {detectedLang && (
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                  detectedLang !== currentLang
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {detectedLang === 'es-ES' ? '🇪🇸' : '🇬🇧'}
                  </span>
                  <span>
                    Detekterat språk: {detectedLang === 'es-ES' ? 'Spanska' : 'Engelska'}
                  </span>
                </div>
                {detectedLang !== currentLang && (
                  <span className="text-[11px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    Byter automatiskt!
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Hittade {extractedWords.length} glosor. Bocka ur om något blev fel:</span>
              <span className="font-bold text-white">{selectedCount} valda</span>
            </div>

            {/* List of detected words */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {extractedWords.map((word, index) => (
                <div
                  key={index}
                  onClick={() => handleToggleSelectWord(index)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                    word.selected
                      ? 'bg-slate-950 border-indigo-500/60 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      word.selected
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-700 bg-transparent'
                    }`}
                  >
                    {word.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm text-emerald-300 truncate">
                        {word.target}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        = {word.sv}
                      </span>
                    </div>
                    {word.example && (
                      <p className="text-[11px] text-slate-500 italic truncate mt-0.5">
                        "{word.example}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Fota om
              </button>
              <button
                type="button"
                onClick={handleSaveWords}
                disabled={selectedCount === 0}
                className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  selectedCount > 0
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Lägg till {selectedCount} glosor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
