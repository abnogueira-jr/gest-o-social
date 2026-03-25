import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export default function UploadFotos({ fotos = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    onChange([...fotos, ...urls]);
    setUploading(false);
    toast.success(`${urls.length} foto(s) anexada(s).`);
    e.target.value = "";
  };

  const remover = (idx) => {
    onChange(fotos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {fotos.map((url, idx) => (
          <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
            <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remover(idx)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 hover:border-sky-400 hover:bg-sky-50 transition-colors flex-shrink-0"
        >
          {uploading ? (
            <Loader2 size={18} className="text-sky-500 animate-spin" />
          ) : (
            <>
              <ImagePlus size={18} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">Adicionar</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {fotos.length > 0 && (
        <p className="text-[11px] text-slate-400">{fotos.length} foto(s) anexada(s) · passe o mouse sobre a foto para remover</p>
      )}
    </div>
  );
}