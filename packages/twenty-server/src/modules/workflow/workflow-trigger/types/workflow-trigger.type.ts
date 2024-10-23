export enum WorkflowTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  MANUAL = 'MANUAL',
}

type BaseTrigger = {
  name: string;
  type: WorkflowTriggerType;
  input?: object;
};

export type WorkflowDatabaseEventTrigger = BaseTrigger & {
  type: WorkflowTriggerType.DATABASE_EVENT;
  settings: {
    eventName: string;
  };
};

export enum WorkflowManualTriggerAvailability {
  EVERYWHERE = 'EVERYWHERE',
  WHEN_RECORD_SELECTED = 'WHEN_RECORD_SELECTED',
}

export type WorkflowManualTrigger = BaseTrigger & {
  type: WorkflowTriggerType.MANUAL;
  settings:
    | {
        type: WorkflowManualTriggerAvailability.EVERYWHERE;
      }
    | {
        type: WorkflowManualTriggerAvailability.WHEN_RECORD_SELECTED;
        objectType: string;
      };
};

export type WorkflowTrigger =
  | WorkflowDatabaseEventTrigger
  | WorkflowManualTrigger;
