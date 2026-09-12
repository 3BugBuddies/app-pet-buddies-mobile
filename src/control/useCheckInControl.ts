import { useMutation } from '@tanstack/react-query';
import { confirmCheckIn, extractCheckIn, getEscalationPreview } from '../repository/careRepository';
import type { CheckInExtracaoRequest, CheckInRequest } from '../model/care';

export function useExtractCheckIn() {
  return useMutation({
    mutationFn: (data: CheckInExtracaoRequest) => extractCheckIn(data),
  });
}

export function useConfirmCheckIn() {
  return useMutation({
    mutationFn: (payload: CheckInRequest) => confirmCheckIn(payload),
  });
}

export function useEscalationPreview() {
  return useMutation({
    mutationFn: () => getEscalationPreview(),
  });
}
