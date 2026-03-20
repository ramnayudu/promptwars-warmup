'use client';
/**
 * @file ClaimProcessor.tsx
 * @description Primary orchestration widget combining VAHAN Mock, Google GenAI Policy-to-Ground logic,
 * Google Maps Places Autocomplete, and Firebase persistence into a single accessible UI layer.
 * Follows Single Responsibility Principle by delegating to extracted hooks and utilities.
 */
import { useState, useRef } from 'react';
import {
  Camera, FileText, UploadCloud, Search, MapPin, Download,
  CheckCircle, AlertTriangle, FileArchive, Languages,
  Loader2, ShieldCheck, LogIn,
} from 'lucide-react';
import { getDictionary, Language } from '@/shared/lib/i18n';
import { saveClaimToDatabase, auth } from '@/shared/api/firebase';
import { signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';
import { fileToBase64 } from '@/shared/lib/fileUtils';
import { useGoogleMapsAutocomplete } from '@/shared/hooks/useGoogleMapsAutocomplete';
import type { ClaimAnalysisResult, VahanRecord, AuthUser } from '@/shared/types';

// ─── Sub-Components (Decomposed for SRP) ────────────────────────────────────

/**
 * Renders a file upload drop zone with accessible labeling.
 *
 * @param props - Upload zone configuration
 */
function FileUploadZone(props: {
  id: string;
  labelId: string;
  title: string;
  icon: React.ReactNode;
  fileName: string | null;
  accept: string;
  ringColor: string;
  onFileSelect: (file: File | null) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 id={props.labelId} className="text-xl font-bold text-white flex items-center gap-2">
        {props.icon} {props.title}
      </h3>
      <label
        htmlFor={props.id}
        aria-labelledby={props.labelId}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all focus-within:ring-2 ${props.ringColor}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" />
          <p className="mb-2 text-sm text-slate-400">
            <span className="font-semibold">{props.fileName ?? 'Click to upload'}</span>
          </p>
        </div>
        <input
          id={props.id}
          type="file"
          className="sr-only"
          accept={props.accept}
          onChange={(e) => props.onFileSelect(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

/**
 * Renders the VAHAN registration grid in the result view.
 *
 * @param props - The VAHAN record to display
 */
function VahanInfoGrid({ data }: { data: VahanRecord }) {
  return (
    <div className="grid grid-cols-2 gap-6 bg-slate-50 rounded-xl p-6 border border-slate-100">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Registration (VAHAN)</h4>
        <p className="text-lg font-bold text-slate-800">{data.licensePlate}</p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Owner Name</h4>
        <p className="font-semibold text-slate-800">{data.ownerName}</p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Vehicle Model</h4>
        <p className="font-semibold text-slate-800">{data.vehicleModel}</p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Insurance Check</h4>
        <p className="font-semibold text-slate-800">{data.insuranceStatus} ({data.insurer})</p>
      </div>
    </div>
  );
}

// ─── Main Orchestrator Widget ────────────────────────────────────────────────

/**
 * ClaimProcessor Component — Primary agentic bridge frontend widget.
 * Delegates file conversion, Google Maps integration, and Firebase persistence
 * to extracted utilities/hooks for clean separation of concerns.
 *
 * @returns The rendered claim processing form and result view
 */
export default function ClaimProcessor() {
  const [lang, setLang] = useState<Language>('en');
  const d = getDictionary(lang);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [carModel, setCarModel] = useState('');
  const [city, setCity] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimAnalysisResult | null>(null);
  const [vahanResult, setVahanResult] = useState<VahanRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Delegate Google Maps Autocomplete to extracted custom hook
  useGoogleMapsAutocomplete(cityInputRef, setCity);

  /**
   * Initiates Firebase Authentication via Google sign-in popup.
   */
  const handleLogin = async (): Promise<void> => {
    if (!auth) {
      console.warn('Firebase Auth not configured.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const firebaseUser: User = res.user;
      setUser({ uid: firebaseUser.uid, displayName: firebaseUser.displayName, email: firebaseUser.email });
    } catch (e) {
      console.error('Firebase Auth Error', e);
    }
  };

  /**
   * Orchestrates the complete multimodal claim processing pipeline:
   * 1. Validates VAHAN registration
   * 2. Converts files to Base64
   * 3. Sends to Gemini for analysis
   * 4. Persists results to Firebase
   */
  const handleProcess = async (): Promise<void> => {
    setErrorMsg(null);
    if (!imageFile || !pdfFile || !carModel || !city || !licensePlate) {
      setErrorMsg('Please fill all fields and upload required files.');
      return;
    }
    setLoading(true);
    try {
      // Step 1: VAHAN verification
      const vRes = await fetch('/api/vahan', {
        method: 'POST',
        body: JSON.stringify({ licensePlate }),
        headers: { 'Content-Type': 'application/json' },
      });
      const vahanData = await vRes.json();
      if (!vahanData.success) {
        setErrorMsg('VAHAN Mock Failed. Please verify your number plate format.');
        setLoading(false);
        return;
      }
      setVahanResult(vahanData.data as VahanRecord);

      // Step 2: File conversion via extracted utility
      const imgBase = await fileToBase64(imageFile);
      const pdfBase = await fileToBase64(pdfFile);

      // Step 3: AI Analysis
      const aRes = await fetch('/api/analyze-claim', {
        method: 'POST',
        body: JSON.stringify({ vehicleImageBase64: imgBase, policyPdfBase64: pdfBase, carModel, city }),
        headers: { 'Content-Type': 'application/json' },
      });
      const aiData = await aRes.json();

      if (aiData.success) {
        const analysisResult = aiData.data as ClaimAnalysisResult;
        setResult(analysisResult);
        // Step 4: Firebase persistence
        await saveClaimToDatabase({ ...analysisResult, uid: user?.uid ?? 'anonymous' });
      } else {
        setErrorMsg(`AI processing failed. ${aiData.error}`);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('An error occurred during processing.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generates and downloads a PDF claim package from the result view.
   */
  const handleDownload = async (): Promise<void> => {
    if (!resultRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    const canvas = await html2canvas(resultRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ClaimBridge_${licensePlate}_Package.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 text-slate-200">

      {/* Language Toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 transition-colors px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-md border border-slate-700"
          aria-label="Toggle Language"
        >
          <Languages size={16} aria-hidden="true" /> {lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
        </button>
      </div>

      {/* Authentication Gate */}
      {!user && auth?.app ? (
        <div className="flex flex-col items-center justify-center bg-slate-900/50 p-12 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm text-center">
          <ShieldCheck size={64} className="text-indigo-400 mb-6" aria-hidden="true" />
          <h2 className="text-3xl font-black text-white mb-4">Secure Access Required</h2>
          <p className="text-slate-400 max-w-md mb-8">Please authenticate with your Google Workspace Account via Firebase Auth to process AI claims.</p>
          <button onClick={handleLogin} className="flex items-center gap-3 bg-white text-slate-900 font-bold text-lg px-8 py-4 rounded-full hover:bg-indigo-50 transition-all shadow-xl hover:shadow-indigo-500/20">
            <LogIn size={20} aria-hidden="true" /> Authenticate via Google
          </button>
        </div>
      ) : (
        <>
          {/* Error Alert */}
          {errorMsg && (
            <div role="alert" aria-live="assertive" className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center gap-3">
              <AlertTriangle size={20} /> {errorMsg}
            </div>
          )}

          {/* Claim Input Form */}
          {!result ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="flex flex-col gap-6 z-10">
                <FileUploadZone
                  id="file-image"
                  labelId="upload-photo-label"
                  title={d.uploadPhoto}
                  icon={<Camera className="text-indigo-400" aria-hidden="true" />}
                  fileName={imageFile?.name ?? null}
                  accept="image/*"
                  ringColor="focus-within:ring-indigo-500"
                  onFileSelect={setImageFile}
                />
                <FileUploadZone
                  id="file-pdf"
                  labelId="upload-policy-label"
                  title={d.uploadPolicy}
                  icon={<FileText className="text-emerald-400" aria-hidden="true" />}
                  fileName={pdfFile?.name ?? null}
                  accept="application/pdf"
                  ringColor="focus-within:ring-emerald-500"
                  onFileSelect={setPdfFile}
                />
              </div>

              <div className="flex flex-col gap-6 z-10">
                <div className="space-y-2">
                  <label htmlFor="input-vahan" className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Search size={16} aria-hidden="true" /> License Plate (VAHAN)</label>
                  <input id="input-vahan" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} type="text" placeholder="MH01AB1234" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="input-model" className="text-sm font-semibold text-slate-300 flex items-center gap-2"><MapPin size={16} aria-hidden="true" /> Car Model</label>
                  <input id="input-model" value={carModel} onChange={(e) => setCarModel(e.target.value)} type="text" placeholder="e.g. Maruti Suzuki Swift VXI" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="input-city" className="text-sm font-semibold text-slate-300 flex items-center gap-2"><MapPin size={16} aria-hidden="true" /> City (For Grounding)</label>
                  <input ref={cityInputRef} id="input-city" value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder="e.g. Bangalore" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button
                  onClick={handleProcess}
                  disabled={loading || !imageFile || !pdfFile || !carModel || !city || !licensePlate}
                  aria-busy={loading}
                  className="mt-auto flex items-center justify-center w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" aria-hidden="true" /> : <ShieldCheck className="mr-2" aria-hidden="true" />}
                  {loading ? d.analyzing : d.submit}
                </button>
              </div>
            </div>
          ) : (
            /* Claim Result View */
            <div className="flex flex-col gap-6" aria-live="polite">
              <div ref={resultRef} className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl flex flex-col gap-6 border border-slate-200" id="claim-package-print-area">
                {/* Header */}
                <div className="border-b-2 border-slate-200 pb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-extrabold text-indigo-900">{d.result}</h2>
                    <p className="text-slate-500 font-medium">Auto-generated via ClaimBridge AI + Google Grounding</p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full font-bold text-sm flex items-center gap-2" aria-label="Verified Record">
                    <CheckCircle size={16} aria-hidden="true" /> Verified
                  </div>
                </div>

                {/* VAHAN Info (Decomposed Sub-Component) */}
                {vahanResult && <VahanInfoGrid data={vahanResult} />}

                {/* Policy Analytics */}
                <div>
                  <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><ShieldCheck className="text-indigo-600" aria-hidden="true" /> Policy Analytics (Gemini 3.1 Pro)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
                      <p className="text-xs text-indigo-600 font-bold uppercase mb-1">{d.idv}</p>
                      <p className="text-2xl font-black text-indigo-900">₹{result.idv?.toLocaleString() ?? 'N/A'}</p>
                    </div>
                    <div className={`border rounded-lg p-4 text-center ${result.zeroDepActive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <p className="text-xs font-bold uppercase mb-1">{d.zeroDep}</p>
                      <p className="text-lg font-black">{result.zeroDepActive ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className={`border rounded-lg p-4 text-center ${result.consumablesActive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <p className="text-xs font-bold uppercase mb-1">{d.consumables}</p>
                      <p className="text-lg font-black">{result.consumablesActive ? 'Covered' : 'Not Covered'}</p>
                    </div>
                  </div>
                </div>

                {/* Damage Assessment */}
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <h3 className="font-bold text-lg mb-2 text-amber-900 flex items-center gap-2"><AlertTriangle size={18} aria-hidden="true" /> Damage Assessment &amp; Cost Grounding</h3>
                  <p className="text-amber-800 mb-4">{result.justification}</p>
                  <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-amber-200">
                    <span className="font-bold text-slate-700">Estimated Repair Cost (Live Search in {city}):</span>
                    <span className="text-3xl font-black text-amber-600">₹{result.estimatedDamageCost?.toLocaleString() ?? 'N/A'}</span>
                  </div>
                  {result.searchSources?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-amber-800/60 uppercase mb-2">Grounding Sources:</p>
                      <ul className="text-xs text-amber-700 list-disc ml-5 space-y-1">
                        {result.searchSources.map((src, idx) => (
                          <li key={idx} className="truncate"><a href={src} target="_blank" rel="noreferrer" className="underline">{src}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="flex items-center justify-center w-full py-4 px-6 rounded-xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
                aria-label="Download Ready-to-File PDF"
              >
                <Download className="mr-2" aria-hidden="true" /> Download Ready-to-File PDF
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
