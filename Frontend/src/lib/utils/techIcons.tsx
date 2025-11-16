export const getTechIcon = (tech: string) => {
  const techLower = tech.toLowerCase();
  
  const icons: Record<string, string> = {
    react: '⚛️',
    javascript: '🟨',
    typescript: '🔷',
    python: '🐍',
    java: '☕',
    nodejs: '🟢',
    docker: '🐳',
    kubernetes: '☸️',
    aws: '☁️',
    mongodb: '🍃',
    postgresql: '🐘',
    mysql: '🐬',
    redis: '🔴',
    git: '📦',
    github: '🐙',
    vue: '💚',
    angular: '🅰️',
    spring: '🍃',
    django: '🎸',
    flask: '🧪',
    express: '🚂',
    nextjs: '▲',
    tailwind: '🎨',
    graphql: '🔺',
    rest: '🔌',
  };
  
  for (const [key, icon] of Object.entries(icons)) {
    if (techLower.includes(key)) return icon;
  }
  
  return '💻';
};
