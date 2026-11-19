import { firebaseConfig } from './firebase-config.js';

const sdk = 'https://www.gstatic.com/firebasejs/12.5.0';
const screen = document.querySelector('#accountScreen');
const form = document.querySelector('#accountForm');
const message = document.querySelector('#accountStatus');
const title = document.querySelector('#accountTitle');
const submit = document.querySelector('#accountSubmit');
const mode = document.querySelector('#accountMode');
const passwordInput = document.querySelector('#accountPassword');
let registering = true;

function setRegistrationMode(enabled) {
  registering = enabled;
  title.textContent = enabled ? 'DayFlow-ға тіркелу' : 'DayFlow-ға кіру';
  submit.textContent = enabled ? 'Тіркелу' : 'Кіру';
  mode.textContent = enabled ? 'Аккаунтым бар' : 'Жаңа аккаунт ашу';
  passwordInput.value = '';
  passwordInput.autocomplete = enabled ? 'new-password' : 'current-password';
  if (enabled) passwordInput.minLength = 6;
  else passwordInput.removeAttribute('minlength');
  message.textContent = '';
}

mode.addEventListener('click', () => setRegistrationMode(!registering));
const storageStatus = document.querySelector('#storageStatus');
const retrySave = document.querySelector('#retrySave');
const retryAccount = document.querySelector('#retryAccount');
const leaveAccount = document.querySelector('#leaveAccount');
const signOutButton = document.querySelector('#signOut');
const workspace = [document.querySelector('#appLayout'), document.querySelector('#mobileNav')];

function showWorkspace(ready) {
  screen.hidden = ready;
  for (const element of workspace) {
    element.hidden = !ready;
    element.inert = !ready;
  }
}

const authMessages = {
  'auth/email-already-in-use': 'Бұл пошта тіркелген. Кіру батырмасын қолданыңыз.',
  'auth/weak-password': 'Күрделірек құпиясөз таңдаңыз. Кемінде 6 таңба енгізіңіз.',
  'auth/invalid-credential': 'Электрондық пошта немесе құпиясөз қате.',
  'auth/operation-not-allowed': 'Firebase жобасында Email/Password арқылы кіруді қосыңыз.',
  'auth/network-request-failed': 'Желіге қосылуды тексеріп, қайталап көріңіз.',
  'auth/too-many-requests': 'Сұрау тым көп. Біраздан кейін қайталап көріңіз.'
};

async function connect() {
  if (!['apiKey', 'authDomain', 'projectId', 'appId'].every(key => firebaseConfig[key])) {
    message.textContent = 'DayFlow аккаунтын іске қосу үшін Firebase веб-конфигурациясын толтырыңыз.';
    return;
  }

  const [{ initializeApp }, authApi, dbApi] = await Promise.all([
    import(`${sdk}/firebase-app.js`),
    import(`${sdk}/firebase-auth.js`),
    import(`${sdk}/firebase-firestore.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = authApi.getAuth(app);
  const db = dbApi.getFirestore(app);
  let session = null;
  let pending = null;
  let writing = false;
  let conflict = false;

  function hasUnsavedChanges() {
    return writing || pending !== null;
  }

  window.addEventListener('beforeunload', event => {
    if (hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  async function flush() {
    if (writing || pending === null || !session || conflict) return;
    const active = session;
    writing = true;
    retrySave.hidden = true;
    storageStatus.textContent = 'Firestore-ға сақталуда…';
    try {
      while (session === active && pending !== null) {
        const state = pending;
        const revision = active.revision;
        await dbApi.runTransaction(db, async transaction => {
          const current = await transaction.get(active.ref);
          if ((current.data()?.revision ?? 0) !== revision) {
            const error = new Error('DayFlow revision conflict');
            error.code = 'dayflow/conflict';
            throw error;
          }
          transaction.set(active.ref, { state, revision: revision + 1 });
        });
        if (session !== active) return;
        active.revision += 1;
        if (pending === state) pending = null;
      }
      storageStatus.textContent = 'Firestore-ға сақталды';
    } catch (error) {
      if (session !== active) return;
      conflict = error.code === 'dayflow/conflict';
      storageStatus.textContent = conflict
        ? 'Деректер басқа құрылғыда өзгерген. Осы нұсқаны JSON ретінде экспорттап, бетті қайта жүктеңіз.'
        : 'Firestore-ға сақтау сәтсіз аяқталды. Қайта сақтап көріңіз.';
      retrySave.hidden = conflict;
    } finally {
      writing = false;
      if (session && session !== active && pending !== null) void flush();
    }
  }

  async function openAccount(user) {
    const active = { ref: dbApi.doc(db, 'dayflowUsers', user.uid), revision: 0 };
    session = active;
    message.textContent = 'Жоспарларыңыз жүктелуде…';
    retryAccount.hidden = true;
    leaveAccount.hidden = true;
    try {
      const snapshot = await dbApi.getDocFromServer(active.ref);
      if (session !== active) return;
      const data = snapshot.data();
      active.revision = data?.revision ?? 0;
      window.dayFlow.start(data?.state ?? null, state => {
        if (session !== active) return;
        pending = state;
        void flush();
      });
      showWorkspace(true);
    } catch {
      if (session !== active) return;
      window.dayFlow.stop();
      message.textContent = 'Жоспарлар жүктелмеді. Байланысты және Firestore баптауларын тексеріңіз.';
      retryAccount.hidden = false;
      leaveAccount.hidden = false;
    }
  }

  authApi.onAuthStateChanged(auth, user => {
    showWorkspace(false);
    window.dayFlow.stop();
    session = null;
    pending = null;
    conflict = false;
    retrySave.hidden = true;
    retryAccount.hidden = true;
    leaveAccount.hidden = true;
    storageStatus.textContent = '';
    form.hidden = Boolean(user);
    if (user) {
      form.reset();
      void openAccount(user);
    } else {
      setRegistrationMode(true);
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const register = registering;
    const buttons = form.querySelectorAll('button');
    for (const button of buttons) button.disabled = true;
    message.textContent = register ? 'Аккаунт жасалуда…' : 'Аккаунтқа кіріп жатырсыз…';
    try {
      const authenticate = register ? authApi.createUserWithEmailAndPassword : authApi.signInWithEmailAndPassword;
      await authenticate(auth, email, password);
    } catch (error) {
      message.textContent = authMessages[error.code] ?? 'Firebase аккаунтына кіру сәтсіз аяқталды.';
    } finally {
      for (const button of buttons) button.disabled = false;
    }
  });

  async function signOut() {
    if (hasUnsavedChanges()) {
      storageStatus.textContent = conflict
        ? 'Алдымен осы нұсқаны JSON ретінде экспорттап, бетті қайта жүктеңіз.'
        : 'Шығу үшін өзгерістер толық сақталуы керек.';
      return;
    }
    try {
      await authApi.signOut(auth);
    } catch {
      const status = screen.hidden ? storageStatus : message;
      status.textContent = 'Аккаунттан шығу сәтсіз аяқталды. Қайталап көріңіз.';
    }
  }

  retryAccount.addEventListener('click', () => {
    if (auth.currentUser) void openAccount(auth.currentUser);
  });
  retrySave.addEventListener('click', flush);
  window.addEventListener('online', flush);
  leaveAccount.addEventListener('click', signOut);
  signOutButton.addEventListener('click', signOut);
}

connect().catch(() => {
  message.textContent = 'Firebase жүктелмеді. Байланысты және Firebase конфигурациясын тексеріңіз.';
});
