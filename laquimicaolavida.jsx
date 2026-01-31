import React, { useState } from 'react';

const CATEGORIES = [
  { id: 'alcanos', label: 'Alcanos', emoji: '⛓️' },
  { id: 'alquenos', label: 'Alquenos', emoji: '🔗' },
  { id: 'alquinos', label: 'Alquinos', emoji: '≡' },
  { id: 'alcoholes', label: 'Alcoholes', emoji: '🍷' },
  { id: 'eteres', label: 'Éteres', emoji: '🔬' },
  { id: 'aldehidos', label: 'Aldehídos', emoji: '🧪' },
  { id: 'cetonas', label: 'Cetonas', emoji: '⚗️' },
  { id: 'acidos', label: 'Ácidos', emoji: '🧬' },
  { id: 'esteres', label: 'Ésteres', emoji: '💧' },
  { id: 'aminas', label: 'Aminas', emoji: '🔋' },
  { id: 'aromaticos', label: 'Aromáticos', emoji: '⬡' },
  { id: 'ciclicos', label: 'Cíclicos', emoji: '⭕' }
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_COUNTS = [5, 10, 15, 20];

export default function TriviaGame() {
  const [screen, setScreen] = useState('splash'); // splash, register, admin, setup, loading, playing, results, theory
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [users, setUsers] = useState([]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [totalPoints, setTotalPoints] = useState(0);
  const [questionPoints, setQuestionPoints] = useState([]);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Audio refs
  const correctSound = React.useRef(null);
  const wrongSound = React.useRef(null);
  const gameOverSound = React.useRef(null);

  // Initialize audio
  React.useEffect(() => {
    // Create audio elements
    correctSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTcIGWi77eeeTRAMUKfj8LZjHAY4ktfz');
    wrongSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB/fn59fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAf35/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err');
    gameOverSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTcIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUsAdnyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUsAA==');
  }, []);

  const playCorrectSound = () => {
    if (correctSound.current) {
      correctSound.current.currentTime = 0;
      correctSound.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const playWrongSound = () => {
    if (wrongSound.current) {
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const playGameOverSound = () => {
    if (gameOverSound.current) {
      gameOverSound.current.currentTime = 0;
      gameOverSound.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  React.useEffect(() => {
    if (screen === 'playing' && !showFeedback && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && screen === 'playing' && !showFeedback) {
      handleTimeUp();
    }
  }, [timeLeft, screen, showFeedback]);

  const handleTimeUp = () => {
    playWrongSound();
    setShowFeedback(true);
    setAnswers([...answers, false]);
    setQuestionPoints([...questionPoints, 0]);
    
    const newLives = lives - 1;
    setLives(newLives);
    
    setTimeout(() => {
      if (newLives <= 0) {
        playGameOverSound();
        setGameOver(true);
        saveGameResult();
        setScreen('results');
      } else if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(20);
      } else {
        setScreen('results');
      }
    }, 1500);
  };

  const calculatePoints = (timeRemaining, difficulty) => {
    const basePoints = {
      'easy': 5,
      'medium': 10,
      'hard': 15
    };
    
    return basePoints[difficulty] || 10;
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await window.storage.get('chemistry-users');
      if (result && result.value) {
        setUsers(JSON.parse(result.value));
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.log('No users loaded yet or storage error:', error);
      setUsers([]);
    }
  };

  const saveUsers = async (updatedUsers) => {
    try {
      await window.storage.set('chemistry-users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      alert('Si us plau, introdueix un email');
      return;
    }

    try {
      let currentUsers = [];
      
      try {
        const result = await window.storage.get('chemistry-users');
        if (result && result.value) {
          currentUsers = JSON.parse(result.value);
          setUsers(currentUsers);
        }
      } catch (storageError) {
        console.log('No existing users or storage error:', storageError);
        currentUsers = [];
        setUsers([]);
      }

      const existingUser = currentUsers.find(u => u.email === email.trim().toLowerCase());

      if (existingUser) {
        setCurrentUser(existingUser);
        setNickname(existingUser.nickname);
        setIsNewUser(false);
        setScreen('setup');
      } else {
        if (!nickname.trim()) {
          setIsNewUser(true);
          return;
        }
        
        const newUser = {
          email: email.trim().toLowerCase(),
          nickname: nickname.trim(),
          registeredAt: new Date().toISOString(),
          gamesPlayed: 0,
          maxScore: 0,
          games: []
        };
        
        const updatedUsers = [...currentUsers, newUser];
        
        try {
          await window.storage.set('chemistry-users', JSON.stringify(updatedUsers));
        } catch (saveError) {
          console.error('Error saving to storage:', saveError);
        }
        
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        setIsNewUser(false);
        setScreen('setup');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error al iniciar sessió. Continuarem sense guardar dades.');
      
      const tempUser = {
        email: email.trim().toLowerCase(),
        nickname: nickname.trim() || 'Jugador',
        registeredAt: new Date().toISOString(),
        gamesPlayed: 0,
        maxScore: 0,
        games: []
      };
      setCurrentUser(tempUser);
      setScreen('setup');
    }
  };

  const handleAdminLogin = async () => {
    if (adminCode === 'p.fenollosaalcaina@edu.gva.es') {
      await loadUsers();
      setScreen('admin');
    } else {
      alert('Codi d\'administrador incorrecte');
    }
  };

  const generateQuestions = async () => {
    setScreen('loading');
    
    const categoryNames = selectedCategories.map(id => 
      CATEGORIES.find(c => c.id === id)?.label
    ).join(', ');
    
    const difficultyText = difficulty === 'easy' ? 'fàcil' : difficulty === 'medium' ? 'mitjà' : 'difícil';
    
    const prompt = `Genera exactament ${questionCount} preguntes tipus test sobre FORMULACIÓ I NOMENCLATURA de química orgànica. Les preguntes han de cobrir aquestes categories: ${categoryNames}.

IMPORTANT: Les preguntes han de centrar-se EXCLUSIVAMENT en:

1. NOMENCLATURA IUPAC:
   - Donar la fórmula, demanar el nom IUPAC correcte
   - Identificar errors en noms proposats
   - Comparar diferents opcions de nomenclatura

2. FORMULACIÓ:
   - Donar el nom IUPAC, demanar la fórmula correcta
   - Identificar la fórmula desenvolupada o semidesenvoluopada
   - Reconèixer la fórmula molecular correcta

3. GRUPS FUNCIONALS:
   - Identificar el grup funcional d'una fórmula donada
   - Reconèixer la posició correcta del grup funcional
   - Diferenciar entre isòmers funcionals

4. NUMERACIÓ I POSICIÓ:
   - Determinar la numeració correcta de la cadena principal
   - Identificar la posició dels substituents
   - Aplicar les regles de preferència en la numeració

EXEMPLES DE PREGUNTES ADEQUADES:
✓ "Quin és el nom IUPAC del compost CH₃-CH₂-CH₂-OH?"
✓ "Quina és la fórmula desenvolupada del 2-metilbutà?"
✓ "Identifica el compost que correspon a: àcid propanoic"
✓ "Quin dels següents noms és correcte per a CH₃-CH(CH₃)-CH₂-CH₃?"
✓ "La fórmula CH₃-CO-CH₃ correspon a:"
✓ "Com es numera correctament la cadena en el 3-metil-1-hexè?"

EXEMPLES DE PREGUNTES NO ADEQUADES (NO fer):
✗ Preguntes sobre reactivitat química
✗ Preguntes sobre mecanismes de reacció
✗ Preguntes sobre propietats físiques
✗ Preguntes sobre acidesa o basicitat
✗ Preguntes sobre solubilitat o punts d'ebullició

Nivell de dificultat: ${difficultyText}
- Fàcil: Compostos lineals simples (C1-C5) amb un sol grup funcional. Nomenclatura directa.
  Exemple: CH₃-CH₂-OH (etanol), CH₄ (metà)
  
- Mitjà: Cadenes ramificades (C5-C8) amb múltiples substituents. Aplicació de regles de numeració.
  Exemple: 2,3-dimetilpentà, 3-metil-2-butanol
  
- Difícil: Compostos complexos amb múltiples grups funcionals, cicles i cadenes llargues (C8+). Prioritats entre grups.
  Exemple: àcid 3-hidroxi-2-metilhexanoic, ciclopentà amb substituents

MOLT IMPORTANT: Respon NOMÉS amb un objecte JSON vàlid, sense cap text addicional abans o després. El format exacte ha de ser:

{
  "questions": [
    {
      "category": "Nom de la categoria",
      "question": "Text de la pregunta sobre formulació o nomenclatura",
      "options": ["Opció A", "Opció B", "Opció C", "Opció D"],
      "correctIndex": 0,
      "explanation": "Explicació de les regles de nomenclatura o formulació aplicades"
    }
  ]
}

Assegura't que:
1. TOTES les preguntes siguin sobre formulació o nomenclatura
2. Cada pregunta tingui exactament 4 opcions plausibles
3. Les opcions incorrectes siguin errors comuns de nomenclatura
4. correctIndex sigui un número entre 0 i 3
5. L'explicació ensenyi les regles IUPAC aplicades
6. Utilitza fórmules químiques amb subíndexs correctes (₁ ₂ ₃ ₄ etc.)`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            { role: "user", content: prompt }
          ],
        })
      });

      const data = await response.json();
      const textContent = data.content.find(item => item.type === "text")?.text || "";
      
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : textContent;
      
      const result = JSON.parse(jsonText);
      
      if (result.questions && Array.isArray(result.questions)) {
        setQuestions(result.questions);
        setCurrentQuestion(0);
        setAnswers([]);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(20);
        setTotalPoints(0);
        setQuestionPoints([]);
        setLives(3);
        setGameOver(false);
        setScreen('playing');
      } else {
        throw new Error('Format de resposta invàlid');
      }
    } catch (error) {
      console.error('Error generant preguntes:', error);
      alert('Error generant les preguntes. Si us plau, torna-ho a provar.');
      setScreen('setup');
    }
  };

  const handleAnswerSelect = (index) => {
    if (!showFeedback) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctIndex;
    const points = isCorrect ? calculatePoints(timeLeft, difficulty) : 0;
    
    // Play sound
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
    
    setShowFeedback(true);
    setAnswers([...answers, isCorrect]);
    setQuestionPoints([...questionPoints, points]);
    setTotalPoints(totalPoints + points);
    
    // Reduce lives if wrong answer
    let newLives = lives;
    if (!isCorrect) {
      newLives = lives - 1;
      setLives(newLives);
    }
    
    setTimeout(() => {
      if (!isCorrect && newLives <= 0) {
        playGameOverSound();
        setGameOver(true);
        saveGameResult();
        setScreen('results');
      } else if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(20);
      } else {
        saveGameResult();
        setScreen('results');
      }
    }, 2000);
  };

  const saveGameResult = async () => {
    if (!currentUser) return;
    
    try {
      const result = await window.storage.get('chemistry-users');
      let currentUsers = result && result.value ? JSON.parse(result.value) : [];
      
      const userIndex = currentUsers.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        const gameResult = {
          date: new Date().toISOString(),
          score: totalPoints,
          correctAnswers: answers.filter(Boolean).length,
          totalQuestions: questions.length,
          categories: selectedCategories,
          difficulty: difficulty
        };
        
        currentUsers[userIndex].gamesPlayed = (currentUsers[userIndex].gamesPlayed || 0) + 1;
        currentUsers[userIndex].maxScore = Math.max(currentUsers[userIndex].maxScore || 0, totalPoints);
        currentUsers[userIndex].games = [...(currentUsers[userIndex].games || []), gameResult];
        
        await saveUsers(currentUsers);
      }
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  };

  const restart = () => {
    setScreen('setup');
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(20);
    setTotalPoints(0);
    setQuestionPoints([]);
    setLives(3);
    setGameOver(false);
  };

  const deleteUser = async (email) => {
    if (confirm(`Segur que vols eliminar l'usuari ${email}?`)) {
      const updatedUsers = users.filter(u => u.email !== email);
      await saveUsers(updatedUsers);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chemistry-trivia-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: #000000;
          font-family: 'VT323', monospace;
          overflow-x: hidden;
        }
        
        .game-title {
          font-family: 'VT323', monospace;
          text-transform: uppercase;
          letter-spacing: 4px;
        }
        
        .game-text {
          font-family: 'VT323', monospace;
          color: #00ff41;
        }
        
        .text-green {
          color: #00ff41;
        }
        
        .bg-black {
          background: #000000;
        }
        
        .border-green {
          border: 3px solid #00ff41;
        }
        
        .shadow-green {
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
        }
        
        .glow-green {
          text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41;
          animation: glow 2s ease-in-out infinite;
        }
        
        .glow-yellow {
          text-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 30px #ffd700;
        }
        
        .text-yellow-400 {
          color: #ffd700;
        }
        
        .text-red-500 {
          color: #ff0000;
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41; }
          50% { text-shadow: 0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41; }
        }
        
        .btn {
          background: #001a00;
          border: 2px solid #00ff41;
          color: #00ff41;
          padding: 12px 24px;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          font-size: 18px;
          letter-spacing: 2px;
        }
        
        .btn:hover:not(:disabled) {
          background: #003300;
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
          transform: translateY(-2px);
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background: #00ff41;
          color: #000000;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #00cc33;
        }
        
        .btn-secondary.selected {
          background: #00ff41;
          color: #000000;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.8);
        }
        
        .option-btn {
          background: #001a00;
          border: 2px solid #00ff41;
          padding: 20px;
          text-align: left;
          font-size: 20px;
          transition: all 0.3s;
        }
        
        .option-btn:hover:not(:disabled) {
          background: #003300;
          transform: translateX(10px);
        }
        
        .option-btn.selected {
          background: #004400;
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
        }
        
        .option-btn.correct {
          background: #00ff41;
          color: #000000;
          border-color: #00ff41;
          animation: pulse-correct 0.5s;
        }
        
        .option-btn.incorrect {
          background: #ff0000;
          color: #ffffff;
          border-color: #ff0000;
          animation: shake 0.5s;
        }
        
        @keyframes pulse-correct {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .spinner {
          border: 4px solid #001a00;
          border-top: 4px solid #00ff41;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scanline {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 255, 65, 0.02) 51%
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 1000;
          animation: scanline 8s linear infinite;
        }
        
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        
        input {
          background: #001a00;
          border: 2px solid #00ff41;
          color: #00ff41;
          padding: 12px;
          font-family: 'VT323', monospace;
          font-size: 18px;
          width: 100%;
        }
        
        input:focus {
          outline: none;
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
        }
        
        input::placeholder {
          color: #00803f;
        }
      `}</style>
      
      <div className="scanline"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {screen === 'splash' && (
          <div className="fade-in-up text-center min-h-screen flex flex-col justify-center">
            <h1 className="game-title text-7xl md:text-9xl mb-8 glow-green">
              QUÍMICA
              <br />
              TRIVIA
            </h1>
            <h2 className="game-title text-3xl md:text-4xl mb-4 text-green">
              LA QUÍMICA O LA VIDA
            </h2>
            <p className="game-text text-lg md:text-xl mb-2 opacity-70">
              IES Districte Marítim
            </p>
            <p className="game-text text-md md:text-lg mb-12 opacity-60">
              Departament de Física i Química
            </p>
            <p className="game-text text-xl md:text-2xl mb-12 opacity-80">
              PREPARA'T PER POSAR A PROVA ELS TEUS CONEIXEMENTS
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setScreen('register')}
                className="btn btn-primary game-text w-full md:w-auto md:px-16 py-6 text-2xl rounded-none"
              >
                COMENÇAR
              </button>
              <button
                onClick={() => setScreen('theory')}
                className="btn btn-secondary game-text w-full md:w-auto md:px-16 py-4 text-lg rounded-none"
              >
                📚 VIATGE PER LA TEORIA
              </button>
              <button
                onClick={() => setShowAdminLogin(true)}
                className="btn btn-secondary game-text w-full md:w-auto md:px-16 py-4 text-lg rounded-none"
              >
                ADMINISTRADOR
              </button>
            </div>
            
            {/* Leaderboard / Ranking */}
            {users.length > 0 && (
              <div className="mt-12 bg-black border-green shadow-green p-6 max-w-2xl mx-auto">
                <h3 className="game-title text-3xl mb-6 text-green glow-green text-center">
                  🏆 RÀNQUING GLOBAL 🏆
                </h3>
                <div className="space-y-3">
                  {users
                    .filter(u => u.maxScore > 0)
                    .sort((a, b) => b.maxScore - a.maxScore)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div 
                        key={user.email} 
                        className="flex items-center justify-between border-2 border-green p-3 bg-black"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`game-text text-2xl ${
                            index === 0 ? 'text-yellow-400 glow-yellow' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-400' :
                            'text-green'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                          </span>
                          <span className="game-text text-xl">{user.nickname}</span>
                        </div>
                        <div className="text-right">
                          <div className="game-text text-2xl text-green glow-green">
                            {user.maxScore}
                          </div>
                          <div className="game-text text-sm opacity-70">
                            {user.gamesPlayed} partides
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {users.filter(u => u.maxScore > 0).length === 0 && (
                  <p className="game-text text-center text-green opacity-70">
                    Encara no hi ha puntuacions registrades
                  </p>
                )}
              </div>
            )}
            
            {showAdminLogin && (
              <div className="mt-8 bg-black border-green shadow-green p-6 max-w-md mx-auto">
                <h3 className="game-text text-xl mb-4">ACCÉS ADMINISTRADOR</h3>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Codi d'administrador"
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAdminLogin}
                    className="btn btn-primary game-text flex-1 py-3"
                  >
                    ENTRAR
                  </button>
                  <button
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminCode('');
                    }}
                    className="btn btn-secondary game-text flex-1 py-3"
                  >
                    CANCEL·LAR
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {screen === 'register' && (
          <div className="fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setScreen('splash')}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                ← TORNAR
              </button>
              <button
                onClick={() => {
                  setScreen('splash');
                  setEmail('');
                  setNickname('');
                  setIsNewUser(false);
                }}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                MENÚ PRINCIPAL
              </button>
            </div>
            
            <div className="bg-black border-green shadow-green p-8 mb-8">
              <h2 className="game-title text-4xl text-green mb-8 glow-green text-center">
                IDENTIFICACIÓ
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="game-text text-lg mb-2 block">EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="el.teu@email.com"
                    className="rounded-none"
                  />
                </div>
                
                {isNewUser && (
                  <div className="fade-in-up">
                    <label className="game-text text-lg mb-2 block">ÀLIES / NOM</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="El teu àlies"
                      className="rounded-none"
                    />
                    <p className="game-text text-sm mt-2 opacity-70">
                      Nou usuari detectat! Tria un àlies.
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleLogin}
                  className="btn btn-primary game-text w-full py-6 text-2xl rounded-none uppercase"
                >
                  {isNewUser ? 'REGISTRAR-SE' : 'CONTINUAR'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {screen === 'admin' && (
          <div className="fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setScreen('splash')}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                ← SORTIR
              </button>
              <button
                onClick={() => {
                  setScreen('splash');
                  setAdminCode('');
                }}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                MENÚ PRINCIPAL
              </button>
            </div>
            
            <div className="bg-black border-green shadow-green p-8 mb-8">
              <h2 className="game-title text-4xl text-green mb-8 glow-green text-center">
                PANEL ADMINISTRADOR
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="game-text text-2xl">USUARIS REGISTRATS: {users.length}</h3>
                  <button
                    onClick={exportData}
                    className="btn btn-primary game-text py-2 px-4 rounded-none text-sm"
                  >
                    EXPORTAR DADES
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map((user, index) => (
                  <div key={index} className="border-green border-2 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="game-text text-xl">{user.nickname}</div>
                        <div className="game-text text-sm opacity-70">{user.email}</div>
                      </div>
                      <button
                        onClick={() => deleteUser(user.email)}
                        className="btn btn-secondary game-text py-1 px-3 text-sm"
                      >
                        ELIMINAR
                      </button>
                    </div>
                    <div className="game-text text-sm">
                      <div>Partides jugades: {user.gamesPlayed || 0}</div>
                      <div>Puntuació màxima: {user.maxScore || 0}</div>
                      <div>Registrat: {new Date(user.registeredAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {screen === 'setup' && (
          <div className="fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => {
                  setScreen('register');
                  setCurrentUser(null);
                }}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                ← CANVIAR USUARI
              </button>
              <button
                onClick={() => {
                  if (confirm('Tornar al menú principal?')) {
                    setScreen('splash');
                    setCurrentUser(null);
                    setSelectedCategories([]);
                    setDifficulty('medium');
                    setQuestionCount(10);
                  }
                }}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                MENÚ PRINCIPAL
              </button>
            </div>
            
            {currentUser && (
              <div className="bg-black border-green p-4 mb-6 text-center">
                <span className="game-text text-xl">
                  Benvingut/da, <span className="glow-green">{currentUser.nickname}</span>!
                </span>
              </div>
            )}
            
            <div className="bg-black border-green shadow-green p-8 mb-8">
              <h2 className="game-text text-2xl text-green mb-6">CATEGORIES</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`btn btn-secondary game-text py-4 px-6 rounded-none text-lg ${
                      selectedCategories.includes(cat.id) ? 'selected' : ''
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    {cat.label}
                  </button>
                ))}
              </div>
              
              <h2 className="game-text text-2xl text-green mb-6">DIFICULTAT</h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`btn btn-secondary game-text py-4 px-6 rounded-none text-lg uppercase ${
                      difficulty === diff ? 'selected' : ''
                    }`}
                  >
                    {diff === 'easy' ? 'FÀCIL' : diff === 'medium' ? 'MITJÀ' : 'DIFÍCIL'}
                  </button>
                ))}
              </div>
              
              <h2 className="game-text text-2xl text-green mb-6">PREGUNTES</h2>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`btn btn-secondary game-text py-4 px-6 rounded-none text-lg ${
                      questionCount === count ? 'selected' : ''
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              
              <button
                onClick={generateQuestions}
                disabled={selectedCategories.length === 0}
                className="btn btn-primary game-text w-full py-6 text-2xl rounded-none uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedCategories.length === 0 ? 'SELECCIONA UNA CATEGORIA' : 'COMENÇAR JOC'}
              </button>
            </div>
          </div>
        )}
        
        {screen === 'loading' && (
          <div className="fade-in-up text-center">
            <h1 className="game-title text-5xl mb-8 text-green glow-green">GENERANT PREGUNTES</h1>
            <div className="spinner mx-auto"></div>
            <p className="game-text text-green mt-8 text-xl">PREPARANT EL TEU REPTE...</p>
          </div>
        )}
        
        {screen === 'playing' && questions.length > 0 && (
          <div className="fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <div className="game-text text-green text-xl">
                PREGUNTA {currentQuestion + 1}/{questions.length}
              </div>
              <div className="flex items-center gap-4">
                <div className="game-text text-green text-xl flex items-center gap-2">
                  VIDES: {Array.from({length: 3}).map((_, i) => (
                    <span key={i} className={`text-2xl ${i < lives ? 'text-red-500' : 'opacity-30'}`}>
                      ❤️
                    </span>
                  ))}
                </div>
                <div className="game-text text-green text-xl">
                  PUNTS: {totalPoints}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Segur que vols sortir? Es perdrà la partida actual.')) {
                      setScreen('setup');
                      setQuestions([]);
                      setCurrentQuestion(0);
                      setAnswers([]);
                      setSelectedAnswer(null);
                      setShowFeedback(false);
                      setTimeLeft(20);
                      setTotalPoints(0);
                      setQuestionPoints([]);
                      setLives(3);
                      setGameOver(false);
                    }
                  }}
                  className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
                >
                  ← SORTIR
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="game-text text-green text-sm">TEMPS</span>
                <span className="game-text text-green text-sm">{timeLeft}s</span>
              </div>
              <div className="w-full h-4 bg-gray-800 border-2 border-green relative overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(timeLeft / 20) * 100}%`,
                    background: timeLeft > 10 ? '#00ff41' : timeLeft > 5 ? '#ffaa00' : '#ff0000'
                  }}
                />
              </div>
            </div>

            <div className="bg-black border-green p-3 mb-6 text-center">
              <span className="game-text text-green">
                Aquesta pregunta val: <span className="text-xl glow-green">
                  {difficulty === 'easy' ? '5' : difficulty === 'medium' ? '10' : '15'} punts
                </span>
              </span>
            </div>
            
            <div className="bg-black border-green shadow-green p-8 mb-8">
              <div className="game-text text-sm text-green mb-4 uppercase">
                {questions[currentQuestion].category}
              </div>
              <h2 className="game-text text-2xl md:text-3xl mb-8 leading-relaxed">
                {questions[currentQuestion].question}
              </h2>
              
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => {
                  const isCorrect = index === questions[currentQuestion].correctIndex;
                  const isSelected = index === selectedAnswer;
                  
                  let btnClass = 'option-btn';
                  if (showFeedback) {
                    if (isCorrect) btnClass += ' correct';
                    else if (isSelected) btnClass += ' incorrect';
                  } else if (isSelected) {
                    btnClass += ' selected';
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`btn ${btnClass} w-full rounded-none game-text`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="text-green mr-4">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {!showFeedback && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="btn btn-primary game-text w-full py-6 text-2xl rounded-none uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedAnswer === null ? 'SELECCIONA UNA RESPOSTA' : 'ENVIAR'}
              </button>
            )}
          </div>
        )}
        
        
        {screen === 'theory' && (
          <div className="fade-in-up" style={{maxWidth: '1000px', margin: '0 auto'}}>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setScreen('splash')}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                ← TORNAR
              </button>
              <h2 className="game-title text-2xl text-green">VIATGE PER LA TEORIA</h2>
              <button
                onClick={() => setScreen('splash')}
                className="btn btn-secondary game-text py-2 px-4 rounded-none text-sm"
              >
                MENÚ PRINCIPAL
              </button>
            </div>
            
            <div style={{
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: '#0f172a',
              border: '3px solid #00ff41',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
            }}>
              <style>{`
                .theory-slide {
                  padding: 3rem;
                  margin-bottom: 1rem;
                  background-color: #0f172a;
                  border-bottom: 2px solid #334155;
                  color: #f1f5f9;
                }
                .theory-slide h1 {
                  color: #00ff41;
                  font-size: 3rem;
                  margin-bottom: 1rem;
                  text-shadow: 0 0 10px #00ff41;
                }
                .theory-slide h2 {
                  color: #00ff41;
                  font-size: 2rem;
                  margin-bottom: 1.5rem;
                  text-shadow: 0 0 8px #00ff41;
                }
                .theory-slide h3 {
                  color: #00ff41;
                  font-size: 1.5rem;
                  margin-bottom: 1rem;
                }
                .theory-slide p {
                  color: #cbd5e1;
                  font-size: 1.1rem;
                  line-height: 1.6;
                  margin-bottom: 1rem;
                }
                .theory-slide ul {
                  list-style: disc;
                  margin-left: 2rem;
                  color: #cbd5e1;
                }
                .theory-slide li {
                  margin-bottom: 0.75rem;
                  font-size: 1.1rem;
                  line-height: 1.8;
                }
                .theory-slide code {
                  font-family: 'Courier New', monospace;
                  font-size: 1.1rem;
                  padding: 0.2rem 0.4rem;
                  background-color: #1e293b;
                  border-radius: 4px;
                  color: #00ff41;
                }
                .theory-slide table {
                  border-collapse: collapse;
                  width: 80%;
                  margin: 2rem auto;
                  color: #cbd5e1;
                  font-size: 1.1rem;
                }
                .theory-slide th {
                  border: 2px solid #00ff41;
                  padding: 0.8rem;
                  color: #00ff41;
                  background-color: #1e293b;
                }
                .theory-slide td {
                  border: 1px solid #334155;
                  padding: 0.6rem;
                  text-align: center;
                }
                .theory-card {
                  background-color: #1e293b;
                  padding: 1.5rem;
                  margin: 1rem 0;
                  border: 1px solid #334155;
                }
              `}</style>

              {/* Slide 1: Title */}
              <div className="theory-slide" style={{textAlign: 'center'}}>
                <h1>Química Orgànica</h1>
                <p style={{fontSize: '1.5rem', color: '#cbd5e1'}}>Nomenclatura i Formulació de Compostos Orgànics</p>
                <p style={{fontSize: '0.9rem', color: '#94a3b8', marginTop: '1.5rem'}}>4t ESO • Introducció als hidrocarburs i funcions oxigenades</p>
              </div>

              {/* Slide 2: Què és la Química Orgànica */}
              <div className="theory-slide">
                <h2>Què és la Química Orgànica?</h2>
                <ul>
                  <li>Química del <strong>carboni</strong></li>
                  <li>El carboni forma enllaços covalents amb altres carbonis</li>
                  <li>Pot formar cadenes llargues, ramificades o cícliques</li>
                  <li>Configuració tetràedrica: estructura en zig-zag</li>
                </ul>
              </div>

              {/* Slide 3: Prefixos segons nombre de carbonis */}
              <div className="theory-slide">
                <h2>Prefixos segons Nombre de Carbonis</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Nº Carbonis</th>
                      <th>Prefix</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>met-</td></tr>
                    <tr><td>2</td><td>et-</td></tr>
                    <tr><td>3</td><td>prop-</td></tr>
                    <tr><td>4</td><td>but-</td></tr>
                    <tr><td>5</td><td>pent-</td></tr>
                    <tr><td>6</td><td>hex-</td></tr>
                    <tr><td>7</td><td>hept-</td></tr>
                    <tr><td>8</td><td>oct-</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Slide 4: Hidrocarburs Saturats - Alcans */}
              <div className="theory-slide">
                <h2>Hidrocarburs Saturats: Alcans</h2>
                <p>Només enllaços simples C-C. Fórmula general: C<sub>n</sub>H<sub>2n+2</sub></p>
                <ul>
                  <li>Terminació: <strong>-à</strong> (metà, età, propà, butà)</li>
                  <li>Exemples: CH₄ (metà), C₂H₆ (età)</li>
                </ul>
              </div>

              {/* Slide 5: Alcans Ramificats */}
              <div className="theory-slide">
                <h2>Alcans Ramificats</h2>
                <p><strong>Regles de nomenclatura:</strong></p>
                <ul>
                  <li>Triar la cadena més llarga com a principal</li>
                  <li>Numerar per donar localizadors més baixos</li>
                  <li>Radicals en ordre alfabètic: metil-, etil-, propil-</li>
                </ul>
              </div>

              {/* Slide 6: Exemples Alcans */}
              <div className="theory-slide">
                <h2>Exemples d'Alcans</h2>
                <div className="theory-card">
                  <h3>Lineal</h3>
                  <p><code>CH₃-CH₂-CH₂-CH₃</code></p>
                  <p style={{color: '#00ff41', marginTop: '0.5rem'}}>Butà</p>
                </div>
                <div className="theory-card">
                  <h3>Ramificat</h3>
                  <p><code>CH₃-CH(CH₃)-CH₃</code></p>
                  <p style={{color: '#00ff41', marginTop: '0.5rem'}}>2-metilpropà</p>
                </div>
              </div>

              {/* Slide 7: Hidrocarburs Insaturats - Alquens */}
              <div className="theory-slide">
                <h2>Hidrocarburs Insaturats: Alquens</h2>
                <p>Contenen almenys un doble enllaç C=C. Fórmula general: C<sub>n</sub>H<sub>2n</sub></p>
                <ul>
                  <li>Terminació: <strong>-è</strong> (etè, propè, butè)</li>
                  <li>Indicar la posició del doble enllaç</li>
                  <li>Exemple: CH₂=CH₂ (etè), CH₃-CH=CH₂ (propè)</li>
                </ul>
              </div>

              {/* Slide 8: Alquins */}
              <div className="theory-slide">
                <h2>Alquins</h2>
                <p>Contenen almenys un triple enllaç C≡C. Fórmula general: C<sub>n</sub>H<sub>2n-2</sub></p>
                <ul>
                  <li>Terminació: <strong>-í</strong> (etí, propí, butí)</li>
                  <li>Exemple: HC≡CH (etí), CH₃-C≡CH (propí)</li>
                </ul>
              </div>

              {/* Slide 9: Comparació */}
              <div className="theory-slide">
                <h2>Comparació: Alcà, Alquè, Alquí</h2>
                <div className="theory-card">
                  <h3>Alcà</h3>
                  <p><code>CH₃-CH₂-CH₃</code></p>
                  <p style={{color: '#00ff41', marginTop: '0.5rem'}}>Propà</p>
                </div>
                <div className="theory-card">
                  <h3>Alquè</h3>
                  <p><code>CH₃-CH=CH₂</code></p>
                  <p style={{color: '#00ff41', marginTop: '0.5rem'}}>Propè</p>
                </div>
                <div className="theory-card">
                  <h3>Alquí</h3>
                  <p><code>CH₃-C≡CH</code></p>
                  <p style={{color: '#00ff41', marginTop: '0.5rem'}}>Propí</p>
                </div>
              </div>

              {/* Slide 10: Cicloalcans */}
              <div className="theory-slide">
                <h2>Hidrocarburs Cíclics: Cicloalcans</h2>
                <p>Cadena tancada en forma d'anell</p>
                <ul>
                  <li>Prefix <strong>ciclo-</strong> + nom de l'alcà</li>
                  <li>Representació: polígon (triangle, quadrat, pentàgon...)</li>
                  <li>Ciclopropà, ciclobutà, ciclopentà, ciclohexà</li>
                </ul>
              </div>

              {/* Slide 11: Compostos Aromàtics - Benzè */}
              <div className="theory-slide">
                <h2>Compostos Aromàtics: Benzè</h2>
                <p>Anell de 6 carbonis (C₆H₆). Representació: ⬡ amb cercle</p>
                <ul>
                  <li>Metilbenzè (toluè): C₆H₅-CH₃</li>
                  <li>Posicions: orto (1,2-), meta (1,3-), para (1,4-)</li>
                </ul>
              </div>

              {/* Slide 12: Funcions Oxigenades - Alcohols */}
              <div className="theory-slide">
                <h2>Funcions Oxigenades: Alcohols</h2>
                <p>Grup funcional: hidroxil <strong>-OH</strong></p>
                <ul>
                  <li>Terminació: <strong>-ol</strong></li>
                  <li>Exemples: CH₃OH (metanol), CH₃-CH₂-OH (etanol)</li>
                  <li>Prioritat sobre insaturacions</li>
                </ul>
              </div>

              {/* Slide 13: Aldehids */}
              <div className="theory-slide">
                <h2>Aldehids</h2>
                <p>Grup carbonil <strong>-CHO</strong> en carboni terminal</p>
                <ul>
                  <li>Terminació: <strong>-al</strong></li>
                  <li>Exemples: H-CHO (metanal), CH₃-CHO (etanal)</li>
                  <li>Sempre en posició 1</li>
                </ul>
              </div>

              {/* Slide 14: Cetones */}
              <div className="theory-slide">
                <h2>Cetones</h2>
                <p>Grup carbonil <strong>-CO-</strong> en carboni secundari</p>
                <ul>
                  <li>Terminació: <strong>-ona</strong></li>
                  <li>Exemple: CH₃-CO-CH₃ (propanona o acetona)</li>
                  <li>Exemple: CH₃-CO-CH₂-CH₃ (butanona)</li>
                </ul>
              </div>

              {/* Slide 15: Àcids Carboxílics */}
              <div className="theory-slide">
                <h2>Àcids Carboxílics</h2>
                <p>Grup carboxil <strong>-COOH</strong></p>
                <ul>
                  <li>Nomenclatura: <strong>àcid...oic</strong></li>
                  <li>Exemples: H-COOH (àcid metanoic o fòrmic)</li>
                  <li>CH₃-COOH (àcid etanoic o acètic)</li>
                </ul>
              </div>

              {/* Slide 16: Èsters */}
              <div className="theory-slide">
                <h2>Èsters</h2>
                <p>Derivats d'àcids: <strong>-COO-R</strong></p>
                <ul>
                  <li>Terminació: <strong>-oat de...</strong> (radical)</li>
                  <li>Exemple: CH₃-COO-CH₃ (etanoat de metil)</li>
                  <li>H-COO-CH₂-CH₃ (metanoat d'etil)</li>
                </ul>
              </div>

              {/* Slide 17: Ordre de Prioritat */}
              <div className="theory-slide">
                <h2>Ordre de Prioritat de Grups</h2>
                <p><strong>De major a menor prioritat:</strong></p>
                <ul>
                  <li>1. Àcids carboxílics (-COOH)</li>
                  <li>2. Aldehids (-CHO)</li>
                  <li>3. Cetones (-CO-)</li>
                  <li>4. Alcohols (-OH)</li>
                </ul>
              </div>

              {/* Slide 18: Compostos Polifuncionals */}
              <div className="theory-slide">
                <h2>Compostos Polifuncionals</h2>
                <p>Quan hi ha diverses funcions:</p>
                <ul>
                  <li>Funció principal: dona nom al compost</li>
                  <li>Funcions secundàries: prefix (hidroxi-, oxo-)</li>
                  <li>Exemple: HO-CH₂-CH₂-COOH (àcid 3-hidroxipropanoic)</li>
                </ul>
              </div>

              {/* Slide 19: Insaturacions i Funcions */}
              <div className="theory-slide">
                <h2>Insaturacions + Funcions</h2>
                <p>Dobles enllaços amb funcions oxigenades</p>
                <ul>
                  <li>Funció principal té prioritat en numeració</li>
                  <li>Exemple: CH₃-CH=CH-COOH</li>
                  <li>Àcid but-2-enoic</li>
                </ul>
              </div>

              {/* Slide 20: Rames i Funcions */}
              <div className="theory-slide">
                <h2>Rames + Funcions Oxigenades</h2>
                <p>Ordre de prioritat en nomenclatura:</p>
                <ul>
                  <li>1. Grup funcional (determina numeració)</li>
                  <li>2. Insaturacions (dobles/triples enllaços)</li>
                  <li>3. Rames (metil-, etil-)</li>
                </ul>
              </div>

              {/* Slide 21: Exemple Complex */}
              <div className="theory-slide">
                <h2>Exemple Compost Complex</h2>
                <div className="theory-card" style={{textAlign: 'center'}}>
                  <p style={{fontSize: '1.8rem', color: '#00ff41', marginBottom: '1rem'}}>Àcid 3-metilbut-2-enoic</p>
                  <p>Conté: àcid carboxílic + doble enllaç + radical</p>
                  <p style={{fontSize: '1.2rem', marginTop: '1rem'}}><code>CH₃-C(CH₃)=CH-COOH</code></p>
                </div>
              </div>

              {/* Slide 22: Resum Hidrocarburs */}
              <div className="theory-slide">
                <h2>Resum Hidrocarburs</h2>
                <ul>
                  <li>Alcans: -à (enllaços simples C-C)</li>
                  <li>Alquens: -è (dobles enllaços C=C)</li>
                  <li>Alquins: -í (triples enllaços C≡C)</li>
                  <li>Cicloalcans: ciclo- + nom</li>
                </ul>
              </div>

              {/* Slide 23: Resum Funcions */}
              <div className="theory-slide">
                <h2>Resum Funcions Oxigenades</h2>
                <ul>
                  <li>Alcohols: -ol (grup -OH)</li>
                  <li>Aldehids: -al (grup -CHO)</li>
                  <li>Cetones: -ona (grup -CO-)</li>
                  <li>Àcids: àcid...oic (grup -COOH)</li>
                </ul>
              </div>

              {/* Slide 24: Thank You */}
              <div className="theory-slide" style={{textAlign: 'center'}}>
                <h2 style={{fontSize: '2.5rem', marginBottom: '1.5rem'}}>Gràcies!</h2>
                <p style={{fontSize: '1.25rem'}}>Preguntes?</p>
                <p style={{fontSize: '0.9rem', color: '#94a3b8', marginTop: '2rem'}}>Química Orgànica • 4t ESO</p>
              </div>
            </div>
          </div>
        )}
        
        {screen === 'results' && (
          <div className="fade-in-up text-center">
            <h1 className="game-title text-6xl md:text-8xl mb-8 text-green glow-green">
              {gameOver ? 'GAME OVER' : 'JOC ACABAT'}
            </h1>
            
            {gameOver && (
              <div className="bg-black border-2 border-red-500 shadow-green p-6 mb-8">
                <p className="game-text text-red-500 text-3xl mb-4">
                  💀 HAS PERDUT TOTES LES VIDES! 💀
                </p>
                <p className="game-text text-green text-xl">
                  Has respost {currentQuestion + 1} de {questions.length} preguntes
                </p>
              </div>
            )}
            
            <div className="bg-black border-green shadow-green p-12 mb-8">
              <div className="game-text text-green text-2xl mb-4">PUNTUACIÓ FINAL</div>
              <div className="game-title text-8xl md:text-9xl glow-green mb-8">
                {totalPoints}
              </div>
              <div className="game-text text-green text-xl mb-4">PUNTS TOTALS</div>
              <div className="game-text text-3xl mb-4">
                {!gameOver && totalPoints >= questions.length * 15 && '🏆 PERFECTE! LLEGENDARI!'}
                {!gameOver && totalPoints >= questions.length * 12 && totalPoints < questions.length * 15 && '⭐ EXCEL·LENT!'}
                {!gameOver && totalPoints >= questions.length * 8 && totalPoints < questions.length * 12 && '👍 BON TREBALL!'}
                {totalPoints >= questions.length * 4 && totalPoints < questions.length * 8 && '📚 CONTINUA ESTUDIANT!'}
                {totalPoints < questions.length * 4 && '💪 TORNA-HO A PROVAR!'}
              </div>
              <div className="game-text text-green text-lg mt-6">
                Respostes correctes: {answers.filter(Boolean).length}/{gameOver ? currentQuestion + 1 : questions.length}
              </div>
            </div>
            
            <button
              onClick={restart}
              className="btn btn-primary game-text w-full py-6 text-2xl rounded-none uppercase mb-4"
            >
              JUGAR ALTRA VEGADA
            </button>
            
            <button
              onClick={() => {
                setScreen('splash');
                setQuestions([]);
                setCurrentQuestion(0);
                setAnswers([]);
                setSelectedAnswer(null);
                setShowFeedback(false);
                setTimeLeft(20);
                setTotalPoints(0);
                setQuestionPoints([]);
                setCurrentUser(null);
                setSelectedCategories([]);
                setLives(3);
                setGameOver(false);
              }}
              className="btn btn-secondary game-text w-full py-4 text-lg rounded-none uppercase"
            >
              MENÚ PRINCIPAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
