import { Incident, CorrectiveAction } from "../../../backend/operations/src";

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

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function listIncidents(siteId: string) {
  return apiRequest<{ items: Incident[] }>(`/v1/operations/incidents?siteId=${encodeURIComponent(siteId)}`);
}

export async function listCorrectiveActions(siteId: string) {
  return apiRequest<{ items: CorrectiveAction[] }>(`/v1/operations/corrective-actions?siteId=${encodeURIComponent(siteId)}`);
}

export async function transitionIncident(incidentId: string, status: Incident["status"]) {
  return apiRequest<Incident>(`/v1/operations/incidents/${incidentId}/status`, {
    method: "POST",
    body: JSON.stringify({ status })
  });
}

export async function assignCorrectiveAction(actionId: string, ownerUserId: string) {
  return apiRequest<CorrectiveAction>(`/v1/operations/corrective-actions/${actionId}/assign`, {
    method: "POST",
    body: JSON.stringify({ ownerUserId })
  });
}

export async function completeCorrectiveAction(actionId: string) {
  return apiRequest<CorrectiveAction>(`/v1/operations/corrective-actions/${actionId}/complete`, {
    method: "POST"
  });
}
