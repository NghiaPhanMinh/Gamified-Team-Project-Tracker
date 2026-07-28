import { useEffect, useMemo, useRef, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import Goblin from "./Goblin";
import Dragon from "./Dragon";
import Wizard from "./Wizard";
import { daysBetween } from "../lib/questData";

function Avatar({ member }) { return <div className="scene-avatar" style={{ backgroundColor: member.color }} title={member.name}>{member.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>; }

export default function QuestScene({ boss, members, goblinLogs, onLogGoblin }) {
  const [pulse, setPulse] = useState(false); const [joinedNotice, setJoinedNotice] = useState(""); const seenMembers = useRef(new Set(members.map((member) => member.id))); const previousLogs = useRef(goblinLogs.length);
  const quota = daysBetween(boss.createdAt, boss.deadline); const slain = Math.min(goblinLogs.length, quota); const remaining = Math.max(0, quota - slain); const dragonIn = remaining === 0;
  const recentGoblin = useMemo(() => goblinLogs[0], [goblinLogs]);
  useEffect(() => { if (goblinLogs.length > previousLogs.current) { setPulse(true); const timer = setTimeout(() => setPulse(false), 950); previousLogs.current = goblinLogs.length; return () => clearTimeout(timer); } previousLogs.current = goblinLogs.length; return undefined; }, [goblinLogs.length]);
  useEffect(() => { const newMember = members.find((member) => !seenMembers.current.has(member.id)); if (newMember) { setJoinedNotice(`${newMember.name} has joined the quest`); seenMembers.current.add(newMember.id); const timer = setTimeout(() => setJoinedNotice(""), 4200); return () => clearTimeout(timer); } return undefined; }, [members]);
  const daysLeft = differenceInCalendarDays(new Date(boss.deadline), new Date());
  return <section className="quest-scene" aria-label="Live quest scene">
    <div className="scene-sky"><div className="scene-cloud cloud-a"><i /><i /><i /></div><div className="scene-cloud cloud-b"><i /><i /><i /></div><div className="scene-cloud cloud-c"><i /><i /><i /></div><div className="scene-sun">✦</div></div>
    <div className="scene-tree tree-a"><b /><i /></div><div className="scene-tree tree-b"><b /><i /></div><div className="scene-tree tree-c"><b /><i /></div><div className="scene-tree tree-d"><b /><i /></div>
    <div className="scene-ground" />
    <div className="scene-copy"><div className="scene-kicker">Live quest scene</div><h2>{dragonIn ? "The dragon is ready." : "Keep the party moving."}</h2><p>{dragonIn ? "The goblin stretch is clear. Boss-share PDFs are always available—keep the real work moving." : `Every quick goblin kill keeps the scene lively. ${daysLeft >= 0 ? `${daysLeft} days left to the deadline.` : "Deadline is close."}`}</p></div>
    <div className="scene-presence"><span className="scene-presence-label">Party online</span><div className="scene-avatar-row">{members.map((member) => <Avatar key={member.id} member={member} />)}</div></div>
    {joinedNotice && <div className="join-notice">✦ {joinedNotice}</div>}
    <div className={`scene-goblin-stage ${pulse ? "is-killed" : ""} ${dragonIn ? "is-cleared" : ""}`}><div className="scene-burst">✦ ✧ · ✦</div><Goblin state={pulse ? "killed" : "idle"} size={132} /><div className="scene-queue-count"><strong>{slain}</strong><span>of {quota} goblin slots slain</span></div>{recentGoblin?.note && <div className="scene-last-kill">“{recentGoblin.note}”</div>}</div>
    <div className={`scene-dragon-stage ${dragonIn ? "is-entered" : ""}`}><Dragon hpPercent={100} size={205} /><div className="scene-dragon-label">{dragonIn ? "Boss fight phase" : "Dragon waiting"}</div></div>
    <button className="scene-log-button" onClick={onLogGoblin}>+ Log a goblin kill</button>
    <div className="scene-wizards">{members.slice(0, 5).map((member) => <div key={member.id} className="scene-wizard"><Wizard color={member.color} spell={member.spell} size={67} /><span>{member.name.split(" ")[0]}</span></div>)}</div>
  </section>;
}
