import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 64;
const TAB_BAR_GAP = 16;

// Distância da barra flutuante até a borda de baixo da tela.
export function useTabBarBottom(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, TAB_BAR_GAP) + TAB_BAR_GAP;
}

// Espaço que o conteúdo de uma aba reserva no fim para o último botão não ficar atrás da barra.
export function useTabBarSpace(): number {
  return useTabBarBottom() + TAB_BAR_HEIGHT + TAB_BAR_GAP;
}
