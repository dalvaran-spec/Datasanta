// Clave de almacenamiento local para persistir usuarios entre recargas.
const STORAGE_KEY = "adminUsersData";

// Catálogo base de materias, periodos y tipos de notas que usa toda la app.
const SCHOOL_SUBJECTS = [
  "Matemáticas",
  "Lengua",
  "Ciencias",
  "Historia",
  "Inglés",
  "Arte",
  "Educación Física"
];

const SCHOOL_PERIODS = [
  "Periodo 1",
  "Periodo 2",
  "Periodo 3",
  "Periodo 4"
];

const GRADE_LABELS = [
  "Taller 1",
  "Taller 2",
  "Taller 3",
  "Quiz 1",
  "Quiz 2",
  "Parcial 1",
  "Parcial 2",
  "Proyecto",
  "Final"
];

const defaultUsers = [
  { id: 1, name: "María Pérez", email: "maria.perez@example.com", role: "Usuario", password: "maria123", notes: ["Comprar útiles escolares", "Entregar tarea de Lengua", "Avisar sobre la excursión", "Revisar horario de Matemáticas"], grades: { "Matemáticas": [85, 92], "Lengua": [78, 88], "Ciencias": [90], "Historia": [84], "Inglés": [91], "Arte": [87], "Educación Física": [95] } },
  { id: 2, name: "Jorge Díaz", email: "jorge.diaz@example.com", role: "Admin", password: "jorge123", notes: ["Revisar reportes de la semana", "Preparar reunión con padres", "Actualizar lista de asistencia", "Coordinar actividades del colegio"], grades: { "Matemáticas": [95, 90], "Lengua": [86, 89], "Ciencias": [92], "Historia": [88], "Inglés": [93], "Arte": [84], "Educación Física": [96] } },
  { id: 3, name: "Lucía Gómez", email: "lucia.gomez@example.com", role: "Invitado", password: "lucia123", notes: ["Leer la guía de estudio", "Entregar borrador del proyecto", "Revisar calendario de exámenes", "Pedir apoyo en Matemáticas"], grades: { "Matemáticas": [80, 83], "Lengua": [91, 87], "Ciencias": [78], "Historia": [82], "Inglés": [89], "Arte": [90], "Educación Física": [92] } },
  { id: 4, name: "Carlos Núñez", email: "carlos.nunez@example.com", role: "Usuario", password: "carlos123", notes: ["Enviar factura", "Confirmar pago de uniforme", "Revisar comunicación del tutor", "Practicar lectura en voz alta"], grades: { "Matemáticas": [60, 72], "Lengua": [84, 79], "Ciencias": [75], "Historia": [70], "Inglés": [68], "Arte": [77], "Educación Física": [88] } },
  { id: 5, name: "Ana Torres", email: "ana.torres@example.com", role: "Usuario", password: "ana123", notes: ["Reservar sala", "Preparar presentación", "Repasar contenido de Historia", "Organizar material de Ciencias"], grades: { "Matemáticas": [89, 93], "Lengua": [88, 84], "Ciencias": [91], "Historia": [86], "Inglés": [90], "Arte": [94], "Educación Física": [97] } },
  { id: 6, name: "Patricia Ruiz", email: "patricia.ruiz@example.com", role: "Invitado", password: "patricia123", notes: ["Leer artículo sobre UX", "Anotar ideas para clase", "Repasar lista de materiales", "Revisar actividad de Inglés"], grades: { "Matemáticas": [87, 85], "Lengua": [90, 92], "Ciencias": [88], "Historia": [79], "Inglés": [93], "Arte": [95], "Educación Física": [90] } }
];

const defaultUsersById = new Map(defaultUsers.map((user) => [user.id, user]));

let users = cargarUsuarios();
let selectedUserId = null;
let currentSessionUserId = null;
let currentSelectedPeriod = SCHOOL_PERIODS[0];
let currentSelectedSubject = SCHOOL_SUBJECTS[0];
let adminSelectedPeriod = SCHOOL_PERIODS[0];
let adminSelectedSubject = SCHOOL_SUBJECTS[0];

const SUBJECT_ICONS = {
  "Matemáticas": "🔢",
  "Lengua": "✍️",
  "Ciencias": "🧪",
  "Historia": "📜",
  "Inglés": "🌍",
  "Arte": "🎨",
  "Educación Física": "⚽"
};

function normalizeUser(user) {
  const defaultUser = defaultUsersById.get(user?.id) || {};
  const name = typeof user?.name === "string" && user.name.trim() ? user.name.trim() : (defaultUser.name || "");
  const email = typeof user?.email === "string" && user.email.trim() ? user.email.trim() : (defaultUser.email || "");
  const password = typeof user?.password === "string" && user.password.trim() ? user.password.trim() : (defaultUser.password || "");
  const role = typeof user?.role === "string" && user.role.trim() ? user.role.trim() : (defaultUser.role || "Usuario");
  const id = Number.isFinite(Number(user?.id)) ? Number(user.id) : (defaultUser.id || Date.now());
  const normalizedGrades = {};

  SCHOOL_SUBJECTS.forEach((subject) => {
    const subjectGrades = user?.grades?.[subject];
    normalizedGrades[subject] = normalizeSubjectGrades(subjectGrades);
  });

  return {
    ...defaultUser,
    ...user,
    id,
    name,
    email,
    password,
    role,
    notes: Array.isArray(user.notes) ? [...user.notes] : [],
    grades: normalizedGrades
  };
}

function restoreDefaultUsers() {
  users = defaultUsers.map(normalizeUser);
  guardarUsuarios();
  currentSessionUserId = null;
  selectedUserId = null;
  currentSelectedPeriod = SCHOOL_PERIODS[0];
  currentSelectedSubject = SCHOOL_SUBJECTS[0];
  adminSelectedPeriod = SCHOOL_PERIODS[0];
  adminSelectedSubject = SCHOOL_SUBJECTS[0];
  renderUsers();
}

function generateRandomGrades() {
  return Array.from({ length: 3 }, (_, index) => ({
    label: GRADE_LABELS[index] || `Nota ${index + 1}`,
    value: Math.floor(Math.random() * 5) + 1
  }));
}

function parseGradeInput(value) {
  const normalizedValue = String(value || "").trim().replace(",", ".");
  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    return NaN;
  }

  return numericValue;
}

function normalizeStoredGradeValue(value) {
  const numericValue = parseGradeInput(value);

  if (!Number.isFinite(numericValue)) {
    return Math.floor(Math.random() * 5) + 1;
  }

  if (numericValue >= 1 && numericValue <= 5) {
    return Math.round(numericValue * 100) / 100;
  }

  const scaledValue = Math.round((numericValue / 100) * 4) + 1;
  return Math.min(5, Math.max(1, scaledValue));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeSubjectGrades(subjectGrades) {
  const normalizedSubjectGrades = {};

  if (Array.isArray(subjectGrades)) {
    normalizedSubjectGrades[SCHOOL_PERIODS[0]] = subjectGrades.length > 0 ? normalizeGradeEntries(subjectGrades) : generateRandomGrades();
    for (let index = 1; index < SCHOOL_PERIODS.length; index += 1) {
      normalizedSubjectGrades[SCHOOL_PERIODS[index]] = generateRandomGrades();
    }
    return normalizedSubjectGrades;
  }

  SCHOOL_PERIODS.forEach((period) => {
    const existingGrades = Array.isArray(subjectGrades?.[period]) ? [...subjectGrades[period]] : [];
    normalizedSubjectGrades[period] = existingGrades.length > 0 ? normalizeGradeEntries(existingGrades) : generateRandomGrades();
  });

  return normalizedSubjectGrades;
}

function normalizeGradeEntries(entries) {
  return entries.map((entry, index) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      return {
        label: typeof entry.label === "string" && entry.label.trim() ? entry.label.trim() : (GRADE_LABELS[index] || `Nota ${index + 1}`),
        value: normalizeStoredGradeValue(entry.value)
      };
    }
      // Ajusta cualquier usuario cargado para que siempre tenga la misma estructura.

    return {
      label: GRADE_LABELS[index] || `Nota ${index + 1}`,
      value: normalizeStoredGradeValue(entry)
    };
  });
}

// Lee los usuarios desde localStorage y repara datos incompletos si hace falta.
function cargarUsuarios() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return defaultUsers.map(normalizeUser);
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const repairedUsers = parsed.map((user) => normalizeUser({ ...defaultUsersById.get(user?.id), ...user }));
      if (repairedUsers.some((user) => !user.email || !user.password)) {
        return defaultUsers.map(normalizeUser);
      }
      return repairedUsers;
    }
    return defaultUsers.map(normalizeUser);
  } catch (error) {
    return defaultUsers.map(normalizeUser);
  }
}

// Guarda el estado actual de usuarios en localStorage.
function guardarUsuarios() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn("No se pudo guardar en localStorage:", error);
  }
}

// Gestiona el acceso: administrador, usuario normal y restauración de datos base.
function login() {
  const user = document.getElementById("usuarioLogin").value.trim();
  const pass = document.getElementById("passwordLogin").value.trim();
  const mensaje = document.getElementById("mensaje");
  const normalizedUser = normalizeText(user);
  const matchedUser = users.find(
    (item) =>
      normalizeText(item.email) === normalizedUser ||
      normalizeText(item.name) === normalizedUser
  );

  if (users.length === 0 || users.some((item) => !item.email || !item.password)) {
    users = defaultUsers.map(normalizeUser);
    guardarUsuarios();
  }

  if (user === "admin" && pass === "12345") {
    mensaje.innerText = "✅ Bienvenido, administrador";
    mensaje.style.color = "#047857";
    currentSelectedPeriod = SCHOOL_PERIODS[0];
    document.body.classList.add("logged-in");
    document.getElementById("login").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    renderUsers();
    seleccionarUsuario(users[0].id);
    return;
  }

  if (matchedUser && matchedUser.password === pass) {
    mensaje.innerText = `✅ Bienvenido, ${matchedUser.name}`;
    mensaje.style.color = "#047857";
    currentSessionUserId = matchedUser.id;
    if (matchedUser.role === "Admin") {
      currentSelectedPeriod = SCHOOL_PERIODS[0];
      document.body.classList.add("logged-in");
      document.getElementById("login").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";
      renderUsers();
      seleccionarUsuario(matchedUser.id);
    } else {
      currentSelectedPeriod = SCHOOL_PERIODS[0];
      currentSelectedSubject = SCHOOL_SUBJECTS[0];
      adminSelectedPeriod = SCHOOL_PERIODS[0];
      adminSelectedSubject = SCHOOL_SUBJECTS[0];
      document.body.classList.add("logged-in");
      document.getElementById("login").style.display = "none";
      document.getElementById("userPanel").style.display = "block";
      document.getElementById("userSubtitle").innerText = `Bienvenido, ${matchedUser.name}`;
      populatePeriodSelect();
      renderUserNotes();
      renderGrades();
      renderSubjects();
    }
    return;
  }

  if (normalizedUser === "admin" && pass === "12345") {
    mensaje.innerText = "✅ Bienvenido, administrador";
    mensaje.style.color = "#047857";
    currentSelectedPeriod = SCHOOL_PERIODS[0];
    currentSessionUserId = null;
    document.body.classList.add("logged-in");
    document.getElementById("login").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    renderUsers();
    seleccionarUsuario(users[0].id);
    return;
  }

  if (normalizedUser === "restaurar" && pass === "12345") {
    restoreDefaultUsers();
    mensaje.innerText = "✅ Datos restaurados. Ya puedes ingresar con los usuarios base.";
    mensaje.style.color = "#047857";
    return;
  }

  mensaje.innerText = "❌ Usuario o contraseña incorrectos";
  mensaje.style.color = "#b91c1c";
}

// Rellena la tabla del administrador con todos los usuarios disponibles.
function renderUsers() {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td><button type="button" onclick="seleccionarUsuario(${user.id})">Editar</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Carga en el formulario el usuario elegido para editar sus datos.
function seleccionarUsuario(id) {
  const user = users.find((item) => item.id === id);
  if (!user) return;

  selectedUserId = id;
  document.getElementById("editName").value = user.name;
  document.getElementById("editEmail").value = user.email;
  document.getElementById("editRole").value = user.role;
  document.getElementById("editPassword").value = "";
  document.getElementById("editPassword").placeholder = "Dejar vacío para no cambiar";
  document.getElementById("editMessage").innerText = "";
  adminSelectedSubject = SCHOOL_SUBJECTS[0];
  adminSelectedPeriod = SCHOOL_PERIODS[0];
  populateAdminGradeSubjectSelect();
  populateAdminGradePeriodSelect();
  renderAdminGrades();
}

function populateAdminGradeSubjectSelect() {
  const select = document.getElementById("gradeSubjectSelect");
  if (!select) return;
  select.innerHTML = "";

  SCHOOL_SUBJECTS.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.innerText = subject;
    select.appendChild(option);
  });

  select.value = adminSelectedSubject;
}

function populateAdminGradePeriodSelect() {
  const select = document.getElementById("gradePeriodSelect");
  if (!select) return;
  select.innerHTML = "";

  SCHOOL_PERIODS.forEach((period) => {
    const option = document.createElement("option");
    option.value = period;
    option.innerText = period;
    select.appendChild(option);
  });

  select.value = adminSelectedPeriod;
}

// Guarda nombre y email del usuario seleccionado.
function guardarUsuario() {
  if (selectedUserId === null) {
    document.getElementById("editMessage").innerText = "Selecciona un usuario primero.";
    document.getElementById("editMessage").style.color = "#b91c1c";
    return;
  }

  const name = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const message = document.getElementById("editMessage");

  const user = users.find((item) => item.id === selectedUserId);
  if (!user) return;

  user.name = name;
  user.email = email;

  guardarUsuarios();
  renderUsers();

  message.innerText = "✅ Nombre y email guardados correctamente.";
  message.style.color = "#047857";
}

// Cambia el rol del usuario y persiste la modificación.
function guardarRol() {
  if (selectedUserId === null) {
    document.getElementById("editMessage").innerText = "Selecciona un usuario primero.";
    document.getElementById("editMessage").style.color = "#b91c1c";
    return;
  }

  const role = document.getElementById("editRole").value;
  const message = document.getElementById("editMessage");
  const user = users.find((item) => item.id === selectedUserId);
  if (!user) return;

  user.role = role;
  guardarUsuarios();
  renderUsers();

  message.innerText = "✅ Rol guardado correctamente.";
  message.style.color = "#047857";
}

// Actualiza la contraseña del usuario seleccionado.
function guardarContrasena() {
  if (selectedUserId === null) {
    document.getElementById("editMessage").innerText = "Selecciona un usuario primero.";
    document.getElementById("editMessage").style.color = "#b91c1c";
    return;
  }

  const passwordInput = document.getElementById("editPassword");
  const password = passwordInput.value.trim();
  const message = document.getElementById("editMessage");

  if (!password) {
    message.innerText = "Escribe una contraseña para guardarla.";
    message.style.color = "#b91c1c";
    return;
  }

  const user = users.find((item) => item.id === selectedUserId);
  if (!user) return;

  user.password = password;
  guardarUsuarios();
  passwordInput.value = "";

  message.innerText = "✅ Contraseña guardada correctamente.";
  message.style.color = "#047857";
}

// Agrega una nueva calificación a la materia y periodo seleccionados.
function guardarCalificacion() {
  const message = document.getElementById("editMessage");
  const subjectSelect = document.getElementById("gradeSubjectSelect");
  const periodSelect = document.getElementById("gradePeriodSelect");
  const labelInput = document.getElementById("gradeLabelInput");
  const gradeInput = document.getElementById("gradeValueInput");

  if (selectedUserId === null) {
    message.innerText = "Selecciona un usuario primero.";
    message.style.color = "#b91c1c";
    return;
  }

  const user = users.find((item) => item.id === selectedUserId);
  if (!user) return;

  const subject = subjectSelect.value;
  const period = periodSelect.value || SCHOOL_PERIODS[0];
  const label = labelInput.value.trim();
  const grade = parseGradeInput(gradeInput.value);

  if (!subject) {
    message.innerText = "Selecciona una materia.";
    message.style.color = "#b91c1c";
    return;
  }

  if (!Number.isFinite(grade) || grade < 1 || grade > 5) {
    message.innerText = "Ingresa una calificación válida entre 1 y 5.";
    message.style.color = "#b91c1c";
    return;
  }

  if (!user.grades[subject] || Array.isArray(user.grades[subject])) {
    user.grades[subject] = normalizeSubjectGrades(user.grades[subject]);
  }

  if (!Array.isArray(user.grades[subject][period])) {
    user.grades[subject][period] = [];
  }

  const finalLabel = label.length > 0 ? label : `Nota ${user.grades[subject][period].length + 1}`;
  user.grades[subject][period].push({ label: finalLabel, value: grade });
  guardarUsuarios();
  gradeInput.value = "";
  labelInput.value = "";

  message.innerText = `✅ Calificación agregada en ${subject} - ${period}.`;
  message.style.color = "#047857";
  renderAdminGrades();
  renderSubjects();
  renderGrades();
}

// Cierra la sesión y vuelve a mostrar el formulario de ingreso.
function cerrarSesion() {
  document.body.classList.remove("logged-in");
  document.getElementById("login").style.display = "block";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("mensaje").innerText = "";
  document.getElementById("editMessage").innerText = "";
  selectedUserId = null;
  currentSessionUserId = null;
  currentSelectedPeriod = SCHOOL_PERIODS[0];
  document.getElementById("editName").value = "";
  document.getElementById("editEmail").value = "";
  document.getElementById("editRole").value = "Usuario";
  // also hide user panel if visible
  document.getElementById("userPanel").style.display = "none";
}

// Muestra las notas personales del usuario autenticado.
function renderUserNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  if (currentSessionUserId === null) return;
  const user = users.find((u) => u.id === currentSessionUserId);
  if (!user) return;
  if (!Array.isArray(user.notes)) user.notes = [];
  if (user.notes.length === 0) {
    const li = document.createElement("li");
    li.innerText = "No tienes notas aún.";
    li.className = "note-empty";
    list.appendChild(li);
    return;
  }
  user.notes.forEach((n, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="note-row">
        <span class="note-text">${n}</span>
      </div>
    `;
    list.appendChild(li);
  });
}


// Cierra la sesión del usuario normal y limpia el estado visual.



function logoutUser() {
  currentSessionUserId = null;
  currentSelectedPeriod = SCHOOL_PERIODS[0];
  currentSelectedSubject = SCHOOL_SUBJECTS[0];
  document.body.classList.remove("logged-in");
  document.getElementById("userPanel").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("mensaje").innerText = "";
}

// Devuelve el usuario que corresponde a la sesión actual.
function getCurrentUser() {
  if (currentSessionUserId === null) return null;
  return users.find((u) => u.id === currentSessionUserId) || null;
}

// Llena el selector de periodos del panel de usuario.
function populatePeriodSelect() {
  const select = document.getElementById("periodSelect");
  if (!select) return;
  select.innerHTML = "";

  SCHOOL_PERIODS.forEach((period) => {
    const option = document.createElement("option");
    option.value = period;
    option.innerText = period;
    select.appendChild(option);
  });

  select.value = currentSelectedPeriod;
}

// Cambia el periodo visible para el usuario autenticado.
function setCurrentSelectedPeriod(period) {
  currentSelectedPeriod = period || SCHOOL_PERIODS[0];
  renderSubjects();
  renderGrades();
}

// Cambia la materia visible para el usuario autenticado.
function setCurrentSelectedSubject(subject) {
  currentSelectedSubject = subject || SCHOOL_SUBJECTS[0];
  renderSubjects();
  renderGrades();
}

// Cambia la materia visible en el editor del administrador.
function setAdminSelectedSubject(subject) {
  adminSelectedSubject = subject || SCHOOL_SUBJECTS[0];
  renderAdminGrades();
}

// Cambia el periodo visible en el editor del administrador.
function setAdminSelectedPeriod(period) {
  adminSelectedPeriod = period || SCHOOL_PERIODS[0];
  renderAdminGrades();
}

// Obtiene las calificaciones de una materia concreta para un periodo dado.
function getSubjectGradesForPeriod(user, subject, period) {
  const subjectGrades = user?.grades?.[subject];
  if (!subjectGrades) return [];

  if (Array.isArray(subjectGrades)) {
    return period === SCHOOL_PERIODS[0] ? normalizeGradeEntries(subjectGrades) : [];
  }

  return Array.isArray(subjectGrades[period]) ? normalizeGradeEntries(subjectGrades[period]) : [];
}

// Convierte las notas en datos listos para edición en el panel admin.
function getAdminEditableGrades(user, subject, period) {
  const grades = getSubjectGradesForPeriod(user, subject, period);
  return grades.map((grade, index) => ({
    label: grade.label,
    value: grade.value,
    index
  }));
}

// Dibuja la lista de materias del usuario, junto con la cantidad de notas.
function renderSubjects() {
  const list = document.getElementById("subjectsList");
  list.innerHTML = "";
  const user = getCurrentUser();
  if (!user) return;

  SCHOOL_SUBJECTS.forEach((subject) => {
    const grades = getSubjectGradesForPeriod(user, subject, currentSelectedPeriod);
    const li = document.createElement("li");
    const isActive = subject === currentSelectedSubject;
    li.innerHTML = `
      <button type="button" class="subject-card${isActive ? " active" : ""}" onclick="setCurrentSelectedSubject('${subject}')">
        <span class="subject-icon">${SUBJECT_ICONS[subject] || "📘"}</span>
        <span class="subject-info">
          <span class="subject-name">${subject}</span>
          <span class="subject-meta">${grades.length} nota${grades.length === 1 ? "" : "s"}</span>
        </span>
      </button>
    `;
    list.appendChild(li);
  });
}

// Muestra las calificaciones de la materia y periodo seleccionados.
function renderGrades() {
  const list = document.getElementById("gradesList");
  const avgEl = document.getElementById("gradeAverage");
  const statusEl = document.getElementById("gradeStatus");
  list.innerHTML = "";
  avgEl.innerText = "";
  statusEl.innerText = "";
  const user = getCurrentUser();
  if (!user) return;
  const subject = currentSelectedSubject || SCHOOL_SUBJECTS[0];
  if (!subject) {
    const li = document.createElement("li");
    li.className = "note-empty";
    li.innerText = "No hay calificaciones para mostrar.";
    list.appendChild(li);
    return;
  }
  currentSelectedSubject = subject;
  const grades = getSubjectGradesForPeriod(user, subject, currentSelectedPeriod);
  if (grades.length === 0) {
    const li = document.createElement("li");
    li.className = "note-empty";
    li.innerText = "No hay calificaciones registradas en esta materia para este periodo.";
    list.appendChild(li);
    avgEl.innerText = `Promedio (${subject}, ${currentSelectedPeriod}): sin datos`;
    statusEl.innerText = "Estado: sin información para evaluar";
    return;
  }
  grades.forEach((g, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="note-row">
        <span class="note-text">${g.label}</span>
        <span class="note-value">${g.value}</span>
      </div>
    `;
    list.appendChild(li);
  });
  const sum = grades.reduce((a, b) => a + Number(b.value), 0);
  const avg = sum / grades.length;
  const roundedAvg = avg.toFixed(2);
  const passesSubject = avg >= 3;
  avgEl.innerText = `Promedio (${subject}, ${currentSelectedPeriod}): ${roundedAvg}`;
  statusEl.innerText = passesSubject ? "Estado: aprueba la asignatura" : "Estado: no aprueba la asignatura";
}

// Renderiza los controles de edición de calificaciones del administrador.
function renderAdminGrades() {
  const container = document.getElementById("gradeEditorList");
  if (!container) return;
  container.innerHTML = "";

  const user = users.find((item) => item.id === selectedUserId);
  if (!user) {
    container.innerHTML = '<p class="note-empty">Selecciona un usuario para editar sus calificaciones.</p>';
    return;
  }

  const subjectSelect = document.getElementById("gradeSubjectSelect");
  const periodSelect = document.getElementById("gradePeriodSelect");
  if (subjectSelect) subjectSelect.value = adminSelectedSubject;
  if (periodSelect) periodSelect.value = adminSelectedPeriod;

  const grades = getAdminEditableGrades(user, adminSelectedSubject, adminSelectedPeriod);

  if (grades.length === 0) {
    container.innerHTML = '<p class="note-empty">No hay notas en esta materia y periodo.</p>';
    return;
  }

  grades.forEach((grade) => {
    const row = document.createElement("div");
    row.className = "grade-editor-item";
    row.innerHTML = `
      <input type="text" class="grade-editor-label" value="${grade.label}" aria-label="Nombre de la nota">
      <input type="text" inputmode="decimal" class="grade-editor-value" value="${grade.value}" aria-label="Calificación">
      <button type="button" class="secondary grade-editor-save">Guardar</button>
      <button type="button" class="secondary grade-editor-delete">Eliminar</button>
    `;

    row.querySelector(".grade-editor-save").addEventListener("click", () => {
      updateAdminGrade(grade.index, row);
    });

    row.querySelector(".grade-editor-delete").addEventListener("click", () => {
      deleteAdminGrade(grade.index);
    });

    container.appendChild(row);
  });
}

// Actualiza una nota existente del panel de administración.
function updateAdminGrade(index, row) {
  const user = users.find((item) => item.id === selectedUserId);
  if (!user) return;

  const labelInput = row.querySelector(".grade-editor-label");
  const valueInput = row.querySelector(".grade-editor-value");
  const label = labelInput.value.trim();
  const value = parseGradeInput(valueInput.value);

  if (!label) {
    document.getElementById("editMessage").innerText = "La nota debe tener un nombre.";
    document.getElementById("editMessage").style.color = "#b91c1c";
    return;
  }

  if (!Number.isFinite(value) || value < 1 || value > 5) {
    document.getElementById("editMessage").innerText = "La calificación debe estar entre 1 y 5.";
    document.getElementById("editMessage").style.color = "#b91c1c";
    return;
  }

  const subjectGrades = user.grades[adminSelectedSubject];
  const periodGrades = Array.isArray(subjectGrades?.[adminSelectedPeriod]) ? subjectGrades[adminSelectedPeriod] : [];
  if (!periodGrades[index]) return;

  periodGrades[index] = { label, value };
  guardarUsuarios();
  document.getElementById("editMessage").innerText = "✅ Nota actualizada correctamente.";
  document.getElementById("editMessage").style.color = "#047857";
  renderAdminGrades();
  renderSubjects();
  renderGrades();
}

// Elimina una nota existente del panel de administración.
function deleteAdminGrade(index) {
  const user = users.find((item) => item.id === selectedUserId);
  if (!user) return;

  const periodGrades = user.grades?.[adminSelectedSubject]?.[adminSelectedPeriod];
  if (!Array.isArray(periodGrades)) return;

  periodGrades.splice(index, 1);
  guardarUsuarios();
  document.getElementById("editMessage").innerText = "✅ Nota eliminada.";
  document.getElementById("editMessage").style.color = "#047857";
  renderAdminGrades();
  renderSubjects();
  renderGrades();
}
