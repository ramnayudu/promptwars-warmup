'use client';
import { useState, useRef } from 'react';
import { UploadCloud, FileText, Camera, ShieldCheck, MapPin, Search, Download, CheckCircle, AlertTriangle, FileArchive, Languages, Loader2 } from 'lucide-react';
import { getDictionary, Language } from '@/shared/lib/i18n';

export default function ClaimProcessor() {
  const [lang, setLang] = useState<Language>('en');
  const d = getDictionary(lang);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [carModel, setCarModel] = useState('');
  const [city, setCity] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [vahanResult, setVahanResult] = useState<any>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleProcess = async () => {
    if (!imageFile || !pdfFile || !carModel || !city || !licensePlate) {
      alert("Please fill all fields and upload required files.");
      return;
    }
    setLoading(true);
    try {
      const vRes = await fetch('/api/vahan', {
        method: 'POST',
        body: JSON.stringify({ licensePlate }),
        headers: { 'Content-Type': 'application/json' }
      });
      const vahanData = await vRes.json();
      if (!vahanData.success) {
        alert("VAHAN Mock Failed. Please try MP09CS1234");
        setLoading(false);
        return;
      }
      setVahanResult(vahanData.data);

      const imgBase = await fileToBase64(imageFile);
      const pdfBase = await fileToBase64(pdfFile);

      const aRes = await fetch('/api/analyze-claim', {
        method: 'POST',
        body: JSON.stringify({
          vehicleImageBase64: imgBase,
          policyPdfBase64: pdfBase,
          carModel,
          city
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      const aiData = await aRes.json();
      if(aiData.success){
         setResult(aiData.data);
      } else {
         alert("AI processing failed. " + aiData.error);
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
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
      
      {/* Settings Bar */}
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 transition-colors px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-md border border-slate-700"
          aria-label="Toggle Language"
        >
          <Languages size={16} /> {lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
        </button>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Form UI */}
          <div className="flex flex-col gap-6 z-10">
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Camera className="text-indigo-400" /> {d.uploadPhoto}
               </h3>
               <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{imageFile ? imageFile.name : 'Click to upload damage photo'}</span></p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
               </label>
            </div>

            <div className="space-y-4">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-emerald-400" /> {d.uploadPolicy}
               </h3>
               <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileArchive className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{pdfFile ? pdfFile.name : 'Click to upload Policy (PDF)'}</span></p>
                  </div>
                  <input type="file" className="hidden" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
               </label>
            </div>
          </div>

          <div className="flex flex-col gap-6 z-10">
             <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Search size={16}/> License Plate (VAHAN)</label>
                <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} type="text" placeholder="MH01AB1234" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             
             <div className="group space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><MapPin size={16}/> Car Model</label>
                <input value={carModel} onChange={e => setCarModel(e.target.value)} type="text" placeholder="e.g. Maruti Suzuki Swift VXI" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><MapPin size={16}/> City (For Grounding)</label>
                <input value={city} onChange={e => setCity(e.target.value)} type="text" placeholder="e.g. Bangalore" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>

             <button 
               onClick={handleProcess} 
               disabled={loading || !imageFile || !pdfFile || !carModel || !city || !licensePlate}
               className="mt-auto flex items-center justify-center w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
               {loading ? d.analyzing : d.submit}
             </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
           <div 
             ref={resultRef} 
             className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl flex flex-col gap-6 border border-slate-200"
             id="claim-package-print-area"
           >
              {/* PDF Header */}
              <div className="border-b-2 border-slate-200 pb-6 flex justify-between items-start">
                 <div>
                    <h2 className="text-3xl font-extrabold text-indigo-900">{d.result}</h2>
                    <p className="text-slate-500 font-medium">Auto-generated via ClaimBridge AI + Google Grounding</p>
                 </div>
                 <div className="bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full font-bold text-sm flex items-center gap-2">
                    <CheckCircle size={16} /> Verified
                 </div>
              </div>

              {/* Grid 1: VAHAN Info */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 rounded-xl p-6 border border-slate-100">
                 <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Registration (VAHAN)</h4>
                    <p className="text-lg font-bold text-slate-800">{vahanResult?.licensePlate}</p>
                 </div>
                 <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Owner Name</h4>
                    <p className="font-semibold text-slate-800">{vahanResult?.ownerName}</p>
                 </div>
                 <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Vehicle Model</h4>
                    <p className="font-semibold text-slate-800">{vahanResult?.vehicleModel}</p>
                 </div>
                 <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Insurance Check</h4>
                    <p className="font-semibold text-slate-800">{vahanResult?.insuranceStatus} ({vahanResult?.insurer})</p>
                 </div>
              </div>

              {/* Grid 2: AI Parsing Results */}
              <div>
                 <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><ShieldCheck className="text-indigo-600"/> Policy Analytics (Gemini 3.1 Pro)</h3>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
                       <p className="text-xs text-indigo-600 font-bold uppercase mb-1">{d.idv}</p>
                       <p className="text-2xl font-black text-indigo-900">₹{result?.idv?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className={`border rounded-lg p-4 text-center ${result?.zeroDepActive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                       <p className="text-xs font-bold uppercase mb-1">{d.zeroDep}</p>
                       <p className="text-lg font-black">{result?.zeroDepActive ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className={`border rounded-lg p-4 text-center ${result?.consumablesActive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                       <p className="text-xs font-bold uppercase mb-1">{d.consumables}</p>
                       <p className="text-lg font-black">{result?.consumablesActive ? 'Covered' : 'Not Covered'}</p>
                    </div>
                 </div>
              </div>

              {/* Grid 3: Damage and Cost Grounding */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                 <h3 className="font-bold text-lg mb-2 text-amber-900 flex items-center gap-2"><AlertTriangle size={18} /> Damage Assessment & Cost Grounding</h3>
                 <p className="text-amber-800 mb-4">{result?.justification}</p>
                 <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-amber-200">
                    <span className="font-bold text-slate-700">Estimated Repair Cost (Live Search in {city}):</span>
                    <span className="text-3xl font-black text-amber-600">₹{result?.estimatedDamageCost?.toLocaleString() || 'N/A'}</span>
                 </div>
                 {result?.searchSources?.length > 0 && (
                   <div className="mt-4">
                     <p className="text-xs font-bold text-amber-800/60 uppercase mb-2">Grounding Sources:</p>
                     <ul className="text-xs text-amber-700 list-disc ml-5 space-y-1">
                       {result?.searchSources?.map((src: string, idx: number) => (
                         <li key={idx} className="truncate">{src}</li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
           </div>

           <button 
             onClick={handleDownload} 
             className="flex items-center justify-center w-full py-4 px-6 rounded-xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
           >
             <Download className="mr-2" /> Download Ready-to-File PDF
           </button>
        </div>
      )}
    </div>
  );
}
