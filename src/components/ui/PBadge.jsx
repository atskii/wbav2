import { PRIOS } from "../../lib/constants";

export default function PBadge({ p, small = false }) {
  const pr = PRIOS.find(x => x.id === p) || PRIOS[0];
  const padding = small ? "px-1.5 py-0" : "px-2.5 py-1";
  const text = small ? "text-[8px] md:text-[9px]" : "text-[10px]";
  return <span className={`${text} ${padding} rounded-full font-bold uppercase ${pr.tw}`}>{pr.label}</span>;
}
