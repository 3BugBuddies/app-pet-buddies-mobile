import { useMutation } from '@tanstack/react-query';
import { confirmCheckIn, getEscalationPreview } from '../repository/careRepository';
import type { CheckInInterpretation } from '../model/care';

export function useConfirmCheckIn() {
  return useMutation({
    mutationFn: (params: { interpretation: CheckInInterpretation }) => confirmCheckIn(params),
  });
}

export function useEscalationPreview() {
  return useMutation({
    mutationFn: () => getEscalationPreview(),
  });
}
