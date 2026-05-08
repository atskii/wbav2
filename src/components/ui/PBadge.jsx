import { PRIOS } from "../../lib/constants";

export default function PBadge({ p }) {
  const pr = PRIOS.find(x => x.id === p) || PRIOS[0];
  return <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${pr.tw}`}>{pr.label}</span>;
}
