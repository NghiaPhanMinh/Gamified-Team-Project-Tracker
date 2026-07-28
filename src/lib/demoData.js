const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const makeUser = (name, email = "", color = "#7761C7", spell = "fire") => ({
  id: `u-${Math.random().toString(36).slice(2, 9)}`,
  name,
  email,
  color,
  spell,
});

export function emptyWorkspace() {
  return { user: null, team: null, project: null, boss: null, goblins: [], activity: [], bossSubmissions: [], aiDraft: null };
}

export function sampleWorkspace() {
  const maya = { id: "u-maya", name: "Maya Chen", email: "maya@example.com", color: "#7761C7", spell: "fire" };
  const ali = { id: "u-ali", name: "Ali Rahman", email: "ali@example.com", color: "#E76748", spell: "thunder" };
  const priya = { id: "u-priya", name: "Priya Nair", email: "priya@example.com", color: "#4C9D9A", spell: "ice" };
  const jon = { id: "u-jon", name: "Jon Bell", email: "jon@example.com", color: "#D18B4C", spell: "ice" };
  const boss = { id: "b-1", title: "Launch the research showcase", totalScope: 100, remainingHP: 72, deadline: now + 4 * day, status: "active", createdAt: now - 3 * day };
  return {
    user: maya,
    team: { id: "t-1", name: "Studio 4A", inviteCode: "QUEST7", members: [maya, ali, priya, jon] },
    project: { id: "p-1", name: "Sustainable Cities Field Guide", overallDeadline: now + 15 * day },
    boss,
    goblins: [
      { id: "g-1", bossId: boss.id, title: "Research & source audit", ownerId: ali.id, verifierId: maya.id, weight: 16, status: "verified", proofText: "Sources checked against the rubric and formatted.", proofUrl: "sources.pdf", submittedAt: now - 2 * day, verifiedAt: now - day, verifierComment: "Clear and easy to trace." },
      { id: "g-2", bossId: boss.id, title: "Prototype the interactive map", ownerId: priya.id, verifierId: maya.id, weight: 12, status: "submitted", proofText: "Clickable prototype with the three priority neighbourhoods and a mobile pass.", proofUrl: "prototype-link.txt", submittedAt: now - 2 * 60 * 60 * 1000 },
      { id: "g-3", bossId: boss.id, title: "Write the story arc", ownerId: jon.id, verifierId: priya.id, weight: 12, status: "pending" },
    ],
    activity: [
      { id: "a-1", actorId: maya.id, action: "created the weekly boss", detail: boss.title, timestamp: now - 3 * day },
      { id: "a-2", actorId: ali.id, action: "submitted proof", detail: "Research & source audit", timestamp: now - 2 * day },
      { id: "a-3", actorId: maya.id, action: "approved a goblin", detail: "Research & source audit · −16 HP", timestamp: now - day },
      { id: "a-4", actorId: priya.id, action: "submitted proof", detail: "Prototype the interactive map", timestamp: now - 2 * 60 * 60 * 1000 },
    ],
    bossSubmissions: [],
    aiDraft: null,
  };
}

export function getStoredWorkspace() {
  try {
    const raw = localStorage.getItem("questboard-workspace-v1");
    return raw ? JSON.parse(raw) : emptyWorkspace();
  } catch {
    return emptyWorkspace();
  }
}

export function saveWorkspace(workspace) {
  try { localStorage.setItem("questboard-workspace-v1", JSON.stringify(workspace)); } catch { /* private browsing can block storage */ }
}

export function resolveWorkspaceDeadlines(workspace, timestamp = Date.now()) {
  if (!workspace.boss || workspace.boss.status !== "active" || workspace.boss.deadline > timestamp) return workspace;
  const status = workspace.boss.remainingHP <= 0 ? "defeated" : "survived";
  const actorId = workspace.user?.id || "system";
  return {
    ...workspace,
    boss: { ...workspace.boss, status, resolvedAt: timestamp },
    activity: [{ id: `a-${Date.now()}`, actorId, action: status === "defeated" ? "defeated the boss" : "logged a surviving boss", detail: status === "defeated" ? "HP reached zero before the deadline" : "HP remained at the deadline · no penalty", timestamp }, ...workspace.activity],
  };
}

export function formatInviteCode(code) { return code?.toUpperCase() || "QUEST7"; }
