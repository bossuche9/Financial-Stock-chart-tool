const isRunninginCodespaces = () => {
    return window.location.hostname.includes('github.dev');
}

const API_URL = isRunninginCodespaces()
?'https://special-space-meme-4w675g6967rhjpxw-3000.app.github.dev/api'
: 'https://financial-stock-chart-tool.onrender.com/api';

export {API_URL};