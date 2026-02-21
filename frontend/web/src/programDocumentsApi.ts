export interface GenerateProgramDocumentsRequest {
  siteId: string;
  obligationIds: string[];
  programKeys?: string[];
}

export interface ProgramDocumentRevisionDecision {
  approvalStepId: string;
  approverUserId: string;
  decision: "approved" | "rejected";
  comments?: string;
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

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function generateProgramDocuments(request: GenerateProgramDocumentsRequest) {
  return apiRequest<{ jobId: string; status: string }>("/v1/programs/generate", {
    method: "POST",
    body: JSON.stringify(request)
  });
}

export async function regenerateProgramDocument(documentId: string) {
  return apiRequest<{ revisionId: string; status: string }>(`/v1/programs/documents/${documentId}/regenerate`, {
    method: "POST"
  });
}

export async function submitProgramRevisionForReview(programRevisionId: string, approverUserIds: string[]) {
  return apiRequest<{ approvalSteps: { id: string; status: string }[] }>(
    `/v1/programs/revisions/${programRevisionId}/review`,
    {
      method: "POST",
      body: JSON.stringify({ approverUserIds })
    }
  );
}

export async function decideProgramRevisionApproval(revisionId: string, request: ProgramDocumentRevisionDecision) {
  return apiRequest<{ revisionId: string; status: string }>(`/v1/programs/revisions/${revisionId}/approve`, {
    method: "POST",
    body: JSON.stringify(request)
  });
}

export async function exportProgramPdfPack(siteId: string) {
  return apiRequest<{ jobId: string; status: string; format: "pdf" }>("/v1/programs/exports/pdf-pack", {
    method: "POST",
    body: JSON.stringify({ siteId })
  });
}
