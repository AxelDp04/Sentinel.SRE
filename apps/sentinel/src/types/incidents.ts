export type IncidentStatus = 'investigating' | 'resolved' | 'failed';

export interface Incident {
  id: string;
  service_name: string;
  error_payload: any;
  ai_diagnosis?: string;
  action_taken?: string;
  status: IncidentStatus;
  created_at: string;
}

export type HealingAction = 'RETRY' | 'REDEPLOY' | 'MANUAL_INTERVENTION' | 'NO_ACTION';
