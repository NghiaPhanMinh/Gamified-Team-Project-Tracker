import jsPDF from "jspdf";
import { format } from "date-fns";
import { remainingHP, totalHP } from "./questData";

const ink = [31, 38, 51]; const coral = [231, 103, 72];

export function exportProjectPdf(workspace) {
  const doc = new jsPDF({ unit: "pt", format: "a4" }); const width = doc.internal.pageSize.getWidth(); const margin = 48; let y = 54;
  const line = (text, x = margin, size = 10, color = ink, weight = "normal") => { doc.setFont("helvetica", weight); doc.setFontSize(size); doc.setTextColor(...color); doc.text(String(text), x, y); y += size + 8; };
  const wrap = (text, x = margin, max = width - margin * 2, size = 9) => { doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...ink); const rows = doc.splitTextToSize(String(text), max); doc.text(rows, x, y); y += rows.length * (size + 4) + 7; };
  doc.setFillColor(...coral); doc.rect(0, 0, width, 12, "F"); line("QUESTBOARD", margin, 11, coral, "bold"); line(workspace.team?.name || "Team quest room", margin, 24, ink, "bold"); line(`Exported ${format(new Date(), "d MMM yyyy, HH:mm")}`, margin, 9, [100, 108, 120]); y += 10;
  for (const boss of workspace.bosses || []) {
    const shares = (workspace.shares || []).filter((share) => share.bossId === boss.id); const hp = remainingHP(workspace, boss.id); const maxHP = totalHP(workspace, boss.id);
    if (y > 690) { doc.addPage(); y = 54; }
    doc.setFillColor(247, 242, 233); doc.roundedRect(margin, y, width - margin * 2, 84, 12, 12, "F"); y += 24; line(boss.status === "active" ? "ACTIVE BOSS" : `BOSS ${boss.status.toUpperCase()}`, margin + 18, 9, [104, 98, 88], "bold"); line(boss.title, margin + 18, 15, ink, "bold"); line(`${hp}/${maxHP} HP remaining · deadline ${format(new Date(boss.deadline), "d MMM yyyy, HH:mm")}`, margin + 18, 9, coral, "bold"); y += 25;
    line("LOCKED PARTY SHARES", margin, 12, ink, "bold");
    for (const share of shares) {
      const member = workspace.team?.members?.find((item) => item.id === share.memberId); const verifier = workspace.team?.members?.find((item) => item.id === share.verifierId);
      doc.setDrawColor(225, 218, 205); doc.line(margin, y - 4, width - margin, y - 4); line(`${member?.name || "Member"} · ${share.weight} HP · ${share.status.toUpperCase()}`, margin, 10, ink, "bold"); wrap(`Verifier: ${verifier?.name || "—"}${share.pdfUrl ? ` · PDF: ${share.pdfUrl}` : ""}${share.verifierComment ? ` · Note: ${share.verifierComment}` : ""}`, margin, width - margin * 2, 9);
    }
  }
  y += 10; line("GOBLIN LOGS", margin, 12, ink, "bold");
  for (const log of workspace.goblinLogs || []) { if (y > 760) { doc.addPage(); y = 54; } const member = workspace.team?.members?.find((item) => item.id === log.memberId); line(`${format(new Date(log.loggedAt), "d MMM, HH:mm")} · ${member?.name || "Member"} slain a goblin`, margin, 9, ink); if (log.note) { y -= 4; line(log.note, margin + 18, 9, [100, 108, 120]); } }
  y += 10; line("ACTIVITY TRAIL", margin, 12, ink, "bold");
  for (const item of (workspace.activity || []).slice().sort((a, b) => a.timestamp - b.timestamp)) { if (y > 760) { doc.addPage(); y = 54; } const actor = workspace.team?.members?.find((member) => member.id === item.actorId); line(`${format(new Date(item.timestamp), "d MMM, HH:mm")} · ${actor?.name || "QuestBoard"} ${item.action}`, margin, 9, ink); if (item.detail) { y -= 4; line(item.detail, margin + 18, 9, [100, 108, 120]); } }
  doc.save(`${(workspace.team?.name || "questboard").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-summary.pdf`);
}
