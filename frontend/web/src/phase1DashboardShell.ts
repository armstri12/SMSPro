export interface OperationsTableRow {
  type: "incident" | "corrective_action";
  title: string;
  owner?: string;
  status: string;
  dueDate?: string;
}

export interface Phase1DashboardViewModel {
  siteName: string;
  kpis: {
    openActions: number;
    overdueItems: number;
    trainingCompletionRate: number;
    incidentRate: number;
  };
  rows: OperationsTableRow[];
}

const statusColorMap: Record<string, string> = {
  reported: "#f59e0b",
  triaged: "#6366f1",
  investigating: "#2563eb",
  resolved: "#10b981",
  closed: "#4b5563",
  open: "#2563eb",
  in_progress: "#f59e0b",
  overdue: "#dc2626",
  completed: "#10b981"
};

export function renderPhase1DashboardShell(viewModel: Phase1DashboardViewModel): string {
  const cards = [
    ["Open Actions", String(viewModel.kpis.openActions)],
    ["Overdue", String(viewModel.kpis.overdueItems)],
    ["Training Completion", `${viewModel.kpis.trainingCompletionRate}%`],
    ["Incident Rate", `${viewModel.kpis.incidentRate}/mo`]
  ]
    .map(
      ([title, value]) =>
        `<article class="kpi-card"><h3>${title}</h3><p class="kpi-value">${value}</p></article>`
    )
    .join("");

  const rows = viewModel.rows
    .map((row) => {
      const dueDate = row.dueDate ?? "—";
      const overdueClass = row.dueDate && row.dueDate < new Date().toISOString().slice(0, 10) ? "due overdue" : "due";
      return `<tr>
<td>${row.type === "incident" ? "Incident" : "Action"}</td>
<td>${row.title}</td>
<td>${row.owner ?? "—"}</td>
<td><span class="status-chip" style="--status-color: ${statusColorMap[row.status] ?? "#6b7280"}">${row.status.replaceAll("_", " ")}</span></td>
<td><span class="${overdueClass}">${dueDate}</span></td>
</tr>`;
    })
    .join("");

  return `
<div class="dashboard-shell">
  <aside class="sidebar">
    <h2>SMSPro</h2>
    <nav>
      <a href="#" class="active">Operations</a>
      <a href="#">Programs</a>
      <a href="#">Obligations</a>
      <a href="#">Reports</a>
    </nav>
  </aside>
  <main>
    <header class="topbar">
      <h1>${viewModel.siteName} Compliance Dashboard</h1>
      <button>Export Phase 1 PDF Pack</button>
    </header>
    <section class="kpi-grid">${cards}</section>
    <section class="table-card">
      <h2>Operational Records</h2>
      <table>
        <thead><tr><th>Type</th><th>Title</th><th>Owner</th><th>Status</th><th>Due Date</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  </main>
</div>`;
}

export const phase1DashboardStyles = `
.dashboard-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; background: #f3f4f6; color: #111827; font-family: Inter, sans-serif; }
.sidebar { background: #111827; color: #f9fafb; padding: 24px; }
.sidebar nav { display: grid; gap: 12px; margin-top: 24px; }
.sidebar a { color: #d1d5db; text-decoration: none; }
.sidebar a.active { color: #fff; font-weight: 700; }
main { padding: 24px; display: grid; gap: 20px; }
.topbar { display: flex; justify-content: space-between; align-items: center; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 16px; }
.kpi-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.kpi-value { font-size: 1.8rem; font-weight: 700; margin: 6px 0 0; }
.table-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 10px 8px; }
.status-chip { background: color-mix(in srgb, var(--status-color), #ffffff 80%); color: var(--status-color); padding: 3px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; text-transform: capitalize; }
.due.overdue { color: #dc2626; font-weight: 700; }
`;
