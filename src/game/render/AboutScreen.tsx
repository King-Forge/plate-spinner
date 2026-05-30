interface AboutScreenProps {
  onClose: () => void;
}

function AboutScreen({ onClose }: AboutScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="w-96 rounded-2xl bg-slate-950/95 p-8 text-white shadow-xl ring-1 ring-white/20 backdrop-blur-lg">
        <h2>This is the about screen</h2>
        <button
          className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default AboutScreen;
