import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/authContext';
import { getAllAppointments, getVetWindows } from '../repository/appointmentRepository';

export function useVetAgenda() {
  const { session } = useContext(AuthContext);
  const vetId = session?.perfil === 'VET' ? session.veterinarioId : null;
  const enabled = !!vetId;
  const appointments = useQuery({
    queryKey: ['agenda', 'consultas', vetId],
    queryFn: () => getAllAppointments(null, vetId),
    enabled,
    retry: false,
  });
  const windows = useQuery({
    queryKey: ['agenda', 'janelas', vetId],
    queryFn: () => getVetWindows(vetId!),
    enabled,
    retry: false,
  });
  return { appointments, windows };
}
