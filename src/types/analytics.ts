export type AnalyticsTimeframe = "7d" | "14d" | "30d" | "90d";

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  sessions: number;
  signUps: number;
  conversionRate: number;
  engagementRate: number;
  rageClicks: number;
  deadClicks: number;
  errorRate: number;
}

export interface DailyTrendPoint {
  date: string;
  users: number;
  sessions: number;
  conversions: number;
}

export interface AcquisitionSource {
  name: string;
  users: number;
  percentage: number;
}

export interface CampaignMetrics {
  name: string;
  users: number;
  conversions: number;
  conversionRate: number;
}

export interface DeviceBreakdown {
  device: string;
  users: number;
  percentage: number;
}

export interface UserTypeRatio {
  newUsers: number;
  returningUsers: number;
}

export interface AcquisitionData {
  sources: AcquisitionSource[];
  campaigns: CampaignMetrics[];
  devices: DeviceBreakdown[];
  userTypes: UserTypeRatio;
}

export interface FunnelStep {
  stage: number;
  name: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  avgDurationSeconds: number;
}

export interface AiModelUsage {
  model: string;
  count: number;
}

export interface AiMetrics {
  totalOperations: number;
  successRate: number;
  failureCount: number;
  avgResponseTimeMs: number;
  plansGenerated: number;
  plansAccepted: number;
  plansEdited: number;
  modelBreakdown: AiModelUsage[];
}

export interface PopularPageMetric {
  page: string;
  views: number;
  exitRate: number;
}

export interface UxMetrics {
  rageClicks: number;
  deadClicks: number;
  excessiveScrolls: number;
  scriptErrors: number;
  avgEngagementSeconds: number;
  popularPages: PopularPageMetric[];
}

export interface UnifiedAnalyticsPayload {
  timeframe: AnalyticsTimeframe;
  lastUpdated: number;
  ga4Connected: boolean;
  clarityConnected: boolean;
  overview: OverviewMetrics;
  dailyTrends: DailyTrendPoint[];
  acquisition: AcquisitionData;
  funnel: FunnelStep[];
  ai: AiMetrics;
  ux: UxMetrics;
}
