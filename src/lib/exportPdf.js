import jsPDF from "jspdf";
import { format } from "date-fns";

const ink = [31, 38, 51];
const coral = [231, 103, 72];

export function exportProjectPdf(workspace) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 52;
  const line = (text, x = margin, size = 10, color = ink, weight = "normal") => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(text, x, y);
    y += size + 8;
  };
  const wrapped = (text, x = margin, width = pageWidth - margin * 2, size = 10) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...ink);
    const rows = doc.splitTextToSize(text, width); doc.text(rows, x, y); y += rows.length * (size + 4) + 8;
  };
  doc.setFillColor(...coral); doc.rect(0, 0, pageWidth, 12, "F");
  line("QUESTBOARD", margin, 11, coral, "bold");
  line(workspace.project?.name || "Project report", margin, 24, ink, "bold");
  line(`Team: ${workspace.team?.name || "—"}   ·   Exported ${format(new Date(), "d MMM yyyy, HH:mm")}`, margin, 9, [100, 108, 120]);
  y += 12;
  doc.setFillColor(247, 242, 233); doc.roundedRect(margin, y, pageWidth - margin * 2, 88, 12, 12, "F");
  y += 26; line("WEEKLY BOSS", margin + 18, 9, [104, 98, 88], "bold");
  line(workspace.boss?.title || "No boss created", margin + 18, 15, ink, "bold");
  line(workspace.boss ? `${workspace.boss.remainingHP}/${workspace.boss.totalScope} HP remaining · ${workspace.boss.status}` : "—", margin + 18, 10, coral, "bold");
  y += 30;
  line("GOBLIN OUTCOMES", margin, 12, ink, "bold");
  if (!workspace.goblins?.length) line("No goblins — the team used a single boss-fight submission.", margin, 10, [100, 108, 120]);
  for (const goblin of workspace.goblins || []) {
    const owner = workspace.team?.members?.find((m) => m.id === goblin.ownerId)?.name || "Unassigned";
    const verifier = workspace.team?.members?.find((m) => m.id === goblin.verifierId)?.name || "Unassigned";
    doc.setDrawColor(225, 218, 205); doc.line(margin, y - 4, pageWidth - margin, y - 4);
    line(`${goblin.title}  ·  ${goblin.status.toUpperCase()}  ·  ${goblin.weight} HP`, margin, 10, ink, "bold");
    wrapped(`Owner: ${owner}  ·  Verifier: ${verifier}${goblin.proofText ? `  ·  Proof: ${goblin.proofText}` : ""}`, margin, pageWidth - margin * 2, 9);
    if (goblin.verifierComment) wrapped(`Verifier note: ${goblin.verifierComment}`, margin, pageWidth - margin * 2, 9);
  }
  y += 10; line("ACTIVITY TRAIL", margin, 12, ink, "bold");
  for (const item of (workspace.activity || []).slice().sort((a, b) => a.timestamp - b.timestamp)) {
    if (y > 760) { doc.addPage(); y = 54; }
    const actor = workspace.team?.members?.find((m) => m.id === item.actorId)?.name || "QuestBoard";
    line(`${format(new Date(item.timestamp), "d MMM, HH:mm")}  ·  ${actor} ${item.action}`, margin, 9, ink, "normal");
    if (item.detail) { y -= 5; line(item.detail, margin + 18, 9, [100, 108, 120]); }
  }
  doc.save(`${(workspace.project?.name || "questboard-report").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
}
