function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="w-96 rounded-2xl bg-slate-950/95 p-8 text-white shadow-xl ring-1 ring-white/20 backdrop-blur-lg">
        <h2>Loading, Please Wait...</h2>
      </div>
    </div>
  );
}

export default LoadingScreen;
