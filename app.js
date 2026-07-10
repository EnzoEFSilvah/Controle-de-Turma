// Configuração Inicial de Alunos
const defaultStudents = [
    {id:1, name: "Alexsandro da Silva", photoUrl: "./Alunos/Alexsandro.jpg"},
    {id:2, name: "Alice Hemanoelly", photoUrl: "./Alunos/Alice.jpg"},
    {id:3, name: "Arthur Cordeiro", photoUrl: "./Alunos/Arthur.jpg"},
    {id:4, name: "Carlito Henrique", photoUrl: "./Alunos/CARLITO.jpg"},
    {id:5, name: "Dominic Kawan", photoUrl: "Alunos/Dominic.jpg"},
    {id:6, name: "Edson Phelipe", photoUrl: "Alunos/Edson.jpg"},
    {id:7, name: "Estevan Eduardo", photoUrl: "Alunos/Estevan.jpg"},
    {id:8, name: "Gregory Santos", photoUrl: "Alunos/Gregory.jpg"},
    {id:9, name: "Kimberly Sophia", photoUrl: "Alunos/Kimberly.jpg"},
    {id:10, name: "Layslla Valentina", photoUrl: "Alunos/Layslla.jpg"},
    {id:11, name: "Luis Felipe", photoUrl: "Alunos/Luis.jpg"},
    {id:12, name: "Matheus Jhonathan", photoUrl: "Alunos/Matheus.jpg"},
    {id:13, name: "Murillo da Silva", photoUrl: "Alunos/Murillo.jpg"},
    {id:14, name: "Ryan Lucas", photoUrl: "Alunos/Ryan.jpg"},
    {id:15, name: "Sophia Camilo", photoUrl: "Alunos/Sophia.jpg"},
    {id:16, name: "Valentina Gomes", photoUrl: "Alunos/Valentina.jpg"},
    {id:17, name: "Vyctor Emanuel", photoUrl: "Alunos/Vyctor.jpg"},
    {id:18, name: "Vytorya Gabryelly", photoUrl: "Alunos/Vytorya.jpg"},
    {id:19, name: "Weiny Sophia", photoUrl: "Alunos/Weiny.jpg"},
    {id:20, name: "Yohanna Eloah", photoUrl: "Alunos/Yohanna.jpg"}
];

const fallbackAvatarUrl = (seed) => `https://api.dicebear.com/6.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&size=96`;

const localPhotoMap = {
    "Alexsandro da Silva": "./Alunos/Alexsandro.jpg",
    "Alice Hemanoelly": "./Alunos/Alice.jpg",
    "Arthur Cordeiro": "./Alunos/Arthur.jpg",
    "Carlito Henrique": "./Alunos/CARLITO.jpg",
    "Dominic Kawan": "Alunos/Dominic.jpg",
    "Edson Phelipe": "Alunos/Edson.jpg",
    "Estevan Eduardo": "Alunos/Estevan.jpg",
    "Gregory Santos": "Alunos/Gregory.jpg",
    "Kimberly Sophia": "Alunos/Kimberly.jpg",
    "Layslla Valentina": "Alunos/Layslla.jpg",
    "Luis Felipe": "Alunos/Luis.jpg",
    "Matheus Jhonathan": "Alunos/Matheus.jpg",
    "Murillo da Silva": "Alunos/Murillo.jpg",
    "Ryan Lucas": "Alunos/Ryan.jpg",
    "Sophia Camilo": "Alunos/Sophia.jpg",
    "Valentina Gomes": "Alunos/Valentina.jpg",
    "Vyctor Emanuel": "Alunos/Vyctor.jpg",
    "Vytorya Gabryelly": "Alunos/Vytorya.jpg",
    "Weiny Sophia": "Alunos/Weiny.jpg",
    "Yohanna Eloah": "Alunos/Yohanna.jpg"
};

const storedStudents = JSON.parse(localStorage.getItem('students')) || null;
const storedRecords = JSON.parse(localStorage.getItem('records')) || null;

const resolvePhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('./') || photoUrl.startsWith('/') || photoUrl.startsWith('http')) return photoUrl;
    return `./${photoUrl}`;
};

const normalizedStudents = storedStudents ? storedStudents.map(student => ({
    ...student,
    xp: typeof student.xp === 'number' ? student.xp : 0,
    photoUrl: resolvePhotoUrl(localPhotoMap[student.name] || student.photoUrl || null),
    avatar: student.avatar || fallbackAvatarUrl(student.name)
})) : defaultStudents.map(s => ({
    ...s,
    xp: 0,
    photoUrl: resolvePhotoUrl(localPhotoMap[s.name] || s.photoUrl || null),
    avatar: s.avatar || fallbackAvatarUrl(s.name)
}));

const normalizeRecord = (value) => {
    if (!value) return {taskStatus: null, behavior: null, activityStatus: null};
    if (typeof value === 'string') {
        return {taskStatus: value, behavior: null, activityStatus: null};
    }
    return {
        taskStatus: value.taskStatus || null,
        behavior: value.behavior || null,
        activityStatus: value.activityStatus || null
    };
};

const normalizeRecords = (rawRecords) => {
    if (!rawRecords) return {};
    const normalized = {};
    for (const date in rawRecords) {
        normalized[date] = {};
        for (const studentId in rawRecords[date]) {
            normalized[date][studentId] = normalizeRecord(rawRecords[date][studentId]);
        }
    }
    return normalized;
};

let state = {
    students: normalizedStudents,
    records: normalizeRecords(storedRecords),
    observations: localStorage.getItem('observations') || ""
};

// Elementos do DOM
const datePicker = document.getElementById('datePicker');
const homeworkList = document.getElementById('homeworkList');
const behaviorList = document.getElementById('behaviorList');
const observationsInput = document.getElementById('observations');
const totalClassDoneElement = document.getElementById('totalClassDone');
const totalClassAbsencesEl = document.getElementById('totalClassAbsences');
const totalXPElement = document.getElementById('totalXP');
const studentCountElement = document.getElementById('studentCount');
const topRankListElement = document.getElementById('topRankList');

// Inicialização
function init() {
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;
    observationsInput.value = state.observations;

    datePicker.addEventListener('change', render);
    observationsInput.addEventListener('input', (e) => {
        state.observations = e.target.value;
        saveData();
    });

    render();
}

function saveData() {
    localStorage.setItem('students', JSON.stringify(state.students));
    localStorage.setItem('records', JSON.stringify(state.records));
    localStorage.setItem('observations', state.observations);
}

function getStudentTotalDone(studentId) {
    let total = 0;
    for (const date in state.records) {
        const record = state.records[date][studentId];
        if (record && record.taskStatus === 'done') total++;
    }
    return total;
}

function getStudentScore(record) {
    let score = 0;
    if (!record) return score;
    if (record.taskStatus === 'done') score += 20;
    if (record.taskStatus === 'not-done') score += 10;
    if (record.taskStatus === 'absent') score += 0;

    if (record.activityStatus === 'Todas') score += 20;
    if (record.activityStatus === 'Parcial') score += 10;
    if (record.activityStatus === 'Nenhuma') score += 0;

    if (record.behavior === 'Bom') score += 20;
    if (record.behavior === 'Regular') score += 10;
    if (record.behavior === 'Ruim') score += 0;

    return score;
}

function getMonthKey(date) {
    return date ? date.slice(0, 7) : null;
}

function getStudentMonthScore(studentId, monthKey) {
    let score = 0;
    for (const date in state.records) {
        if (!date.startsWith(monthKey)) continue;
        const record = state.records[date][studentId];
        if (record) score += getStudentScore(record);
    }
    return score;
}

function updateStats() {
    let classDone = 0;
    let classAbsences = 0;
    let totalXP = 0;

    for (const date in state.records) {
        for (const studentId in state.records[date]) {
            const record = state.records[date][studentId];
            if (!record) continue;
            if (record.taskStatus === 'done') classDone++;
            if (record.taskStatus === 'absent') classAbsences++;
        }
    }

    state.students.forEach(student => {
        totalXP += student.xp;
    });

    totalClassDoneElement.innerText = classDone;
    totalClassAbsencesEl.innerText = classAbsences;
    totalXPElement.innerText = totalXP;
    studentCountElement.innerText = state.students.length;
}

function renderTopRanking(date) {
    if (!topRankListElement) return;

    const monthKey = getMonthKey(date);
    const ranking = state.students.map(student => {
        const score = monthKey ? getStudentMonthScore(student.id, monthKey) : 0;
        const monthRecords = Object.keys(state.records).filter(recordDate => recordDate.startsWith(monthKey) && state.records[recordDate][student.id]).length;
        return {
            ...student,
            score,
            monthRecords
        };
    }).sort((a, b) => b.score - a.score || b.xp - a.xp).slice(0, 5);

    topRankListElement.innerHTML = ranking.map((student, index) => `
        <div class="flex items-center gap-3 rounded-3xl bg-slate-950/90 border border-slate-800 p-3 shadow-lg">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500 text-sm font-bold text-slate-950">${index + 1}</span>
            <img src="${student.photoUrl || student.avatar}" alt="${student.name}" onerror="this.onerror=null;this.src='${fallbackAvatarUrl(student.name)}'" class="h-12 w-12 rounded-2xl border border-slate-700 object-cover" />
            <div class="min-w-0 flex-1">
                <p class="font-semibold text-white truncate">${student.name}</p>
                <p class="text-xs text-slate-400">${student.monthRecords} dia(s) registrados • Score mensal</p>
            </div>
            <span class="text-sm font-bold text-cyan-300">${student.score} pts</span>
        </div>
    `).join('');
}

function setStudentRecord(studentId, field, value) {
    const date = datePicker.value;
    if (!date) return;

    if (!state.records[date]) state.records[date] = {};
    if (!state.records[date][studentId]) {
        state.records[date][studentId] = {taskStatus: null, behavior: null, activityStatus: null};
    }
    state.records[date][studentId][field] = value;

    saveData();
    render();
}

function setTaskStatus(studentId, status) {
    setStudentRecord(studentId, 'taskStatus', status);
}

function setBehaviorStatus(studentId, status) {
    setStudentRecord(studentId, 'behavior', status);
}

function setActivityStatus(studentId, status) {
    setStudentRecord(studentId, 'activityStatus', status);
}

function addXP(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
    student.xp += 10;
    saveData();
    render();
}

function removeXP(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student || student.xp <= 0) return;
    student.xp -= 10;
    saveData();
    render();
}

function getStatusClasses(status, target, textMode = false) {
    const base = 'flex-1 sm:flex-none px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200';
    const variants = textMode ? {
        Bom: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
        Regular: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
        Ruim: 'bg-rose-500 text-white hover:bg-rose-400',
        Todas: 'bg-fuchsia-500 text-white hover:bg-fuchsia-400',
        Parcial: 'bg-sky-500 text-white hover:bg-sky-400',
        Nenhuma: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
        default: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
    } : {
        done: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
        'not-done': 'bg-sky-500 text-white hover:bg-sky-400',
        absent: 'bg-rose-500 text-white hover:bg-rose-400',
        default: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
    };
    return status === target ? `${base} ${variants[target] || variants.default} shadow-lg` : `${base} ${variants.default}`;
}

function render() {
    const date = datePicker.value;
    const currentRecords = state.records[date] || {};

    homeworkList.innerHTML = '';
    behaviorList.innerHTML = '';
    renderTopRanking(date);

    state.students.forEach(student => {
        const record = currentRecords[student.id] || {taskStatus: null, behavior: null, activityStatus: null};
        const totalStudentDone = getStudentTotalDone(student.id);
        const level = Math.min(10, Math.max(1, Math.floor(student.xp / 50) + 1));
        const progress = Math.min(100, (student.xp % 50) * 2);

        const taskDiv = document.createElement('div');
        taskDiv.className = 'mb-4 rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4 shadow-2xl';
        taskDiv.innerHTML = `
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                    <img src="${student.photoUrl || student.avatar}" alt="${student.name}" onerror="this.onerror=null;this.src='${fallbackAvatarUrl(student.name)}'" class="h-14 w-14 rounded-2xl border border-slate-700 object-cover bg-slate-800" />
                    <div>
                        <p class="font-semibold text-slate-100">${student.name}</p>
                        <p class="text-xs text-slate-400">Tarefas concluídas: <strong class="text-slate-200">${totalStudentDone}</strong></p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 text-xs text-slate-300">
                    <span class="rounded-full bg-slate-800/90 px-3 py-2">Tarefa: ${record.taskStatus ? record.taskStatus.replace('-', ' ') : 'Pendente'}</span>
                    <span class="rounded-full bg-slate-800/90 px-3 py-2">Comportamento: ${record.behavior || 'Pendente'}</span>
                    <span class="rounded-full bg-slate-800/90 px-3 py-2">Atividades: ${record.activityStatus || 'Pendente'}</span>
                </div>
            </div>
            <div class="mt-4 grid gap-3">
                <div class="grid grid-cols-3 gap-2">
                    <button onclick="setTaskStatus(${student.id}, 'done')" class="${getStatusClasses(record.taskStatus, 'done')}">Fez</button>
                    <button onclick="setTaskStatus(${student.id}, 'not-done')" class="${getStatusClasses(record.taskStatus, 'not-done')}">Não Fez</button>
                    <button onclick="setTaskStatus(${student.id}, 'absent')" class="${getStatusClasses(record.taskStatus, 'absent')}">Faltou</button>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <button onclick="setBehaviorStatus(${student.id}, 'Bom')" class="${getStatusClasses(record.behavior, 'Bom', true)}">Bom</button>
                    <button onclick="setBehaviorStatus(${student.id}, 'Regular')" class="${getStatusClasses(record.behavior, 'Regular', true)}">Regular</button>
                    <button onclick="setBehaviorStatus(${student.id}, 'Ruim')" class="${getStatusClasses(record.behavior, 'Ruim', true)}">Ruim</button>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <button onclick="setActivityStatus(${student.id}, 'Todas')" class="${getStatusClasses(record.activityStatus, 'Todas', true)}">Todas</button>
                    <button onclick="setActivityStatus(${student.id}, 'Parcial')" class="${getStatusClasses(record.activityStatus, 'Parcial', true)}">Parcial</button>
                    <button onclick="setActivityStatus(${student.id}, 'Nenhuma')" class="${getStatusClasses(record.activityStatus, 'Nenhuma', true)}">Nenhuma</button>
                </div>
            </div>
        `;
        homeworkList.appendChild(taskDiv);

        const behaviorDiv = document.createElement('div');
        behaviorDiv.className = 'rounded-3xl border border-cyan-200/80 bg-white/90 p-4 shadow-xl';
        behaviorDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${student.photoUrl || student.avatar}" alt="${student.name}" onerror="this.onerror=null;this.src='${fallbackAvatarUrl(student.name)}'" class="h-10 w-10 rounded-2xl border border-slate-300 object-cover" />
                <div class="min-w-0 flex-1">
                    <p class="font-semibold text-slate-950 truncate">${student.name}</p>
                    <p class="text-xs text-slate-500">Nível ${level} • ${student.xp} XP</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="removeXP(${student.id})" class="h-9 w-9 rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200">-</button>
                    <button onclick="addXP(${student.id})" class="h-9 w-9 rounded-full bg-cyan-500 text-white hover:bg-cyan-400">+</button>
                </div>
            </div>
            <div class="mt-3 rounded-full bg-slate-800/80 h-2 overflow-hidden">
                <div class="h-2 rounded-full bg-fuchsia-500" style="width: ${progress}%;"></div>
            </div>
        `;
        behaviorList.appendChild(behaviorDiv);
    });

    updateStats();
}

init();

