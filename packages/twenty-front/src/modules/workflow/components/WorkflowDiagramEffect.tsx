import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';

import { addCreateStepNodes } from '@/workflow/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/utils/getWorkflowVersionDiagram';
import { mergeWorkflowDiagrams } from '@/workflow/utils/mergeWorkflowDiagrams';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowDiagramEffect = ({
  workflowWithCurrentVersion,
}: {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
}) => {
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  const { serverlessFunctions } = useGetManyServerlessFunctions();

  const computeAndMergeNewWorkflowDiagram = useRecoilCallback(
    ({ snapshot, set }) => {
      return (currentVersion: WorkflowVersion) => {
        if (!isDefined(serverlessFunctions)) {
          return;
        }

        const previousWorkflowDiagram = getSnapshotValue(
          snapshot,
          workflowDiagramState,
        );

        const nextWorkflowDiagram = getWorkflowVersionDiagram(
          currentVersion,
          serverlessFunctions,
        );

        let mergedWorkflowDiagram = nextWorkflowDiagram;
        if (isDefined(previousWorkflowDiagram)) {
          mergedWorkflowDiagram = mergeWorkflowDiagrams(
            previousWorkflowDiagram,
            nextWorkflowDiagram,
          );
        }

        const workflowDiagramWithCreateStepNodes = addCreateStepNodes(
          mergedWorkflowDiagram,
        );

        set(workflowDiagramState, workflowDiagramWithCreateStepNodes);
      };
    },
    [serverlessFunctions],
  );

  useEffect(() => {
    const currentVersion = workflowWithCurrentVersion?.currentVersion;
    if (!isDefined(currentVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    computeAndMergeNewWorkflowDiagram(currentVersion);
  }, [
    computeAndMergeNewWorkflowDiagram,
    setWorkflowDiagram,
    workflowWithCurrentVersion?.currentVersion,
  ]);

  return null;
};
