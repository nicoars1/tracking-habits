date = new Date();
const TODAY = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const defaultHabits = [
    { id: 1, title: "Leer 30 mins", subtitle: "Libro: Atomic Habits", icon: "📚", color: "orange", completedDates: [] },
    { id: 2, title: "Entrenamiento", subtitle: "Rutina de fuerza", icon: "💪", color: "green", completedDates: [] },
    { id: 3, title: "Beber 2L Agua", subtitle: "Hidratación diaria", icon: "💧", color: "blue", completedDates: [] },
    { id: 4, title: "Meditar", subtitle: "10 min de calma", icon: "🧘", color: "purple", completedDates: [] }
];

const AVAILABLE_COLORS = [
    { name: 'blue', hex: 'bg-blue-500' }, { name: 'orange', hex: 'bg-orange-500' },
    { name: 'green', hex: 'bg-green-500' }, { name: 'purple', hex: 'bg-purple-500' },
    { name: 'pink', hex: 'bg-pink-500' }, { name: 'red', hex: 'bg-red-500' },
    { name: 'yellow', hex: 'bg-yellow-400' }, { name: 'teal', hex: 'bg-teal-500' },
    { name: 'indigo', hex: 'bg-indigo-500' }, { name: 'gray', hex: 'bg-gray-600' }
];

const AVAILABLE_ICONS = [
    '📚', '💪', '💧', '🧘', '💰', '🎨', '🎵', '✈️', '🐶', '🎓', 
    '💼', '❤️', '⭐', '🛒', '🎮', '🍎', '🍳', '🚴', '🏊', '🧠',
    '💊', '🧹', '🪴', '📵', '🌞', '🌙', '📝', '🤝', '🗣️', '👣'
];

let currentSelection = { icon: '📚', color: 'blue' };
let isDeleteMode = false;
let itemsToDelete = [];