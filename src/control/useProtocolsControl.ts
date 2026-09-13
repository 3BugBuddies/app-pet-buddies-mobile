import { useQuery } from '@tanstack/react-query';
import { getProtocols } from '../repository/protocolRepository';

export function useProtocols() {
  return useQuery({
    queryKey: ['protocols'],
    queryFn: getProtocols,
  });
}
