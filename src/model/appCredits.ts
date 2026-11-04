// Conteúdo da tela Sobre o app: para que serve o app, a equipe e os créditos.

interface CreditItem {
  name: string;
  description: string;
}

interface CreditGroup {
  title: string;
  items: CreditItem[];
}

const APP_PURPOSE =
  'O Pet Buddies ajuda tutores e veterinários a cuidar do pet entre as consultas: plano de cuidado, check-in diário com dose calculada, agenda e prontuário em um só lugar.';

const APP_GROUP = {
  name: '3BugBuddies',
  course: 'Turma 2TDS Fevereiro · FIAP',
};

const APP_MEMBERS = [
  'Felipe Yuiti Ishii',
  'Gabriel Nogueira Peixoto',
  'Giovanna Neri dos Santos',
  'Mariana Inoue',
];

const APP_CREDITS: CreditGroup[] = [
  {
    title: 'Base do app',
    items: [
      { name: 'React Native', description: 'framework mobile' },
      { name: 'Expo', description: 'ferramentas de desenvolvimento e build' },
      { name: 'React', description: 'biblioteca de interface' },
      { name: 'TypeScript', description: 'tipagem estática' },
    ],
  },
  {
    title: 'Navegação e dados',
    items: [
      { name: 'React Navigation', description: 'abas e telas' },
      { name: 'TanStack Query', description: 'consultas e cache da API' },
      { name: 'Axios', description: 'chamadas HTTP' },
      { name: 'Yup', description: 'validação de formulários' },
    ],
  },
  {
    title: 'Recursos do aparelho',
    items: [
      { name: 'expo-secure-store', description: 'guarda a sessão com segurança' },
      { name: 'expo-notifications', description: 'lembretes de consulta' },
      { name: 'expo-audio', description: 'gravação de voz' },
      { name: 'expo-file-system', description: 'envio do áudio para transcrição' },
      { name: 'AsyncStorage', description: 'preferência de tema' },
      { name: 'expo-constants, expo-asset e expo-system-ui', description: 'dados do app, recursos e janela do sistema' },
    ],
  },
  {
    title: 'Interface',
    items: [
      { name: 'react-native-svg', description: 'gráficos vetoriais' },
      { name: 'react-native-screens e safe-area-context', description: 'telas nativas e áreas seguras' },
      { name: '@expo/vector-icons', description: 'ícones Ionicons, Material Community Icons e Feather' },
      { name: 'Sora e Inter', description: 'fontes, via Google Fonts (@expo-google-fonts)' },
      { name: 'Logos, mascote e ilustrações', description: 'identidade visual do Pet Buddies' },
    ],
  },
  {
    title: 'Serviços',
    items: [
      { name: 'API Java Spring', description: 'backend do Pet Buddies' },
      { name: 'Groq (Whisper)', description: 'transcrição de voz em texto' },
    ],
  },
];

export { CreditItem, CreditGroup, APP_PURPOSE, APP_GROUP, APP_MEMBERS, APP_CREDITS };
