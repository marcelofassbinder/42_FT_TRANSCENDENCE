// /frontend/src/game/remotePong/RemoteGame.ts (VERSÃO CORRIGIDA)

import { navigate } from "../../router";
import { createGameUI } from "../../components/localGameUi";
import { sendMessage } from "../../socketService";

// As interfaces e constantes estão PERFEITAS, não precisam de alterações.
interface PaddleState { id: string; x: number; y: number; }
interface GameState { ball: { x: number; y: number; }; p1: PaddleState; p2: PaddleState; scores: { p1: number; p2: number; }; }
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const gameState: GameState = { ball: { x: 0, y: 0 }, p1: { id: '', x: 0, y: 0 }, p2: { id: '', x: 0, y: 0 }, scores: { p1: 0, p2: 0 } };

// Variáveis de renderização
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let animationFrameId: number | null = null;
let paddleColor1 = 'white';
let paddleColor2 = 'white';

// As funções draw, gameLoop, handleKeyDown e handleKeyUp estão PERFEITAS, não precisam de alterações.
function draw() {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.lineWidth = 4;
    context.setLineDash([10, 10]);
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = paddleColor1;
    context.fillRect(gameState.p1.x, gameState.p1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.fillStyle = paddleColor2;
    context.fillRect(gameState.p2.x, gameState.p2.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(gameState.ball.x, gameState.ball.y, BALL_SIZE, 0, Math.PI * 2);
    context.fill();
    const p1ScoreEl = document.getElementById('game-player1-score');
    const p2ScoreEl = document.getElementById('game-player2-score');
    if (p1ScoreEl) p1ScoreEl.textContent = gameState.scores.p1.toString();
    if (p2ScoreEl) p2ScoreEl.textContent = gameState.scores.p2.toString();
}
function gameLoop() {
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}
const handleKeyDown = (e: KeyboardEvent) => {
    const validKeys = ['w', 's', 'ArrowUp', 'ArrowDown'];
    if (validKeys.includes(e.key)) {
        e.preventDefault();
        sendMessage({ type: 'playerMove', payload: { key: e.key, keyState: 'keydown' } });
    }
};
const handleKeyUp = (e: KeyboardEvent) => {
    const validKeys = ['w', 's', 'ArrowUp', 'ArrowDown'];
    if (validKeys.includes(e.key)) {
        e.preventDefault();
        sendMessage({ type: 'playerMove', payload: { key: e.key, keyState: 'keyup' } });
    }
};


// 🔥 MUDANÇA AQUI: Simplificamos a função initGame
/**
 * Inicializa a UI do jogo, aplicando estilos e configurações.
 * @param container O elemento HTML onde o jogo será renderizado.
 */
export function initGame(container: HTMLElement) {
    // Agora temos a certeza que 'gameSettings' existe!
    const settingsStr = sessionStorage.getItem('gameSettings');
    if (!settingsStr) {
        // Esta verificação agora é mais uma segurança, não deve falhar.
        console.error("CRITICAL: Definições do jogo não encontradas mesmo após a correção! A redirecionar...");
        navigate('./games'); 
        return;
    }
    const settings = JSON.parse(settingsStr);

    const gameUI = createGameUI();
    container.appendChild(gameUI);
    
    const scoreboard = gameUI.querySelector('.text-6xl');
    canvas = gameUI.querySelector('#game-canvas') as HTMLCanvasElement;
    const restartButton = gameUI.querySelector('#restart-button') as HTMLButtonElement;

    if (!canvas || !scoreboard || !restartButton) {
        console.error("Erro crítico: Um ou mais elementos da UI do jogo não foram encontrados.");
        return;
    }
    
    // Configura o placar com os aliases do nosso objeto de settings
    const p1AliasSpan = document.createElement('span');
    p1AliasSpan.className = 'text-4xl text-white font-orbitron px-4';
    p1AliasSpan.textContent = settings.p1_alias || 'Player 1';

    const p2AliasSpan = document.createElement('span');
    p2AliasSpan.className = 'text-4xl text-white font-orbitron px-4';
    p2AliasSpan.textContent = settings.p2_alias || 'Player 2';
    
    scoreboard.prepend(p1AliasSpan);
    scoreboard.append(p2AliasSpan);

    // Configura o canvas com as dimensões corretas do jogo remoto
    context = canvas.getContext('2d')!;
    canvas.width = 800;  // <<< Usar as mesmas constantes do backend
    canvas.height = 600; // <<< Usar as mesmas constantes do backend

    // Usa o background dos settings
    if (settings.background) {
        canvas.style.backgroundImage = `url(${settings.background})`;
        canvas.style.backgroundSize = 'cover';
        canvas.style.backgroundPosition = 'center';
    }
    
    // Guarda as cores dos paddles dos settings
    paddleColor1 = settings.p1_color;
    paddleColor2 = settings.p2_color;

    restartButton.onclick = () => navigate('./games'); 
}
// 🔥 FIM DA MUDANÇA

// As funções startGame, stopGame, updateGameState e showGameOver estão PERFEITAS.
export function startGame() {
    if (animationFrameId) return;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameLoop();
}
export function stopGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    console.log('Loop de renderização e listeners parados.');
}
export function updateGameState(newState: any) {
    if (!newState || !newState.ball || !newState.paddles || !newState.scores) {
        console.error("Recebido estado de jogo inválido:", newState);
        return;
    }
    gameState.ball = newState.ball;
    gameState.p1 = newState.paddles[0];
    gameState.p2 = newState.paddles[1];
    gameState.scores = newState.scores;
}
export function showGameOver(winnerName: string) {
    stopGame();
    const gameOverScreen = document.getElementById('game-over-screen');
    const winnerText = document.getElementById('winner-text');
    if (gameOverScreen && winnerText) {
        winnerText.textContent = `${winnerName} Venceu!`;
        gameOverScreen.classList.remove('hidden');
    }
}