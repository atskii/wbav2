export function Sk({ cls = "" }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-2xl ${cls}`} />;
}

export default function SkeletonScreen() {
  return (
    <div className="p-6 space-y-4 pt-14">
      <Sk cls="h-7 w-44" />
      <Sk cls="h-4 w-64" />
      <div className="space-y-3 mt-4">
        {[80, 72, 72, 72].map((h, i) => <Sk key={i} cls={`h-${h === 80 ? "20" : "16"} w-full`} />)}
      </div>
      <Sk cls="h-48 w-full mt-2" />
    </div>
  );
}
