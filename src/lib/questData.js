const DAY = 24 * 60 * 60 * 1000;

export const SPELLS = [
  ["fire", "Fire", "#F27A51"],
  ["ice", "Ice", "#78B8DE"],
  ["thunder", "Thunder", "#E4B94E"],
];

export function makeUser(name, email, color = "#7761C7", spell = "fire", id = `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`) {
  return { id, name, email, color, spell };
}

export function emptyWorkspace() {
  return { user: null, team: null, bosses: [], shares: [], goblinLogs: [], activity: [] };
}

function splitEvenly(total, count) {
  const base = Math.floor((total / count) * 10) / 10;
  const values = Array(count).fill(base);
  values[values.length - 1] = Math.round((total - base * (count - 1)) * 10) / 10;
  return values;
}

export function createShares(memberIds, verifierByMember = {}) {
  return splitEvenly(100, memberIds.length).map((weight, index) => ({ memberId: memberIds[index], verifierId: verifierByMember[memberIds[index]] || memberIds[(index + 1) % memberIds.length], weight }));
}

export function sampleWorkspace() {
  const maya = makeUser("Maya Chen", "maya@example.com", "#7761C7", "fire", "u-maya");
  const ali = makeUser("Ali Rahman", "ali@example.com", "#E76748", "thunder", "u-ali");
  const priya = makeUser("Priya Nair", "priya@example.com", "#4C9D9A", "ice", "u-priya");
  const jon = makeUser("Jon Bell", "jon@example.com", "#D18B4C", "ice", "u-jon");
  const now = Date.now(); const boss = { id: "b-1", teamId: "t-1", title: "Launch the research showcase", deadline: now + 4 * DAY, createdAt: now - 3 * DAY, partyMemberIds: [maya.id, ali.id, priya.id, jon.id], status: "active" };
  return {
    user: maya,
    team: { id: "t-1", name: "Studio 4A", joinCode: "QUEST7", members: [maya, ali, priya, jon], createdAt: now - 5 * DAY },
    bosses: [boss],
    shares: [
      { id: "s-1", bossId: boss.id, memberId: maya.id, verifierId: ali.id, weight: 25, status: "pending" },
      { id: "s-2", bossId: boss.id, memberId: ali.id, verifierId: priya.id, weight: 25, status: "verified", pdfUrl: "research-proof.pdf", submittedAt: now - DAY, verifiedAt: now - 18 * 60 * 60 * 1000, verifierComment: "Checked the source trail and final references." },
      { id: "s-3", bossId: boss.id, memberId: priya.id, verifierId: jon.id, weight: 25, status: "submitted", pdfUrl: "prototype-proof.pdf", submittedAt: now - 2 * 60 * 60 * 1000 },
      { id: "s-4", bossId: boss.id, memberId: jon.id, verifierId: maya.id, weight: 25, status: "pending" },
    ],
    goblinLogs: [
      { id: "gl-1", teamId: "t-1", bossId: boss.id, memberId: priya.id, note: "Cleaned up the map legend", loggedAt: now - 4 * 60 * 60 * 1000 },
      { id: "gl-2", teamId: "t-1", bossId: boss.id, memberId: ali.id, note: "Rechecked the interview notes", loggedAt: now - 2 * 60 * 60 * 1000 },
    ],
    activity: [
      { id: "a-1", actorId: maya.id, action: "created a weekly boss", detail: boss.title, timestamp: now - 3 * DAY },
      { id: "a-2", actorId: ali.id, action: "submitted a boss-share PDF", detail: "25 HP share", timestamp: now - DAY },
      { id: "a-3", actorId: priya.id, action: "slain a goblin", detail: "Cleaned up the map legend", timestamp: now - 4 * 60 * 60 * 1000 },
      { id: "a-4", actorId: priya.id, action: "submitted a boss-share PDF", detail: "25 HP share", timestamp: now - 2 * 60 * 60 * 1000 },
    ],
  };
}

export function getStoredWorkspace() {
  try { const raw = localStorage.getItem("questboard-workspace-v2"); return raw ? JSON.parse(raw) : emptyWorkspace(); } catch { return emptyWorkspace(); }
}

export function saveWorkspace(workspace) {
  try { localStorage.setItem("questboard-workspace-v2", JSON.stringify(workspace)); } catch { /* storage can be blocked in private browsing */ }
}

export function activeBoss(workspace) { return workspace.bosses.find((boss) => boss.status === "active") || workspace.bosses[0] || null; }
export function bossShares(workspace, bossId) { return workspace.shares.filter((share) => share.bossId === bossId); }
export function remainingHP(workspace, bossId) { return bossShares(workspace, bossId).filter((share) => share.status !== "verified").reduce((sum, share) => sum + share.weight, 0); }
export function totalHP(workspace, bossId) { return bossShares(workspace, bossId).reduce((sum, share) => sum + share.weight, 0); }
export function daysBetween(start, end) { return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / DAY)); }
export function resolveDeadline(workspace, at = Date.now()) {
  return { ...workspace, bosses: workspace.bosses.map((boss) => {
    if (boss.status !== "active" || boss.deadline > at) return boss;
    const shares = bossShares(workspace, boss.id); const status = shares.length > 0 && shares.every((share) => share.status === "verified") ? "defeated" : "survived";
    return { ...boss, status, resolvedAt: at };
  }) };
}
