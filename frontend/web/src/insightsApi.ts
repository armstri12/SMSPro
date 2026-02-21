export interface DashboardSummary {
  siteId: string;
  openActions: number;
  overdueItems: number;
  trainingCompletionRate: number;
  incidentRateTrend: { period: string; incidentCount: number }[];
  generatedAt: string;
}

async function apiRequest<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(path, {
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function getDashboardSummary(siteId: string) {
  return apiRequest<DashboardSummary>(`/v1/insights/dashboard/summary?siteId=${encodeURIComponent(siteId)}`);
}

export async function exportPhase1CompliancePack(siteId: string) {
  return apiRequest<{ id: string; status: string; resultUri?: string }>("/v1/insights/exports/pdf-pack", {
    method: "POST",
    body: JSON.stringify({ siteId })
  });
}
