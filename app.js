// Configuração Inicial de Alunos
const defaultStudents = [
    {id:1, name: "Alexsandro da Silva "},
    {id:2, name: "Alice Hemanoelly"},
    {id:3, name: "Arthur Cordeiro "},
    {id:4, name: "Carlito Henrique"},
    {id:5, name: "Dominic Kawan"},
    {id:6, name: "Edson Phelipe"},
    {id:7, name: "Estevan Eduardo"},
    {id:8, name: "Gregory Santos"},
    {id:9, name: "Kimberly Sophia"},
    {id:10, name: "Layslla Valentina"},
    {id:11, name: "Luis Felipe"},
    {id:12, name: "Matheus Jhonathan"},
    {id:13, name: "Murillo da Silva"},
    {id:14, name: "Ryan Lucas"},
    {id:15, name: "Sophia Camilo"},
    {id:16, name: "Valentina Gomes"},
    {id:17, name: "Vyctor Emanuel"},
    {id:18, name: "Vytorya Gabryelly"},
    {id:19, name: "Weiny Sophia"},
    {id:20, name: "Yohanna Eloah"}
];

// Estado da Aplicação
let state = {
    students: JSON.parse(localStorage.getItem('students')) || defaultStudents.map(s => ({...s, xp: 0})),
    records: JSON.parse(localStorage.getItem('records')) || {}, // Formato: { "YYYY-MM-DD": { studentId: "status" } }
    observations: localStorage.getItem('observations') || ""
};

// Elemtos do DOM
const datePicker = document.getElementById('datePicker');
const homeworkList = document.getElementById('homeworkList');
const behaviorList = document.getElementById('behaviorList');
const observationsInput = document.getElementById('observations');
const totalClassDoneElement = document.getElementById('totalClassDone');
const totalClassAbsencesEl = document.getElementById('totalClassAbsences');

// Inicialiazação
function init() {
    // Seta a data de hoje por padrão
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;

    observationsInput.value = state.observations;

    // Listeners 
    datePicker.addEventListener('change', render);
    observationsInput.addEventListener('input', (e) => {
        state.observations = e.target.value;
        saveData();
    });

    render();
}

// Salva os dados no localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(state.students));
    localStorage.setItem('records', JSON.stringify(state.records));
    localStorage.setItem('observations', state.observations);
}


// Retorna o total de tarefas feitas por um aluno específico
function getStudentTotalDone(studentId) {
    let total = 0;
    for (let date in state.records) {
        if(state.records[date][studentId] === 'done')
            total++;
    }
    return total;
}

// Atualiza as estatísticas globais
function updateStats() {
    let classDone = 0;
    let classAbsences = 0;

    for (let date in state.records) {
        for (let studentId in state.records[date]) {
            if(state.records[date][studentId] === 'done') 
                classDone++;
            if(state.records[date][studentId] === 'absent')
                classAbsences++;
        }
    }
    totalClassDoneEl.innerText = classDone;
    totalClassAbsencesEl.innerText = classAbsences;
}

// Define o status da tarefa de um aluno num dia específico
function setTaskStatus(studentId, status) {
    const date = datePicker.value;
    if(!date) return;

    if(!state.records[date]) state.records[date] = {};
    state.records[date][studentId] = status;

    saveData();
    render();
}

// Adiciona XP para o aluno
function addXP(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if(student) {
        student.xp += 10; // Adiciona 10 XP
        saveData();
        render();
    }
}

// Remove XP do aluno
function removeXP(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if(student && student.xp > 0) {
        student.xp -= 10; // Remove 10 XP
        saveData();
        render();
    }
}

// Renderiza a interface
function render() {
    const date = datePicker.value;
    const currentRecords = state.records[date] || {};

    homeworkList.innerHTML = '';
    behaviorList.innerHTML = '';

    state.students.forEach(student => {
        const status = currentRecords[student.id] || null;
        const totalStudentDone = getStudentTotalDone(student.id);

        // --- RENDEREIZAÇÃO: Lista de Tarefas ---
        const taskDiv = document.createElement('div');
        taskDiv.className = "flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 mb-2 bg-slate-50 rounded-lg border border-slate-200";
                
                taskDiv.innerHTML = `
                    <div class="mb-2 sm:mb-0">
                        <p class="font-semibold text-slate-700">${student.name}</p>
                        <p class="text-xs text-slate-500">Total de tarefas concluídas: <strong>${totalStudentDone}</strong></p>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <button onclick="setTaskStatus(${student.id}, 'done')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'done' ? 'bg-green-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-green-100'}">Fez</button>
                        <button onclick="setTaskStatus(${student.id}, 'not-done')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'not-done' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-blue-100'}">Não Fez</button>
                        <button onclick="setTaskStatus(${student.id}, 'absent')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === 'absent' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-red-100'}">Faltou</button>
                    </div>
                `;
                homeworkList.appendChild(taskDiv);

                // --- RENDERIZAÇÃO: Lista de Comportamento (XP) ---
                const behaviorDiv = document.createElement('div');
                behaviorDiv.className = "flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200";
                behaviorDiv.innerHTML = `
                    <span class="font-medium text-slate-700 text-sm truncate w-1/2">${student.name}</span>
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-amber-500 text-sm w-12 text-right">${student.xp} XP</span>
                        <div class="flex gap-1">
                            <button onclick="removeXP(${student.id})" class="w-6 h-6 flex items-center justify-center rounded bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors text-xs font-bold">-</button>
                            <button onclick="addXP(${student.id})" class="w-6 h-6 flex items-center justify-center rounded bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors text-xs font-bold">+</button>
                        </div>
                    </div>
                `;
                behaviorList.appendChild(behaviorDiv);
    });
    updateStats();
}

// Inicializa a aplicação
init();

