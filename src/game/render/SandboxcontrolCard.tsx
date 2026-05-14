interface SandboxControlCardProps {
  label: string;
  value?: string;
  children: React.ReactNode;
}

function SandboxControlCard(props: SandboxControlCardProps) {
  return (
    <>
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-md flex flex-col justify-between min-h-40">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-300">{props.label}</h3>
          {"value" in props && (
            <p className="text-2xl font-bold text-white">
              {props.value == undefined ? "_" : props.value}
            </p>
          )}
          <div className="pt-4">{props.children}</div>
        </div>
      </div>
    </>
  );
}

export default SandboxControlCard;
