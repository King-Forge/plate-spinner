import type { GameSummary } from "../core/gameTypes";

interface GameOverScreenProps {
  onRestart: () => void;
  onSettings: () => void;
  onAbout: () => void;
  gameSummary?: GameSummary;
}

function GameOverScreen({
  onRestart,
  onSettings,
  onAbout,
  gameSummary,
}: GameOverScreenProps) {
  const displayMessage = gameSummary?.gameOverMessage
    ? gameSummary.gameOverMessage
    : "Error: no game over message provided by Game Engine";
  const summaryElements = gameSummary?.recordSummaries.map((recordSummary) => {
    return (
      <div
        key={recordSummary.id}
        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
      >
        <div className="font-semibold text-white">
          Task {recordSummary.displayName}:
        </div>
        <div className="whitespace-nowrap text-slate-200">
          {recordSummary.taskCounts.perfectCount} Perfects |{" "}
          {recordSummary.taskCounts.successCount} Successes |{" "}
          {recordSummary.taskCounts.missCount} Total Misses |{" "}
          {recordSummary.taskCounts.missStreak} Miss Streak
        </div>
      </div>
    );
    //in case something was missing:
  }) ?? [
    <>
      <div className="text-sm font-semibold text-slate-100">Error</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-300">
        Error, no valid end of run summary was provided by game engine
      </div>
    </>,
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="w-full max-w-2xl space-y-5 rounded-2xl bg-slate-950/95 p-8 text-white shadow-xl ring-1 ring-white/20 backdrop-blur-lg">
        {/*header section*/}
        <section>
          <h2 className="text-center text-3xl font-bold tracking-wide text-white drop-shadow">
            Game Over!
          </h2>
        </section>
        {/*gameOver message section*/}
        <section>
          <p className="text-center text-base font-medium text-slate-100">
            {displayMessage}
          </p>
        </section>

        {/*summary section*/}
        <section className="rounded-lg bg-black/30 px-3 py-2 ring-1 ring-white/10">
          {summaryElements}
        </section>

        <button
          className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit"
          onClick={onRestart}
        >
          Restart
        </button>
        <button
          className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit"
          onClick={onSettings}
        >
          Settings
        </button>
        <button
          className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit"
          onClick={onAbout}
        >
          About
        </button>
      </div>
    </div>
  );
}

export default GameOverScreen;
