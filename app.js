/* ============================================
   EXAMPRO – ONLINE EXAMINATION SYSTEM
   Main Application Logic
   ============================================ */

'use strict';

// ─── SVG GRADIENT (injected for ring chart) ───
document.addEventListener('DOMContentLoaded', () => {
  const svg = `<svg width="0" height="0"><defs><linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" style="stop-color:#6c63ff"/><stop offset="100%" style="stop-color:#00d4aa"/>
  </linearGradient></defs></svg>`;
  document.body.insertAdjacentHTML('beforeend', svg);
});

// ─── SHOW PAGE (page router) ───
function showPage(pageId, role) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) { page.classList.add('active'); window.scrollTo(0, 0); }
  if (role) { currentRole = role; switchLoginRole(role); }
  if (pageId === 'page-diagrams') renderMainDiagrams();
}

// ─── STATE ───
let currentRole = 'student';
let currentUser = null;
let currentExam = null;
let currentQuestionIdx = 0;
let examAnswers = {};
let examTimerInterval = null;
let examTimeLeft = 0;
let lastExamResult = null;

// ─── DATA STORE ───
const DB = {
  users: [
    { id: 'u1', name: 'Alex Johnson', email: 'student@demo.com', password: 'student123', role: 'student', studentId: 'STU001', department: 'Computer Science', course: 'B.Tech', avatar: '👨‍🎓' },
    { id: 'u2', name: 'Sarah Williams', email: 'sarah@demo.com', password: 'pass123', role: 'student', studentId: 'STU002', department: 'Mathematics', course: 'B.Sc', avatar: '👩‍🎓' },
    { id: 'u3', name: 'Marcus Lee', email: 'marcus@demo.com', password: 'pass123', role: 'student', studentId: 'STU003', department: 'Engineering', course: 'B.Tech', avatar: '👨‍💻' },
    { id: 'u4', name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'admin', avatar: '🛡️' }
  ],
  exams: [
    {
      id: 'ex1', title: 'Data Structures & Algorithms', subject: 'Computer Science',
      duration: 30, passingMarks: 60, status: 'live',
      description: 'Test your knowledge of fundamental data structures and algorithm complexities.',
      createdBy: 'u4',
      questions: [
        { id: 'q1', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, marks: 2 },
        { id: 'q2', text: 'Which data structure uses LIFO principle?', options: ['Queue', 'Linked List', 'Stack', 'Tree'], correct: 2, marks: 2 },
        { id: 'q3', text: 'What is the worst-case time complexity of QuickSort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 2, marks: 2 },
        { id: 'q4', text: 'Which traversal visits root first in a Binary Tree?', options: ['Inorder', 'Postorder', 'Preorder', 'Level order'], correct: 2, marks: 2 },
        { id: 'q5', text: 'What does a Hash Table provide on average?', options: ['O(n) lookup', 'O(1) lookup', 'O(log n) lookup', 'O(n²) lookup'], correct: 1, marks: 2 },
        { id: 'q6', text: 'Which is NOT a graph traversal algorithm?', options: ['BFS', 'DFS', 'Binary Search', 'Dijkstra'], correct: 2, marks: 2 },
        { id: 'q7', text: 'Linked lists have O(1) time for?', options: ['Random access', 'Insertion at head', 'Search', 'Deletion from middle'], correct: 1, marks: 2 },
        { id: 'q8', text: 'A complete binary tree with n leaves has how many nodes?', options: ['n', '2n-1', 'n+1', '2n'], correct: 1, marks: 2 },
        { id: 'q9', text: 'What is a deque?', options: ['Single-ended queue', 'Double-ended queue', 'Priority queue', 'Circular queue'], correct: 1, marks: 2 },
        { id: 'q10', text: 'Merge sort is a _____ algorithm?', options: ['Greedy', 'Dynamic programming', 'Divide and conquer', 'Backtracking'], correct: 2, marks: 2 }
      ]
    },
    {
      id: 'ex2', title: 'Database Management Systems', subject: 'Computer Science',
      duration: 25, passingMarks: 55, status: 'live',
      description: 'Covers SQL fundamentals, normalization, ER diagrams and database design.',
      createdBy: 'u4',
      questions: [
        { id: 'q1', text: 'Which SQL command retrieves data from a table?', options: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'], correct: 1, marks: 2 },
        { id: 'q2', text: 'What does ACID stand for in databases?', options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Identity, Data', 'Accuracy, Concurrency, Integrity, Distribution', 'None of the above'], correct: 0, marks: 2 },
        { id: 'q3', text: 'Which normal form eliminates partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 1, marks: 2 },
        { id: 'q4', text: 'A primary key can contain NULL values?', options: ['True', 'False', 'Depends on DBMS', 'Only sometimes'], correct: 1, marks: 2 },
        { id: 'q5', text: 'Which JOIN returns rows from both tables including unmatched rows?', options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], correct: 2, marks: 2 },
        { id: 'q6', text: 'What is a foreign key?', options: ['A key that must be unique', 'A key from another table', 'A duplicate key', 'An encrypted key'], correct: 1, marks: 2 },
        { id: 'q7', text: 'Which SQL clause filters groups?', options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'], correct: 2, marks: 2 },
        { id: 'q8', text: 'An ER diagram represents?', options: ['Program logic', 'Network topology', 'Entity and relationships', 'Server architecture'], correct: 2, marks: 2 }
      ]
    },
    {
      id: 'ex3', title: 'Object Oriented Programming', subject: 'Software Engineering',
      duration: 20, passingMarks: 60, status: 'live',
      description: 'Fundamentals of OOP including classes, inheritance, polymorphism and encapsulation.',
      createdBy: 'u4',
      questions: [
        { id: 'q1', text: 'Which OOP concept restricts access to data?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], correct: 2, marks: 2 },
        { id: 'q2', text: 'What is method overriding?', options: ['Same method name, different parameters', 'Redefining parent method in child class', 'Creating multiple constructors', 'Using static methods'], correct: 1, marks: 2 },
        { id: 'q3', text: 'A class that cannot be instantiated is called?', options: ['Interface', 'Abstract class', 'Static class', 'Final class'], correct: 1, marks: 2 },
        { id: 'q4', text: 'Which keyword is used for inheritance in Java?', options: ['implements', 'extends', 'inherits', 'super'], correct: 1, marks: 2 },
        { id: 'q5', text: 'Polymorphism allows?', options: ['Multiple classes', 'One interface, many implementations', 'Data hiding', 'Code reuse only'], correct: 1, marks: 2 },
        { id: 'q6', text: 'A constructor is called when?', options: ['Object is destroyed', 'Object is created', 'Method is called', 'Class is loaded'], correct: 1, marks: 2 }
      ]
    },
    {
      id: 'ex4', title: 'Computer Networks', subject: 'Networking',
      duration: 35, passingMarks: 60, status: 'draft',
      description: 'Network protocols, OSI model, TCP/IP and network security fundamentals.',
      createdBy: 'u4',
      questions: [
        { id: 'q1', text: 'The OSI model has how many layers?', options: ['5', '6', '7', '4'], correct: 2, marks: 2 },
        { id: 'q2', text: 'TCP is a _____ protocol?', options: ['Connectionless', 'Connection-oriented', 'Broadcast', 'Unicast'], correct: 1, marks: 2 },
        { id: 'q3', text: 'IP address 192.168.x.x belongs to which class?', options: ['Class A', 'Class B', 'Class C', 'Class D'], correct: 2, marks: 2 },
        { id: 'q4', text: 'DNS translates?', options: ['IP to MAC', 'Domain names to IPs', 'IPs to ports', 'MAC to IP'], correct: 1, marks: 2 }
      ]
    }
  ],
  results: [
    { id: 'r1', studentId: 'u1', examId: 'ex2', score: 14, total: 16, percentage: 87.5, grade: 'A', passed: true, date: '2026-09-15', answers: [1,0,1,1,2,1,2,2] },
    { id: 'r2', studentId: 'u1', examId: 'ex3', score: 8, total: 12, percentage: 66.7, grade: 'C', passed: true, date: '2026-09-20', answers: [2,1,1,1,1,1] },
    { id: 'r3', studentId: 'u2', examId: 'ex1', score: 18, total: 20, percentage: 90, grade: 'A', passed: true, date: '2026-09-18', answers: [1,2,2,2,1,2,1,1,1,2] },
    { id: 'r4', studentId: 'u3', examId: 'ex1', score: 10, total: 20, percentage: 50, grade: 'F', passed: false, date: '2026-09-22', answers: [1,2,0,2,1,2,1,1,1,2] },
    { id: 'r5', studentId: 'u3', examId: 'ex2', score: 12, total: 16, percentage: 75, grade: 'B', passed: true, date: '2026-09-25', answers: [1,0,1,1,2,1,2,2] }
  ]
};

// ─── UTILITIES ───
function showPage(pageId, role) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) { page.classList.add('active'); window.scrollTo(0, 0); }
  if (role) { currentRole = role; switchLoginRole(role); }
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.className = 'toast', 3500);
}

function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function getGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

function getGradeClass(grade) {
  if (grade.startsWith('A')) return 'grade-A';
  if (grade.startsWith('B')) return 'grade-B';
  if (grade.startsWith('C')) return 'grade-C';
  return 'grade-D';
}

function getExamById(id) { return DB.exams.find(e => e.id === id); }
function getUserById(id) { return DB.users.find(u => u.id === id); }
function getResultsForStudent(studentId) { return DB.results.filter(r => r.studentId === studentId); }
function hasStudentTakenExam(studentId, examId) { return DB.results.some(r => r.studentId === studentId && r.examId === examId); }

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── AUTH ───
function switchLoginRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(`tab-${role}`);
  if (tab) tab.classList.add('active');
  const title = document.getElementById('login-title');
  if (title) title.textContent = role === 'admin' ? 'Admin Login' : 'Student Login';
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');

  const user = DB.users.find(u => u.email === email && u.password === pass);

  if (!user) {
    errEl.textContent = 'Invalid email or password. Please try again.';
    return;
  }

  if (user.role !== currentRole) {
    errEl.textContent = `This account is registered as a ${user.role}. Please use the correct login tab.`;
    return;
  }

  errEl.textContent = '';
  currentUser = user;
  showToast(`Welcome back, ${user.name}! 🎉`);

  if (user.role === 'admin') {
    initAdminDashboard();
    showPage('page-admin');
  } else {
    initStudentDashboard();
    showPage('page-student');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const sid = document.getElementById('reg-sid').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const dept = document.getElementById('reg-dept').value;
  const course = document.getElementById('reg-course').value;
  const pass = document.getElementById('reg-password').value;
  const errEl = document.getElementById('reg-error');

  if (DB.users.find(u => u.email === email)) {
    errEl.textContent = 'Email already registered. Please login.';
    return;
  }
  if (pass.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  const newUser = {
    id: 'u' + Date.now(),
    name, email, password: pass,
    role: 'student',
    studentId: sid,
    department: dept,
    course,
    avatar: '👨‍🎓'
  };

  DB.users.push(newUser);
  currentUser = newUser;
  showToast('Account created successfully! 🎉');
  initStudentDashboard();
  showPage('page-student');
}

function logout() {
  currentUser = null;
  currentExam = null;
  clearInterval(examTimerInterval);
  showToast('Logged out successfully');
  showPage('page-landing');
}

// ─── STUDENT DASHBOARD ───
function initStudentDashboard() {
  if (!currentUser) return;

  // Welcome
  document.getElementById('student-welcome').textContent = `Welcome back, ${currentUser.name}! 👋`;

  // User info in sidebar
  document.getElementById('student-user-info').innerHTML = `
    <div style="font-weight:700;font-size:0.9rem;">${currentUser.avatar} ${currentUser.name}</div>
    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;">${currentUser.studentId} • ${currentUser.department}</div>
  `;

  renderStudentStats();
  renderUpcomingExams();
  renderRecentResults();
  renderAvailableExams();
  renderStudentResults();
  renderStudentProfile();
}

function renderStudentStats() {
  const results = getResultsForStudent(currentUser.id);
  const liveExams = DB.exams.filter(e => e.status === 'live').length;
  const taken = results.length;
  const avg = taken > 0 ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / taken) : 0;
  const best = taken > 0 ? Math.max(...results.map(r => r.percentage)) : 0;

  document.getElementById('student-stats').innerHTML = `
    <div class="stat-box">
      <div class="stat-box-icon">📝</div>
      <div class="stat-box-val" style="color:var(--accent-1)">${liveExams}</div>
      <div class="stat-box-label">Available Exams</div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon">✅</div>
      <div class="stat-box-val" style="color:var(--accent-2)">${taken}</div>
      <div class="stat-box-label">Exams Taken</div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon">📊</div>
      <div class="stat-box-val" style="color:var(--accent-4)">${avg}%</div>
      <div class="stat-box-label">Average Score</div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon">🏆</div>
      <div class="stat-box-val" style="color:var(--success)">${best}%</div>
      <div class="stat-box-label">Best Score</div>
    </div>
  `;
}

function renderUpcomingExams() {
  const liveExams = DB.exams.filter(e => e.status === 'live' && !hasStudentTakenExam(currentUser.id, e.id));
  const el = document.getElementById('upcoming-exams-list');
  if (!liveExams.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:1rem 0;">All caught up! No pending exams. 🎉</p>';
    return;
  }
  el.innerHTML = liveExams.slice(0, 3).map(ex => `
    <div class="list-item">
      <div class="list-item-left">
        <div class="list-item-title">${ex.title}</div>
        <div class="list-item-sub">⏱ ${ex.duration} min • ${ex.questions.length} questions</div>
      </div>
      <button class="btn btn-primary" style="font-size:0.8rem;padding:0.4rem 0.8rem" onclick="startExam('${ex.id}')">Start</button>
    </div>
  `).join('');
}

function renderRecentResults() {
  const results = getResultsForStudent(currentUser.id).slice(0, 3);
  const el = document.getElementById('recent-results-list');
  if (!results.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:1rem 0;">No results yet. Take an exam to get started!</p>';
    return;
  }
  el.innerHTML = results.map(r => {
    const exam = getExamById(r.examId);
    return `
      <div class="list-item">
        <div class="list-item-left">
          <div class="list-item-title">${exam ? exam.title : 'Exam'}</div>
          <div class="list-item-sub">${formatDate(r.date)}</div>
        </div>
        <span class="grade-chip ${getGradeClass(r.grade)}">${r.percentage}%</span>
      </div>
    `;
  }).join('');
}

function renderAvailableExams() {
  const exams = DB.exams.filter(e => e.status === 'live');
  const el = document.getElementById('exam-cards');
  el.innerHTML = exams.map(ex => {
    const taken = hasStudentTakenExam(currentUser.id, ex.id);
    const result = DB.results.find(r => r.studentId === currentUser.id && r.examId === ex.id);
    return `
      <div class="exam-card">
        <div class="exam-card-header">
          <div>
            <div class="exam-card-title">${ex.title}</div>
            <div class="exam-card-subject">${ex.subject}</div>
          </div>
          <span class="exam-badge ${taken ? 'badge-completed' : 'badge-live'}">${taken ? 'Done' : '🟢 Live'}</span>
        </div>
        <div class="exam-card-info">
          <span>⏱ ${ex.duration} mins</span>
          <span>❓ ${ex.questions.length} Qs</span>
          <span>🎯 Pass: ${ex.passingMarks}%</span>
        </div>
        <div class="exam-card-desc">${ex.description}</div>
        <div class="exam-card-actions">
          ${taken
            ? `<button class="btn btn-outline" style="flex:1" disabled>✅ Completed ${result ? '('+Math.round(result.percentage)+'%)' : ''}</button>`
            : `<button class="btn btn-primary" style="flex:1" onclick="startExam('${ex.id}')">Start Exam →</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

function renderStudentResults() {
  const results = getResultsForStudent(currentUser.id);
  const el = document.getElementById('results-container');
  if (!results.length) {
    el.innerHTML = '<div class="card glass" style="text-align:center;padding:3rem"><div style="font-size:3rem;margin-bottom:1rem">📋</div><h3>No results yet</h3><p style="color:var(--text-muted);margin-top:0.5rem">Complete an exam to see your results here.</p></div>';
    return;
  }
  el.innerHTML = results.map(r => {
    const exam = getExamById(r.examId);
    return `
      <div class="result-row">
        <div>
          <div style="font-weight:700;margin-bottom:0.25rem">${exam ? exam.title : 'Exam'}</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">${exam ? exam.subject : ''} • ${formatDate(r.date)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:1rem">
          <div style="text-align:right">
            <div style="font-size:0.85rem;color:var(--text-muted)">${r.score}/${r.total} marks</div>
            <div style="font-size:0.85rem;font-weight:600;color:${r.passed ? 'var(--success)':'var(--danger)'}">${r.passed ? '✅ Passed' : '❌ Failed'}</div>
          </div>
          <span class="grade-chip ${getGradeClass(r.grade)}">${r.grade} • ${Math.round(r.percentage)}%</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderStudentProfile() {
  const user = currentUser;
  const results = getResultsForStudent(user.id);
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;

  document.getElementById('profile-avatar-s').textContent = user.avatar || '🎓';
  document.getElementById('profile-details-s').innerHTML = `
    <div class="profile-detail-row"><span>Full Name</span><strong>${user.name}</strong></div>
    <div class="profile-detail-row"><span>Student ID</span><strong>${user.studentId || 'N/A'}</strong></div>
    <div class="profile-detail-row"><span>Email</span><strong>${user.email}</strong></div>
    <div class="profile-detail-row"><span>Department</span><strong>${user.department || 'N/A'}</strong></div>
    <div class="profile-detail-row"><span>Course</span><strong>${user.course || 'N/A'}</strong></div>
    <div class="profile-detail-row"><span>Exams Taken</span><strong>${results.length}</strong></div>
    <div class="profile-detail-row"><span>Average Score</span><strong style="color:var(--accent-2)">${avg}%</strong></div>
  `;

  // Performance bars
  const perf = results.map(r => {
    const exam = getExamById(r.examId);
    return { name: exam ? exam.title.split(' ')[0] : 'Exam', pct: Math.round(r.percentage) };
  });

  const colors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-4)', 'var(--success)', 'var(--danger)'];
  document.getElementById('performance-chart').innerHTML = perf.length
    ? perf.map((p, i) => `
        <div class="perf-bar-row">
          <div class="perf-bar-label">${p.name.substring(0, 8)}</div>
          <div class="perf-bar-track"><div class="perf-bar-fill" style="width:${p.pct}%;background:${colors[i % colors.length]};"></div></div>
          <div class="perf-bar-val">${p.pct}%</div>
        </div>
      `).join('')
    : '<p style="color:var(--text-muted);font-size:0.9rem">Take exams to see your performance analysis.</p>';
}

function studentTab(tab) {
  document.querySelectorAll('#page-student .tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#page-student .nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`stab-${tab}`).classList.add('active');
  document.getElementById(`snav-${tab}`).classList.add('active');
}

// ─── EXAM SYSTEM ───
function startExam(examId) {
  const exam = getExamById(examId);
  if (!exam) return;

  openModal(`
    <h3 style="margin-bottom:1rem">📋 Exam Instructions</h3>
    <div style="background:var(--bg-card);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;font-size:0.9rem;color:var(--text-secondary);line-height:1.7">
      <strong style="color:var(--text-primary)">${exam.title}</strong><br/><br/>
      • Duration: <strong>${exam.duration} minutes</strong><br/>
      • Questions: <strong>${exam.questions.length} MCQ questions</strong><br/>
      • Passing marks: <strong>${exam.passingMarks}%</strong><br/>
      • Each question carries equal marks<br/>
      • Exam auto-submits when time is up<br/>
      • You cannot re-take this exam
    </div>
    <div style="display:flex;gap:0.75rem;justify-content:flex-end">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="closeModal(); launchExam('${examId}')">Begin Exam →</button>
    </div>
  `);
}

function launchExam(examId) {
  currentExam = getExamById(examId);
  if (!currentExam) return;

  currentQuestionIdx = 0;
  examAnswers = {};
  examTimeLeft = currentExam.duration * 60;

  document.getElementById('exam-current-title').textContent = currentExam.title;
  showPage('page-exam');
  renderQuestion();
  buildNavigator();
  startTimer();
}

function renderQuestion() {
  const q = currentExam.questions[currentQuestionIdx];
  const total = currentExam.questions.length;

  document.getElementById('q-number').textContent = `Question ${currentQuestionIdx + 1}`;
  document.getElementById('q-text').textContent = q.text;
  document.getElementById('exam-question-counter').textContent = `Q ${currentQuestionIdx + 1} / ${total}`;

  const labels = ['A', 'B', 'C', 'D'];
  document.getElementById('options-container').innerHTML = q.options.map((opt, i) => `
    <button class="option-btn ${examAnswers[currentQuestionIdx] === i ? 'selected' : ''}"
      onclick="selectAnswer(${i})" id="opt-${i}">
      <span class="option-label">${labels[i]}</span>
      ${opt}
    </button>
  `).join('');

  document.getElementById('btn-prev').disabled = currentQuestionIdx === 0;
  document.getElementById('btn-next').textContent = currentQuestionIdx === total - 1 ? 'Review' : 'Next →';
  buildNavigator();
}

function selectAnswer(idx) {
  examAnswers[currentQuestionIdx] = idx;
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });
  buildNavigator();
}

function prevQuestion() {
  if (currentQuestionIdx > 0) {
    currentQuestionIdx--;
    renderQuestion();
  }
}

function nextQuestion() {
  if (currentQuestionIdx < currentExam.questions.length - 1) {
    currentQuestionIdx++;
    renderQuestion();
  }
}

function buildNavigator() {
  const container = document.getElementById('q-navigator');
  container.innerHTML = currentExam.questions.map((_, i) => `
    <button class="q-nav-btn ${i === currentQuestionIdx ? 'current' : examAnswers[i] !== undefined ? 'answered' : ''}"
      onclick="goToQuestion(${i})">${i + 1}</button>
  `).join('');
}

function goToQuestion(idx) {
  currentQuestionIdx = idx;
  renderQuestion();
}

function startTimer() {
  clearInterval(examTimerInterval);
  updateTimerDisplay();
  examTimerInterval = setInterval(() => {
    examTimeLeft--;
    updateTimerDisplay();
    if (examTimeLeft <= 0) {
      clearInterval(examTimerInterval);
      showToast('⏰ Time is up! Submitting exam...', 'error');
      setTimeout(submitExam, 1500);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(examTimeLeft / 60).toString().padStart(2, '0');
  const secs = (examTimeLeft % 60).toString().padStart(2, '0');
  const display = document.getElementById('timer-display');
  const timer = document.getElementById('exam-timer');
  if (display) {
    display.textContent = `${mins}:${secs}`;
    timer.className = 'timer glass';
    if (examTimeLeft <= 60) timer.classList.add('danger');
    else if (examTimeLeft <= 300) timer.classList.add('warning');
  }
}

function confirmSubmit() {
  const answered = Object.keys(examAnswers).length;
  const total = currentExam.questions.length;
  openModal(`
    <h3 style="margin-bottom:1rem">⚠️ Submit Exam?</h3>
    <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;font-size:0.9rem">
      Answered: <strong>${answered}</strong> / ${total} questions<br/>
      ${answered < total ? `<span style="color:var(--warning)">⚠ You have ${total - answered} unanswered question(s).</span>` : '<span style="color:var(--success)">✅ All questions answered.</span>'}
    </div>
    <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1.5rem">Once submitted, you cannot change your answers.</p>
    <div style="display:flex;gap:0.75rem;justify-content:flex-end">
      <button class="btn btn-outline" onclick="closeModal()">Continue Exam</button>
      <button class="btn btn-danger" onclick="closeModal(); submitExam()">Submit Now</button>
    </div>
  `);
}

function submitExam() {
  clearInterval(examTimerInterval);

  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  const totalMarks = currentExam.questions.reduce((a, q) => a + q.marks, 0);

  currentExam.questions.forEach((q, i) => {
    if (examAnswers[i] === undefined) {
      skipped++;
    } else if (examAnswers[i] === q.correct) {
      score += q.marks;
      correct++;
    } else {
      wrong++;
    }
  });

  const percentage = Math.round((score / totalMarks) * 100);
  const grade = getGrade(percentage);
  const passed = percentage >= currentExam.passingMarks;

  const result = {
    id: 'r' + Date.now(),
    studentId: currentUser.id,
    examId: currentExam.id,
    score,
    total: totalMarks,
    percentage,
    grade,
    passed,
    date: new Date().toISOString().split('T')[0],
    answers: currentExam.questions.map((_, i) => examAnswers[i] !== undefined ? examAnswers[i] : -1)
  };

  DB.results.push(result);
  lastExamResult = { result, correct, wrong, skipped };

  showResultPage(result, correct, wrong, skipped);
  initStudentDashboard();
}

function showResultPage(result, correct, wrong, skipped) {
  showPage('page-result');

  const icons = { 'A+': '🏆', 'A': '🥇', 'B': '🥈', 'C': '🥉', 'D': '😔', 'F': '❌' };
  document.getElementById('result-icon').textContent = icons[result.grade] || '📊';
  document.getElementById('result-exam-name').textContent = getExamById(result.examId)?.title || 'Exam Complete!';
  document.getElementById('result-score-pct').textContent = result.percentage + '%';
  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-wrong').textContent = wrong;
  document.getElementById('res-skipped').textContent = skipped;
  document.getElementById('res-grade').textContent = result.grade;

  const statusEl = document.getElementById('result-status-msg');
  statusEl.textContent = result.passed ? '🎉 Congratulations! You passed the exam!' : '📚 Keep studying! You can do better next time.';
  statusEl.className = `result-status ${result.passed ? 'pass' : 'fail'}`;

  // Animate ring
  const circumference = 314;
  const offset = circumference - (result.percentage / 100) * circumference;
  setTimeout(() => {
    const ring = document.getElementById('result-ring');
    if (ring) ring.style.strokeDashoffset = offset;
  }, 300);
}

function reviewAnswers() {
  if (!lastExamResult) return;
  const { result } = lastExamResult;
  const exam = getExamById(result.examId);
  const labels = ['A', 'B', 'C', 'D'];

  document.getElementById('review-list').innerHTML = exam.questions.map((q, i) => {
    const studentAns = result.answers[i];
    const isSkipped = studentAns === -1 || studentAns === undefined;
    const isCorrect = !isSkipped && studentAns === q.correct;
    const statusClass = isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong';
    const statusText = isSkipped ? 'Skipped' : isCorrect ? 'Correct ✓' : 'Wrong ✗';

    return `
      <div class="review-item ${statusClass}">
        <div class="review-q-header">
          <span class="review-q-num">Question ${i + 1}</span>
          <span class="review-status ${statusClass}">${statusText}</span>
        </div>
        <div class="review-q-text">${q.text}</div>
        <div class="review-answers">
          ${q.options.map((opt, j) => {
            let color = '';
            if (j === q.correct) color = 'color:var(--success);font-weight:600';
            else if (!isSkipped && j === studentAns && !isCorrect) color = 'color:var(--danger);text-decoration:line-through';
            return `<div class="review-answer-row" style="${color}"><span>${labels[j]}.</span> <span>${opt}</span>${j === q.correct ? ' ✓' : ''}</div>`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  showPage('page-review');
}

// ─── ADMIN DASHBOARD ───
function initAdminDashboard() {
  renderAdminStats();
  renderAdminRecentExams();
  renderAdminTopStudents();
  renderGradeDistribution();
  renderManageExams();
  renderAdminResults();
  renderStudentsTable();
  renderAdminDiagrams();
  initExamBuilder();
}

function renderAdminStats() {
  const totalStudents = DB.users.filter(u => u.role === 'student').length;
  const totalExams = DB.exams.length;
  const liveExams = DB.exams.filter(e => e.status === 'live').length;
  const totalResults = DB.results.length;
  const avgScore = totalResults > 0 ? Math.round(DB.results.reduce((a, r) => a + r.percentage, 0) / totalResults) : 0;
  const passRate = totalResults > 0 ? Math.round(DB.results.filter(r => r.passed).length / totalResults * 100) : 0;

  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-box">
      <div class="stat-box-icon">👥</div>
      <div class="stat-box-val" style="color:var(--accent-1)">${totalStudents}</div>
      <div class="stat-box-label">Total Students</div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon">📝</div>
      <div class="stat-box-val" style="color:var(--accent-2)">${totalExams}</div>
      <div class="stat-box-label">Total Exams</div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon">🟢</div>
      <div class="stat-box-val" style="color:var(--success)">${liveExams}</div>
      <div class="stat-box-label">Live Exams</div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon">📊</div>
      <div class="stat-box-val" style="color:var(--accent-4)">${avgScore}%</div>
      <div class="stat-box-label">Avg. Score</div>
    </div>
    <div class="stat-box">
      <div class="stat-box-icon">🏆</div>
      <div class="stat-box-val" style="color:var(--accent-2)">${passRate}%</div>
      <div class="stat-box-label">Pass Rate</div>
    </div>
  `;
}

function renderAdminRecentExams() {
  const el = document.getElementById('admin-recent-exams');
  el.innerHTML = DB.exams.slice(0, 4).map(ex => `
    <div class="list-item">
      <div class="list-item-left">
        <div class="list-item-title">${ex.title}</div>
        <div class="list-item-sub">${ex.questions.length} questions • ${ex.duration} min</div>
      </div>
      <span class="exam-badge ${ex.status === 'live' ? 'badge-live' : 'badge-draft'}">${ex.status}</span>
    </div>
  `).join('');
}

function renderAdminTopStudents() {
  const students = DB.users.filter(u => u.role === 'student');
  const studentStats = students.map(s => {
    const results = getResultsForStudent(s.id);
    const avg = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;
    return { ...s, avg, taken: results.length };
  }).filter(s => s.taken > 0).sort((a, b) => b.avg - a.avg);

  const el = document.getElementById('admin-top-students');
  if (!studentStats.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:1rem 0;">No results yet.</p>';
    return;
  }
  el.innerHTML = studentStats.slice(0, 5).map((s, i) => `
    <div class="list-item">
      <div class="list-item-left">
        <div class="list-item-title">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} ${s.name}</div>
        <div class="list-item-sub">${s.department} • ${s.taken} exam(s)</div>
      </div>
      <span class="grade-chip ${getGradeClass(getGrade(s.avg))}">${s.avg}%</span>
    </div>
  `).join('');
}

function renderGradeDistribution() {
  const grades = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  DB.results.forEach(r => { if (grades[r.grade] !== undefined) grades[r.grade]++; });
  const max = Math.max(...Object.values(grades), 1);
  const colors = {
    'A+': 'linear-gradient(90deg, #6c63ff, #00d4aa)',
    'A': 'linear-gradient(90deg, #00d4aa, #10b981)',
    'B': 'linear-gradient(90deg, #6c63ff, #8b5cf6)',
    'C': 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    'D': 'linear-gradient(90deg, #f97316, #fb923c)',
    'F': 'linear-gradient(90deg, #ef4444, #dc2626)'
  };

  document.getElementById('grade-bars').innerHTML = Object.entries(grades).map(([grade, count]) => `
    <div class="grade-bar-row">
      <span class="grade-bar-label">${grade}</span>
      <div class="grade-bar-track"><div class="grade-bar-fill" style="width:${(count/max*100)}%;background:${colors[grade]}"></div></div>
      <span class="grade-bar-count">${count}</span>
    </div>
  `).join('');
}

function renderManageExams() {
  const el = document.getElementById('manage-exams-list');
  el.innerHTML = DB.exams.map(ex => `
    <div class="manage-exam-item">
      <div class="manage-exam-info">
        <h4>${ex.title}</h4>
        <p>${ex.subject} • ${ex.questions.length} questions • ${ex.duration} min • Passing: ${ex.passingMarks}%</p>
      </div>
      <div class="manage-exam-actions">
        <span class="exam-badge ${ex.status === 'live' ? 'badge-live' : 'badge-draft'}">${ex.status}</span>
        <button class="btn btn-outline" style="font-size:0.8rem;padding:0.4rem 0.8rem"
          onclick="toggleExamStatus('${ex.id}')">
          ${ex.status === 'live' ? '🔴 Unpublish' : '🟢 Publish'}
        </button>
        <button class="btn btn-outline" style="font-size:0.8rem;padding:0.4rem 0.8rem" onclick="viewExamDetails('${ex.id}')">👁 View</button>
      </div>
    </div>
  `).join('');
}

function toggleExamStatus(examId) {
  const exam = getExamById(examId);
  if (!exam) return;
  exam.status = exam.status === 'live' ? 'draft' : 'live';
  showToast(`Exam ${exam.status === 'live' ? 'published' : 'unpublished'} successfully!`);
  renderManageExams();
  renderAdminRecentExams();
  renderAvailableExams();
}

function viewExamDetails(examId) {
  const exam = getExamById(examId);
  const results = DB.results.filter(r => r.examId === examId);
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;

  openModal(`
    <h3 style="margin-bottom:1rem">${exam.title}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;font-size:0.85rem">
      <div class="stat-box" style="padding:0.75rem"><div style="color:var(--text-muted)">Subject</div><strong>${exam.subject}</strong></div>
      <div class="stat-box" style="padding:0.75rem"><div style="color:var(--text-muted)">Duration</div><strong>${exam.duration} min</strong></div>
      <div class="stat-box" style="padding:0.75rem"><div style="color:var(--text-muted)">Questions</div><strong>${exam.questions.length}</strong></div>
      <div class="stat-box" style="padding:0.75rem"><div style="color:var(--text-muted)">Attempts</div><strong>${results.length}</strong></div>
      <div class="stat-box" style="padding:0.75rem"><div style="color:var(--text-muted)">Avg Score</div><strong style="color:var(--accent-2)">${avg}%</strong></div>
      <div class="stat-box" style="padding:0.75rem"><div style="color:var(--text-muted)">Pass Rate</div><strong>${results.length ? Math.round(results.filter(r=>r.passed).length/results.length*100) : 0}%</strong></div>
    </div>
    <button class="btn btn-outline btn-full" onclick="closeModal()">Close</button>
  `);
}

function renderAdminResults() {
  const el = document.getElementById('admin-results-container');
  const allResults = DB.results.map(r => {
    const exam = getExamById(r.examId);
    const student = getUserById(r.studentId);
    return { ...r, examTitle: exam?.title || 'Exam', studentName: student?.name || 'Unknown' };
  }).sort((a, b) => b.percentage - a.percentage);

  el.innerHTML = `
    <div class="table-container card glass">
      <table>
        <thead>
          <tr>
            <th>Student</th><th>Exam</th><th>Score</th><th>Percentage</th><th>Grade</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${allResults.map(r => `
            <tr>
              <td><strong>${r.studentName}</strong></td>
              <td>${r.examTitle}</td>
              <td>${r.score}/${r.total}</td>
              <td><div style="display:flex;align-items:center;gap:0.5rem">
                <div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
                  <div style="width:${r.percentage}%;height:100%;background:linear-gradient(90deg,var(--accent-1),var(--accent-2))"></div>
                </div>
                ${Math.round(r.percentage)}%
              </div></td>
              <td><span class="grade-chip ${getGradeClass(r.grade)}">${r.grade}</span></td>
              <td style="color:${r.passed ? 'var(--success)' : 'var(--danger)'}">${r.passed ? '✅ Passed' : '❌ Failed'}</td>
              <td style="color:var(--text-muted)">${formatDate(r.date)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStudentsTable() {
  const students = DB.users.filter(u => u.role === 'student').map(s => {
    const results = getResultsForStudent(s.id);
    const avg = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;
    return { ...s, avg, taken: results.length };
  });

  document.getElementById('students-table-container').innerHTML = `
    <div class="table-container card glass">
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Student ID</th><th>Department</th><th>Course</th><th>Exams Taken</th><th>Avg Score</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td><strong>${s.avatar || '🎓'} ${s.name}</strong></td>
              <td>${s.studentId || '-'}</td>
              <td>${s.department || '-'}</td>
              <td>${s.course || '-'}</td>
              <td>${s.taken}</td>
              <td><span class="grade-chip ${getGradeClass(getGrade(s.avg))}">${s.avg ? s.avg + '%' : 'N/A'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── DIAGRAMS ───
const diagramsData = [
  {
    title: 'ER (Entity-Relationship) Diagram',
    description: 'Shows entities: User, Student, Admin, Exam, Question, Result, Answer — with their attributes and relationships.',
    img: 'er_diagram.jpg',
    type: 'er'
  },
  {
    title: 'Use Case Diagram',
    description: 'Illustrates system actors (Student & Admin) and their interactions with the Online Examination System.',
    img: 'use_case_diagram.jpg',
    type: 'usecase'
  },
  {
    title: 'Activity Diagram',
    description: 'Models the workflow for both Student (exam-taking flow) and Admin (exam management) with decision nodes.',
    img: 'activity_diagram.jpg',
    type: 'activity'
  },
  {
    title: 'Data Flow Diagram (DFD)',
    description: 'Level 1 DFD showing data flows between external entities, processes, and data stores using Gane-Sarson notation.',
    img: 'dfd_diagram.jpg',
    type: 'dfd'
  }
];

function renderAdminDiagrams() {
  document.getElementById('admin-diagrams-grid').innerHTML = diagramsData.map(d => `
    <div class="diagram-card" onclick="openDiagramModal('${d.type}')">
      <img src="${d.img}" alt="${d.title}" onerror="this.style.display='none'" />
      <div class="diagram-card-info">
        <h3>${d.title}</h3>
        <p>${d.description}</p>
        <button class="btn btn-outline" style="font-size:0.8rem;padding:0.35rem 0.75rem;margin-top:0.75rem">🔍 View Full</button>
      </div>
    </div>
  `).join('');
}

function renderMainDiagrams() {
  document.getElementById('main-diagrams-grid').innerHTML = diagramsData.map(d => `
    <div class="diagram-section">
      <div class="diagram-section-header">
        <h2>${d.title}</h2>
        <p>${d.description}</p>
      </div>
      <div class="diagram-section-body">
        <img src="${d.img}" alt="${d.title}" onerror="this.parentElement.innerHTML='<div style=\'padding:2rem;text-align:center;color:var(--text-muted)\'>Diagram image not found. Check that diagram images are in the same folder as index.html.</div>'" />
      </div>
    </div>
  `).join('');
}

function openDiagramModal(type) {
  const d = diagramsData.find(x => x.type === type);
  if (!d) return;
  openModal(`
    <h3 style="margin-bottom:1rem">${d.title}</h3>
    <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">${d.description}</p>
    <img src="${d.img}" alt="${d.title}" style="width:100%;border-radius:var(--radius-sm)" 
      onerror="this.outerHTML='<p style=\'color:var(--text-muted);text-align:center;padding:2rem\'>Image file not found. Ensure diagram images are in the same folder as index.html.</p>'" />
    <button class="btn btn-outline btn-full" style="margin-top:1rem" onclick="closeModal()">Close</button>
  `);
}

// ─── EXAM BUILDER ───
let questionCount = 0;

function initExamBuilder() {
  questionCount = 0;
  document.getElementById('questions-builder').innerHTML = '';
  addQuestion();
}

function addQuestion() {
  questionCount++;
  const qId = `qb-${questionCount}`;
  const div = document.createElement('div');
  div.className = 'question-builder-item';
  div.id = qId;
  div.innerHTML = `
    <div class="q-builder-header">
      <h4>Question ${questionCount}</h4>
      <button class="btn btn-ghost" style="font-size:0.85rem;color:var(--danger)" onclick="removeQuestion('${qId}')">✕ Remove</button>
    </div>
    <div class="form-group">
      <label>Question Text</label>
      <textarea id="${qId}-text" placeholder="Enter your question here..."></textarea>
    </div>
    <div class="q-options-grid">
      <div class="form-group"><label>Option A</label><input type="text" id="${qId}-oa" placeholder="Option A" /></div>
      <div class="form-group"><label>Option B</label><input type="text" id="${qId}-ob" placeholder="Option B" /></div>
      <div class="form-group"><label>Option C</label><input type="text" id="${qId}-oc" placeholder="Option C" /></div>
      <div class="form-group"><label>Option D</label><input type="text" id="${qId}-od" placeholder="Option D" /></div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Correct Answer</label>
        <select id="${qId}-correct">
          <option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option>
        </select>
      </div>
      <div class="form-group">
        <label>Marks</label>
        <input type="number" id="${qId}-marks" value="2" min="1" max="10" />
      </div>
    </div>
  `;
  document.getElementById('questions-builder').appendChild(div);
}

function removeQuestion(qId) {
  const el = document.getElementById(qId);
  if (el) el.remove();
}

function saveExamDraft() {
  createExamFromForm('draft');
}

function publishExam() {
  createExamFromForm('live');
}

function createExamFromForm(status) {
  const title = document.getElementById('new-exam-title').value.trim();
  const subject = document.getElementById('new-exam-subject').value.trim();
  const duration = parseInt(document.getElementById('new-exam-duration').value);
  const passing = parseInt(document.getElementById('new-exam-passing').value);
  const desc = document.getElementById('new-exam-desc').value.trim();

  if (!title || !subject || !duration || !passing) {
    showToast('Please fill in all exam details.', 'error');
    return;
  }

  const qItems = document.querySelectorAll('.question-builder-item');
  const questions = [];
  let valid = true;

  qItems.forEach((item, i) => {
    const id = item.id;
    const text = document.getElementById(`${id}-text`)?.value.trim();
    const oa = document.getElementById(`${id}-oa`)?.value.trim();
    const ob = document.getElementById(`${id}-ob`)?.value.trim();
    const oc = document.getElementById(`${id}-oc`)?.value.trim();
    const od = document.getElementById(`${id}-od`)?.value.trim();
    const correct = parseInt(document.getElementById(`${id}-correct`)?.value);
    const marks = parseInt(document.getElementById(`${id}-marks`)?.value);

    if (!text || !oa || !ob) { valid = false; return; }

    questions.push({
      id: `q${i + 1}`,
      text,
      options: [oa, ob, oc || 'N/A', od || 'N/A'],
      correct: isNaN(correct) ? 0 : correct,
      marks: isNaN(marks) ? 2 : marks
    });
  });

  if (!valid || !questions.length) {
    showToast('Please complete all question fields.', 'error');
    return;
  }

  const newExam = {
    id: 'ex' + Date.now(),
    title, subject, duration, passingMarks: passing,
    description: desc || 'No description provided.',
    status,
    createdBy: currentUser.id,
    questions
  };

  DB.exams.push(newExam);
  showToast(`Exam ${status === 'live' ? 'published' : 'saved as draft'} successfully! 🎉`);

  initExamBuilder();
  document.getElementById('new-exam-title').value = '';
  document.getElementById('new-exam-subject').value = '';
  document.getElementById('new-exam-duration').value = '';
  document.getElementById('new-exam-passing').value = '';
  document.getElementById('new-exam-desc').value = '';

  adminTab('manage-exams');
  renderManageExams();
  renderAdminStats();
}

function adminTab(tab) {
  document.querySelectorAll('#page-admin .tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#page-admin .nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`atab-${tab}`).classList.add('active');
  const navBtn = document.getElementById(`anav-${tab}`);
  if (navBtn) navBtn.classList.add('active');
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  // Default to student login tab
  switchLoginRole('student');
});
