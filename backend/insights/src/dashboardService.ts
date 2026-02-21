import { randomUUID } from "crypto";
import { OperationsService } from "../../operations/src";

export interface IncidentRatePoint {
  period: string;
  incidentCount: number;
}

export interface DashboardSummary {
  siteId: string;
  openActions: number;
  overdueItems: number;
  trainingCompletionRate: number;
  incidentRateTrend: IncidentRatePoint[];
  generatedAt: string;
}

export interface CompliancePackExportJob {
  id: string;
  siteId: string;
  format: "pdf";
  status: "queued" | "completed";
  createdAt: string;
  completedAt?: string;
  resultUri?: string;
}

export class DashboardService {
  private readonly exportJobs = new Map<string, CompliancePackExportJob>();

  constructor(private readonly operationsService: OperationsService) {}

  getSummary(siteId: string): DashboardSummary {
    const incidents = this.operationsService.listIncidents(siteId);
    const actions = this.operationsService.listCorrectiveActions(siteId);

    const openActions = actions.filter((item) => item.status !== "completed").length;
    const overdueItems = actions.filter((item) => item.status === "overdue").length;

    return {
      siteId,
      openActions,
      overdueItems,
      trainingCompletionRate: 0,
      incidentRateTrend: this.buildIncidentTrend(incidents.map((item) => item.eventAt)),
      generatedAt: new Date().toISOString()
    };
  }

  exportCompliancePackPdf(siteId: string): CompliancePackExportJob {
    const now = new Date().toISOString();
    const job: CompliancePackExportJob = {
      id: randomUUID(),
      siteId,
      format: "pdf",
      status: "queued",
      createdAt: now
    };

    this.exportJobs.set(job.id, job);

    const completedJob: CompliancePackExportJob = {
      ...job,
      status: "completed",
      completedAt: new Date().toISOString(),
      resultUri: `s3://smspro/exports/${siteId}/${job.id}.pdf`
    };

    this.exportJobs.set(job.id, completedJob);
    return completedJob;
  }

  getExportJob(jobId: string): CompliancePackExportJob {
    const job = this.exportJobs.get(jobId);
    if (!job) {
      throw new Error(`Export job ${jobId} not found.`);
    }
    return job;
  }

  private buildIncidentTrend(eventDates: string[]): IncidentRatePoint[] {
    const now = new Date();
    const points: IncidentRatePoint[] = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const periodDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
      const period = periodDate.toISOString().slice(0, 7);
      const incidentCount = eventDates.filter((eventDate) => eventDate.startsWith(period)).length;
      points.push({ period, incidentCount });
    }

    return points;
  }
}
