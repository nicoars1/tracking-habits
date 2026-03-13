function loadData() {
    const stored = localStorage.getItem('myHabitsApp');
    return stored ? JSON.parse(stored) : defaultHabits;
}

function saveData(habits) {
    localStorage.setItem('myHabitsApp', JSON.stringify(habits));
    render();
}