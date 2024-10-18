import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import { generateWorkflowDiagram } from '@/workflow/utils/generateWorkflowDiagram';
import { isDefined } from 'twenty-ui';

const EMPTY_DIAGRAM: WorkflowDiagram = {
  nodes: [],
  edges: [],
};

export const getWorkflowVersionDiagram = (
  workflowVersion: WorkflowVersion | undefined,
  serverlessFunctionsData: ReturnType<
    typeof useGetManyServerlessFunctions
  >['serverlessFunctions'],
): WorkflowDiagram => {
  if (!isDefined(workflowVersion)) {
    return EMPTY_DIAGRAM;
  }

  return generateWorkflowDiagram({
    trigger: workflowVersion.trigger ?? undefined,
    steps: workflowVersion.steps ?? [],
    serverlessFunctionsData,
  });
};
