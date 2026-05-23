interface PauseScreenProps {
  onResume: () => void;
}

function PauseScreen({ onResume }: PauseScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="w-96 rounded-2xl bg-white/10 p-8 text-white shadow-xl ring-1 ring-white/20 backdrop-blur-lg">
        <h2>Game Paused</h2>
        <button
          className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit"
          onClick={onResume}
        >
          Resume
        </button>
      </div>
    </div>
  );
}

export default PauseScreen;
