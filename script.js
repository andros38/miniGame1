const gameBoard = document.getElementById('game-board');
const correctCountDisplay = document.getElementById('correct-count');
const wrongCountDisplay = document.getElementById('wrong-count');
const timerDisplay = document.getElementById('timer');
const notificationModal = document.getElementById('notification-modal');
const closeButton = document.querySelector('.close-button');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');
const backgroundMusic = document.getElementById('background-music');
const successSound = document.getElementById('success-sound');
const failureSound = document.getElementById('failure-sound');
const chanceMessage = document.getElementById('chance-message');
const notificationTitle = document.getElementById('notification-title');
const difficultySelect = document.getElementById('difficulty-select');

const cardImages = [
    'apple.png', 'banana.png', 'cherry.png', 'grape.png',
    'kiwi.png', 'lemon.png', 'mango.png', 'orange.png',
    'pear.png', 'peach.png', 'plum.png', 'strawberry.png'
];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;
let correctCount = 0;
let wrongCount = 0;
let timer;
let timeElapsed = 0;
let maxWrongAttempts = 10;
let difficulty = 'easy';

startButton.addEventListener('click', startGame);
difficultySelect.addEventListener('change', updateDifficulty);

function startGame() {
    resetGame();
    startButton.style.display = 'none';
    document.getElementById('game-title').style.display = 'none';
    document.getElementById('difficulty-container').style.display = 'none';
    difficultySelect.style.display = 'none';
    document.getElementById('scoreboard').style.display = 'block';
    gameBoard.style.display = 'grid';
    backgroundMusic.play();
    startTimer();
}

function startTimer() {
    timer = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = timeElapsed;
    }, 1000);
}

function createBoard() {
    const numPairs = getNumPairsForDifficulty(difficulty);
    const selectedImages = cardImages.slice(0, numPairs);
    const duplicatedImages = [...selectedImages, ...selectedImages];
    duplicatedImages.sort(() => Math.random() - 0.5);

    duplicatedImages.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;

        const frontFace = document.createElement('div');
        frontFace.classList.add('front-face');

        const backFace = document.createElement('div');
        backFace.classList.add('back-face');

        const img = document.createElement('img');
        img.src = `images/${image}`;
        img.alt = image;

        backFace.appendChild(img);
        card.appendChild(frontFace);
        card.appendChild(backFace);

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    const [firstCard, secondCard] = flippedCards;
    const isMatch = firstCard.dataset.image === secondCard.dataset.image;

    if (isMatch) {
        disableCards();
        correctCount++;
        correctCountDisplay.textContent = correctCount;
        playSound(successSound);
    } else {
        unflipCards();
        wrongCount++;
        wrongCountDisplay.textContent = wrongCount;
        playSound(failureSound);
        chanceMessage.textContent = `Kesempatan Tersisa: ${maxWrongAttempts - wrongCount}`;

        // Ubah warna teks menjadi merah jika mendekati batas
        if (maxWrongAttempts - wrongCount <= 3) {
            chanceMessage.style.color = 'red';
        }

        // Cek jika sudah mencapai batas kesalahan
        if (wrongCount >= maxWrongAttempts) {
            endGame(false);
        }
    }
}

function disableCards() {
    flippedCards.forEach(card => card.classList.add('matched'));
    matchedPairs++;

    if (matchedPairs === getNumPairsForDifficulty(difficulty)) {
        endGame(true);
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        flippedCards.forEach(card => card.classList.remove('flipped'));
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [flippedCards, lockBoard] = [[], false];
}

function endGame(success) {
    clearInterval(timer);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset musik
    showNotification(success);
    
    localStorage.setItem('highScore', Math.max(
        localStorage.getItem('highScore') || 0,
        correctCount
    ));
}

function showNotification(success) {
    document.getElementById('high-score').textContent = 
    localStorage.getItem('highScore') || 0;
    if (success) {
        document.getElementById('final-correct-count').textContent = correctCount;
        document.getElementById('final-wrong-count').textContent = wrongCount;
        document.getElementById('final-time').textContent = timeElapsed;
        notificationTitle.textContent = 'Permainan Berakhir!';
        notificationModal.style.display = 'block';
    } else {
        notificationTitle.textContent = 'Permainan Gagal!';
        document.getElementById('final-correct-count').textContent = correctCount;
        document.getElementById('final-wrong-count').textContent = wrongCount;
        document.getElementById('final-time').textContent = timeElapsed;
        notificationModal.style.display = 'block';
    }
}

closeButton.addEventListener('click', () => {
    notificationModal.style.display = 'none';
});

restartButton.addEventListener('click', resetGame);

function resetGame() {
    clearInterval(timer);
    matchedPairs = 0;
    correctCount = 0;
    wrongCount = 0;
    timeElapsed = 0;
    correctCountDisplay.textContent = correctCount;
    wrongCountDisplay.textContent = wrongCount;
    timerDisplay.textContent = timeElapsed;
    chanceMessage.textContent = '';
    chanceMessage.style.color = 'black';
    gameBoard.innerHTML = ''; // Kosongkan papan permainan
    createBoard(); // Buat ulang papan permainan
    startButton.style.display = 'block'; // Tampilkan tombol mulai
    difficultySelect.style.display = 'block'; // Tampilkan dropdown lagi
    document.getElementById('scoreboard').style.display = 'none'; // Sembunyikan scoreboard
    notificationModal.style.display = 'none'; // Sembunyikan modal
}

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }
}

function updateDifficulty() {
    difficulty = difficultySelect.value;
    maxWrongAttempts = difficulty === 'easy' ? 15 : 
                   difficulty === 'medium' ? 10 : 7;
    resetGame();
}

function getNumPairsForDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy': return 4;
        case 'medium': return 8;
        case 'hard': return 12;
        default: return 4;
    }
}

createBoard();

const muteButton = document.getElementById('mute-button');
let isMuted = false;

muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    backgroundMusic.muted = isMuted;
    muteButton.textContent = isMuted ? '🔇' : '🔊';
});
