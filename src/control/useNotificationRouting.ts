import { useEffect, useRef } from 'react';
import { DEFAULT_ACTION_IDENTIFIER } from 'expo-notifications/build/NotificationsEmitter';
import { useLastNotificationResponse } from 'expo-notifications/build/useLastNotificationResponse';
import { parseNotificationDestination, type NotificationDestination } from '../model/notification';

// Leva o usuário à tela certa quando ele toca na notificação, com o app aberto, em segundo plano
// ou fechado. `enabled` segura o toque até a navegação estar pronta e o perfil certo logado.
export function useNotificationRouting(enabled: boolean, onOpen: (destino: NotificationDestination) => void) {
  const response = useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !response) return;
    if (response.actionIdentifier !== DEFAULT_ACTION_IDENTIFIER) return;

    const { identifier, content } = response.notification.request;
    // O lembrete tem identificador fixo; a data da notificação diferencia dois toques no mesmo lembrete.
    const key = `${identifier}@${response.notification.date}`;
    if (handled.current === key) return;

    const destino = parseNotificationDestination(content.data);
    if (!destino) return;

    handled.current = key;
    onOpen(destino);
  }, [enabled, response, onOpen]);
}
