/* ─────────────────────────────────────────────────────────────
   CampusPulse — Node.js + Supabase server
   Features: role hierarchy (admin/counsellor/student), cookie
   sessions, magic-link login (students), status history, CSV
   export, live WebSocket events, auto-seed on empty database.

   Setup:
     1) Run schema.sql in the Supabase SQL Editor
     2) Fill in .env  (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SITE_URL)
     3) npm install   ·   node server.js
   ───────────────────────────────────────────────────────────── */
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

/* ── tiny .env loader (no dotenv dependency) ──────────────── */
(function () {
  const f = path.join(__dirname, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const PORT       = process.env.PORT || 3000;
const PUBLIC     = path.join(__dirname, 'public');
const DAY        = 864e5;
const DEMO_EMAIL = 'aarav@student.campuspulse.edu';
const SITE_URL   = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n  ✗  Missing Supabase credentials — create a .env file with');
  console.error('     SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

/* ── passwords + row mapping ──────────────────────────────── */
const hash = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');

function rowToUser(r) {
  if (!r) return null;
  return {
    id: r.id, role: r.role, name: r.name, email: r.email,
    counsellorId: r.counsellor_id, status: r.status || undefined,
    profile: r.profile || undefined,
    createdAt: new Date(r.created_at).getTime(),
    pass: { salt: r.password_salt, hash: r.password_hash },   // internal only — never sent to client
  };
}
const sanitize = u => { const { pass, ...rest } = u; return rest; };

async function createUser({ password, ...u }) {
  const salt = crypto.randomBytes(12).toString('hex');
  const { data, error } = await sb.from('users').insert({
    role: u.role, name: u.name, email: u.email,
    password_salt: salt, password_hash: hash(password, salt),
    counsellor_id: u.counsellorId ?? null, status: u.status ?? null, profile: u.profile ?? null,
  }).select().single();
  if (error) throw error;
  return rowToUser(data);
}

/* ── seed (only when the users table is empty) ────────────── */
function seedRow(u) {
  const salt = crypto.randomBytes(12).toString('hex');
  return { role: u.role, name: u.name, email: u.email.toLowerCase(),
    password_salt: salt, password_hash: hash(u.password, salt),
    counsellor_id: u.counsellorId ?? null, status: u.status ?? null,
    profile: u.profile ?? null,
    created_at: new Date(u.createdAt || Date.now()).toISOString() };
}
async function ensureSeed() {
  const { count, error } = await sb.from('users').select('id', { count: 'exact', head: true });
  if (error) {
    console.error('\n  ✗  Cannot reach the users table: ' + error.message);
    console.error('     → Run schema.sql in the Supabase SQL Editor first.\n');
    process.exit(1);
  }
  if (count > 0) { console.log('  ✓  Supabase connected — ' + count + ' users in database'); return; }

  console.log('  ·  Empty database — seeding demo data…');
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const FIRST = ['Aarav','Ananya','Ishaan','Diya','Vihaan','Saanvi','Arjun','Aditi','Kabir','Myra','Advait','Anika','Reyansh','Naisha','Vivaan','Aadhya','Yash','Kiara','Atharv','Prisha','Dhruv','Riya','Karthik','Meher','Zoya','Rohan','Ira','Nikhil','Tara','Devansh'];
  const LAST  = ['Sharma','Iyer','Patel','Reddy','Khan','Nair','Gupta','Mehta','Chopra','Das','Kulkarni','Bose','Joshi','Rao','Malhotra','Pillai','Bhat','Sinha','Kapoor','Menon'];
  const CITY  = ['Kota','Delhi','Mumbai','Pune','Hyderabad','Jaipur','Lucknow','Bengaluru','Chennai','Indore','Patna','Ahmedabad'];
  const SCHOOLS = ['Delhi Public School',"St. Xavier's Senior Secondary",'Narayana Vidyalaya','Greenwood High','Atomic Energy Central School','Ryan International','Kendriya Vidyalaya','Loyola School'];
  const GOALS = ['Engineering (JEE)','Medical (NEET)','Study Abroad','Government Exams','Placement & Skills','Still exploring'];
  const MODES = ['Online','In-person','Either'];
  const HEARD = ['Instagram','YouTube','Friend / Family','School','Google Search','Other'];
  const STREAM_SUBJECTS = {
    Science : ['Physics','Chemistry','Mathematics','Biology','Computer Science'],
    Commerce: ['Accountancy','Business Studies','Economics','Mathematics','English'],
    Arts    : ['History','Political Science','Psychology','English','Economics'],
  };

  await sb.from('users').insert([seedRow({ role: 'admin', name: 'Dr. Meera Krishnan',
    email: 'admin@campuspulse.edu', password: 'Admin@123', createdAt: Date.now() - 90 * DAY })]);

  const { data: cons } = await sb.from('users').insert([
    { name: 'Rahul Verma',     email: 'rahul@campuspulse.edu' },
    { name: 'Sara Iqbal',      email: 'sara@campuspulse.edu'  },
    { name: 'David Fernandes', email: 'david@campuspulse.edu' },
  ].map((c, i) => seedRow({ role: 'counsellor', ...c, password: 'Counsel@123', createdAt: Date.now() - (80 - i * 9) * DAY }))).select();

  const load = {}; cons.forEach(c => load[c.id] = 0);
  const nextCon = () => { const c = [...cons].sort((a, b) => load[a.id] - load[b.id])[0]; load[c.id]++; return c.id; };

  const stuRows = [seedRow({
    role: 'student', name: 'Aarav Sharma', email: DEMO_EMAIL, password: 'Student@123',
    counsellorId: cons[0].id, status: 'counselling', createdAt: Date.now() - 6 * DAY,
    profile: { phone: '9876543210', dob: '2007-04-18', gender: 'Male', grade: 'Class 12', stream: 'Science',
               school: 'Delhi Public School', city: 'Kota', subjects: ['Physics','Chemistry','Mathematics'],
               goal: 'Engineering (JEE)', mode: 'Online', hear: 'YouTube' } })];
  load[cons[0].id]++;

  for (let i = 0; i < 52; i++) {
    const first = rnd(FIRST), last = rnd(LAST);
    const stream = rnd(['Science','Science','Commerce','Arts']);
    const subjects = [...STREAM_SUBJECTS[stream]].sort(() => Math.random() - .5).slice(0, 2 + Math.floor(Math.random() * 2));
    const r = Math.random();
    stuRows.push(seedRow({
      role: 'student', name: `${first} ${last}`,
      email: `${first}.${last}${i}@student.campuspulse.edu`.toLowerCase(), password: 'Student@123',
      counsellorId: nextCon(), status: r < .3 ? 'new' : r < .55 ? 'contacted' : r < .84 ? 'counselling' : 'enrolled',
      createdAt: Date.now() - Math.random() * 13.6 * DAY - 36e5,
      profile: { phone: '9' + Math.floor(1e9 * Math.random()), dob: '200' + (4 + Math.floor(Math.random() * 4)) + '-0' + (1 + Math.floor(Math.random() * 9)) + '-1' + Math.floor(Math.random() * 9),
                 gender: rnd(['Male','Female','Other']), grade: rnd(['Class 11','Class 12','Class 12','Dropper','Undergraduate']),
                 stream, school: rnd(SCHOOLS), city: rnd(CITY), subjects, goal: rnd(GOALS), mode: rnd(MODES), hear: rnd(HEARD) },
    }));
  }
  await sb.from('users').insert(stuRows);

  const { data: stus } = await sb.from('users').select('id, email, status, counsellor_id, created_at').eq('role', 'student');

  /* session requests + status history for the demo data */
  const sr = [], sh = [];
  stus.forEach(s => {
    if (s.email === DEMO_EMAIL)
      sr.push({ student_id: s.id, requested_date: new Date(Date.now() + 3 * DAY).toISOString().slice(0, 10), note: 'Want to discuss JEE Main strategy.' });
    else if (Math.random() < .22)
      sr.push({ student_id: s.id, requested_date: new Date(Date.now() + (1 + Math.floor(Math.random() * 6)) * DAY).toISOString().slice(0, 10), note: 'Requested a follow-up call.' });

    sh.push({ student_id: s.id, from_status: null, to_status: 'new', changed_by: s.counsellor_id, created_at: s.created_at });
    if (s.status && s.status !== 'new')
      sh.push({ student_id: s.id, from_status: 'new', to_status: s.status, changed_by: s.counsellor_id,
                created_at: new Date(new Date(s.created_at).getTime() + (4 + Math.random() * 40) * 36e5).toISOString() });
  });
  if (sr.length) await sb.from('session_requests').insert(sr);
  await sb.from('status_history').insert(sh);
  console.log('  ✓  Seeded ' + (2 + cons.length + stuRows.length) + ' users + status history');
}

/* ── sessions + auth ──────────────────────────────────────── */
const getCookie = (req, k) => { const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + k + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : null; };
const setCookie = (res, t) => res.setHeader('Set-Cookie', `cp_sid=${t}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 86400}`);
const redirect  = (res, to) => { res.writeHead(302, { Location: to }); res.end(); };

async function createSession(userId) {
  const t = crypto.randomBytes(24).toString('hex');
  await sb.from('sessions').insert({ token: t, user_id: userId });
  return t;
}
async function authUser(req) {
  const token = getCookie(req, 'cp_sid');
  if (!token) return null;
  const { data } = await sb.from('sessions').select('created_at, users(*)').eq('token', token).maybeSingle();
  if (!data || !data.users) return null;
  if (Date.now() - new Date(data.created_at).getTime() > 7 * DAY) {
    await sb.from('sessions').delete().eq('token', token);
    return null;
  }
  return rowToUser(data.users);
}

/* ── magic link callback (students only) ──────────────────── */
async function authCallback(req, res, u) {
  const token_hash = u.searchParams.get('token_hash');
  const type = u.searchParams.get('type') || 'magiclink';
  if (!token_hash) return redirect(res, SITE_URL + '/#/magic-failed');
  const { data, error } = await sb.auth.verifyOtp({ type, token_hash });
  const email = !error && data?.user?.email ? data.user.email.toLowerCase() : null;
  if (!email) return redirect(res, SITE_URL + '/#/magic-failed');
  const { data: row } = await sb.from('users').select('id, role').eq('email', email).maybeSingle();
  if (!row) return redirect(res, SITE_URL + '/#/magic-failed');
  setCookie(res, await createSession(row.id));
  redirect(res, SITE_URL + '/#/dashboard');
}

/* ── helpers ──────────────────────────────────────────────── */
function body(req) {
  return new Promise(resolve => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 1e6) { d = ''; req.destroy(); } });
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
  });
}
function validateReg(b) {
  const bad = (msg, field) => ({ error: msg, field });
  const s = v => String(v || '').trim();
  return (!s(b.name) || s(b.name).length < 3) ? bad('Please enter your full name.', 'name')
    : !/^\S+@\S+\.\S+$/.test(s(b.email)) ? bad('Enter a valid email address.', 'email')
    : !/^[+()\-\s\d]{10,16}$/.test(s(b.phone)) ? bad('Enter a valid phone number.', 'phone')
    : !b.dob ? bad('Pick your date of birth.', 'dob')
    : !b.gender ? bad('Select an option.', 'gender')
    : String(b.password || '').length < 6 ? bad('Password needs at least 6 characters.', 'password')
    : b.password !== b.confirm ? bad('Passwords do not match.', 'confirm')
    : !b.grade ? bad('Select your current grade.', 'grade')
    : !b.stream ? bad('Select your stream.', 'stream')
    : !s(b.school) ? bad('Enter your school / college.', 'school')
    : !s(b.city) ? bad('Enter your city.', 'city')
    : !Array.isArray(b.subjects) || !b.subjects.length ? bad('Pick at least one subject.', 'subjects')
    : !b.goal ? bad('Choose your primary goal.', 'goal')
    : !b.mode ? bad('Choose a counselling mode.', 'mode')
    : !b.hear ? bad('Tell us how you found us.', 'hear')
    : !b.consent ? bad('Please accept the consent to continue.', 'consent')
    : null;
}

/* ── WebSockets (hand-rolled RFC 6455 — no dependencies) ──── */
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const sockets = new Set();

function wsAccept(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key || (req.headers.upgrade || '').toLowerCase() !== 'websocket') return socket.destroy();
  const accept = crypto.createHash('sha1').update(key + WS_MAGIC).digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  authUser(req).then(u => {
    socket.cpUserId = u ? u.id : null;
    socket.cpRole   = u ? u.role : 'guest';
    socket.cpAlive  = true;
    sockets.add(socket);
  }).catch(() => socket.destroy());
  socket.on('data', b => {
    socket.cpAlive = true;
    const op = b[0] & 0x0f;
    if (op === 0x8) { sockets.delete(socket); socket.destroy(); }             // close
    else if (op === 0x9) { try { socket.write(Buffer.from([0x8a, 0])); } catch {} } // ping → pong
  });
  socket.on('close', () => sockets.delete(socket));
  socket.on('error', () => sockets.delete(socket));
}
function wsFrame(str) {
  const pay = Buffer.from(str), len = pay.length;
  let head;
  if (len < 126)        { head = Buffer.from([0x81, len]); }
  else if (len < 65536) { head = Buffer.alloc(4);  head[0] = 0x81; head[1] = 126; head.writeUInt16BE(len, 2); }
  else                  { head = Buffer.alloc(10); head[0] = 0x81; head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
  return Buffer.concat([head, pay]);
}
/* broadcast(type, payload, roles, onlyUserIds, skipUserId) */
function broadcast(type, payload, roles, uids, skipId) {
  const frame = wsFrame(JSON.stringify({ type, payload, at: Date.now() }));
  for (const s of sockets) {
    if (roles && !roles.includes(s.cpRole)) continue;
    if (uids && s.cpRole !== 'admin' && !uids.includes(s.cpUserId)) continue;
    if (skipId != null && s.cpUserId === skipId) continue;
    try { s.write(frame); } catch { sockets.delete(s); }
  }
}
setInterval(() => {
  for (const s of sockets) {
    if (!s.cpAlive) { sockets.delete(s); try { s.destroy(); } catch {} continue; }
    s.cpAlive = false;
    try { s.write(Buffer.from([0x89, 0])); } catch { sockets.delete(s); }
  }
}, 30000).unref();

/* ── dashboard payloads (role-aware) ──────────────────────── */
async function dashboard(u) {
  if (u.role === 'student') return studentDash(u);

  let q = sb.from('users').select('*').eq('role', 'student').order('created_at', { ascending: false });
  if (u.role === 'counsellor') q = q.eq('counsellor_id', u.id);
  const [{ data: stuRows }, { data: conRows }] = await Promise.all([
    q,
    sb.from('users').select('*').eq('role', 'counsellor').order('created_at'),
  ]);
  const students    = (stuRows || []).map(rowToUser);
  const counsellors = (conRows || []).map(rowToUser);
  const cName = {}; counsellors.forEach(c => cName[c.id] = c.name);

  const now = Date.now();
  const week     = students.filter(s => now - s.createdAt < 7 * DAY).length;
  const prev     = students.filter(s => now - s.createdAt >= 7 * DAY && now - s.createdAt < 14 * DAY).length;
  const enrolled = students.filter(s => s.status === 'enrolled').length;

  const series = [];
  for (let d = 13; d >= 0; d--) {
    const start = new Date(now - d * DAY); start.setHours(0, 0, 0, 0);
    series.push({ label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: students.filter(s => s.createdAt >= +start && s.createdAt < +start + DAY).length });
  }
  const perf = counsellors.map(c => {
    const mine = students.filter(s => s.counsellorId === c.id);
    return { id: c.id, name: c.name, email: c.email, students: mine.length,
             enrolled: mine.filter(s => s.status === 'enrolled').length, joined: c.createdAt };
  });
  const recent = students.slice(0, 8)
    .map(s => ({ name: s.name, grade: s.profile.grade, stream: s.profile.stream, city: s.profile.city,
                 counsellor: cName[s.counsellorId] || 'Unassigned', at: s.createdAt, status: s.status }));
  const sc = {}; students.forEach(s => (s.profile.subjects || []).forEach(x => sc[x] = (sc[x] || 0) + 1));
  const subjects = Object.entries(sc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  const st = {}; students.forEach(s => st[s.profile.stream] = (st[s.profile.stream] || 0) + 1);
  const streams = Object.entries(st).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  const stats = u.role === 'admin'
    ? { students: students.length, counsellors: counsellors.length, week, delta: week - prev, enrolled }
    : { students: students.length, week, delta: week - prev, enrolled,
        requests: students.reduce((n, s) => n + ((s.sessionRequests || []).length), 0) };

  return { role: u.role, stats, series, recent, subjects, streams, perf,
           students: students.map(s => ({ id: s.id, name: s.name, email: s.email, grade: s.profile.grade,
             stream: s.profile.stream, city: s.profile.city, counsellor: cName[s.counsellorId] || 'Unassigned',
             status: s.status, at: s.createdAt })) };
}
async function studentDash(u) {
  const p = u.profile || {};
  const [{ data: cRow }, { data: sr }, { data: all }, { data: hist }] = await Promise.all([
    u.counsellorId ? sb.from('users').select('*').eq('id', u.counsellorId).maybeSingle() : Promise.resolve({ data: null }),
    sb.from('session_requests').select('*').eq('student_id', u.id).order('created_at'),
    sb.from('users').select('profile').eq('role', 'student'),
    sb.from('status_history')
      .select('from_status, to_status, created_at, changer:users!status_history_changed_by_fkey(name)')
      .eq('student_id', u.id).order('created_at', { ascending: false }).limit(6),
  ]);
  const c = rowToUser(cRow);
  const sc = {};
  (all || []).forEach(r => ((r.profile || {}).subjects || []).forEach(x => sc[x] = (sc[x] || 0) + 1));
  const subjects = Object.entries(sc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  return {
    role: 'student',
    profile: { name: u.name, email: u.email, joined: u.createdAt, status: u.status, ...p },
    counsellor: c ? { name: c.name, email: c.email, since: c.createdAt } : null,
    timeline: [
      { key: 'Registered',          sub: 'Account is live',               done: true },
      { key: 'Profile complete',    sub: 'Phone & grade on file',         done: !!(p.phone && p.grade) },
      { key: 'Counselling started', sub: 'Sessions with your counsellor', done: ['counselling','enrolled'].includes(u.status) },
      { key: 'Enrolled',            sub: 'Final admission',               done: u.status === 'enrolled' },
    ],
    history: (hist || []).map(r => ({ from: r.from_status, to: r.to_status,
      by: r.changer ? r.changer.name : null, at: new Date(r.created_at).getTime() })),
    sessionRequests: (sr || []).map(r => ({ date: r.requested_date, note: r.note, at: new Date(r.created_at).getTime() })),
    subjects,
  };
}

/* ── API ──────────────────────────────────────────────────── */
async function api(req, res, p) {
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
  const user = await authUser(req);

  if (req.method === 'GET' && p === '/api/pulse') {
    const { data } = await sb.from('users').select('name, profile, created_at').eq('role', 'student')
      .order('created_at', { ascending: false }).limit(10);
    const items = (data || []).map(r => ({ name: r.name.split(' ')[0], city: (r.profile || {}).city, at: new Date(r.created_at).getTime() }));
    return send(200, { items });
  }

  /* magic link request — students only, always 200 to avoid account enumeration */
  if (req.method === 'POST' && p === '/api/magiclink') {
    const b = await body(req);
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return send(400, { error: 'Enter a valid email.' });
    const { data: row } = await sb.from('users').select('id, role').eq('email', email).maybeSingle();
    if (!row || row.role !== 'student') return send(200, { sent: false });
    const { error } = await sb.auth.signInWithOtp({ email, options: { redirectTo: SITE_URL + '/auth/callback' } });
    if (error) return send(429, { error: 'Too many emails right now — wait a minute and retry.' });
    return send(200, { sent: true });
  }

  if (req.method === 'POST' && p === '/api/register') {
    const b = await body(req);
    const err = validateReg(b); if (err) return send(400, err);
    const email = b.email.trim().toLowerCase();
    const { data: dupe } = await sb.from('users').select('id').eq('email', email).maybeSingle();
    if (dupe) return send(400, { error: 'This email is already registered — try signing in.', field: 'email' });

    // auto-assign to the least-loaded counsellor
    const [{ data: cons }, { data: loads }] = await Promise.all([
      sb.from('users').select('id').eq('role', 'counsellor'),
      sb.from('users').select('counsellor_id').eq('role', 'student'),
    ]);
    let cid = null;
    if (cons && cons.length) {
      const load = {}; (loads || []).forEach(s => { if (s.counsellor_id) load[s.counsellor_id] = (load[s.counsellor_id] || 0) + 1; });
      cid = [...cons].sort((a, c) => (load[a.id] || 0) - (load[c.id] || 0))[0].id;
    }
    let u;
    try {
      u = await createUser({ role: 'student', name: b.name.trim(), email, password: b.password,
        counsellorId: cid, status: 'new',
        profile: { phone: b.phone.trim(), dob: b.dob, gender: b.gender, grade: b.grade, stream: b.stream,
                   school: b.school.trim(), city: b.city.trim(), subjects: b.subjects, goal: b.goal, mode: b.mode, hear: b.hear } });
    } catch (e) {
      if (e.code === '23505') return send(400, { error: 'This email is already registered — try signing in.', field: 'email' });
      throw e;
    }
    await sb.from('status_history').insert({ student_id: u.id, from_status: null, to_status: 'new', changed_by: null });
    broadcast('pulse', { name: u.name.split(' ')[0], city: u.profile.city, at: u.createdAt });
    broadcast('staff', { reason: 'student:new', name: u.name, counsellor: cid ? 'their counsellor' : 'Unassigned' }, ['admin', 'counsellor'], cid ? [cid] : null);
    setCookie(res, await createSession(u.id));
    return send(200, { user: sanitize(u) });
  }

  if (req.method === 'POST' && p === '/api/login') {
    const b = await body(req);
    const { data: row } = await sb.from('users').select('*').eq('email', String(b.email || '').trim().toLowerCase()).maybeSingle();
    const u = rowToUser(row);
    if (!u || hash(b.password || '', u.pass.salt) !== u.pass.hash) return send(401, { error: 'Incorrect email or password.' });
    setCookie(res, await createSession(u.id));
    return send(200, { user: sanitize(u) });
  }

  if (req.method === 'POST' && p === '/api/logout') {
    const token = getCookie(req, 'cp_sid');
    if (token) await sb.from('sessions').delete().eq('token', token);
    res.setHeader('Set-Cookie', 'cp_sid=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
    return send(200, { ok: true });
  }

  if (!user) return send(401, { error: 'Not signed in' });
  if (req.method === 'GET' && p === '/api/me')        return send(200, { user: sanitize(user) });
  if (req.method === 'GET' && p === '/api/dashboard') return send(200, await dashboard(user));

  if (req.method === 'PATCH' && /^\/api\/students\/\d+\/status$/.test(p)) {
    if (user.role === 'student') return send(403, { error: 'Forbidden' });
    const sid = +p.match(/\d+/)[0];
    const { data: row } = await sb.from('users').select('*').eq('id', sid).eq('role', 'student').maybeSingle();
    const s = rowToUser(row);
    if (!s) return send(404, { error: 'Student not found' });
    if (user.role === 'counsellor' && s.counsellorId !== user.id) return send(403, { error: 'Not your student' });
    const b = await body(req);
    if (!['new', 'contacted', 'counselling', 'enrolled'].includes(b.status)) return send(400, { error: 'Bad status' });
    await sb.from('users').update({ status: b.status }).eq('id', sid);
    await sb.from('status_history').insert({ student_id: sid, from_status: s.status, to_status: b.status, changed_by: user.id });
    broadcast('staff', { reason: 'status', name: s.name, status: b.status }, ['admin', 'counsellor'], null, user.id);
    return send(200, { ok: true });
  }

  /* status history for one student (staff only; counsellors → own students) */
  if (req.method === 'GET' && /^\/api\/students\/\d+\/history$/.test(p)) {
    if (user.role === 'student') return send(403, { error: 'Forbidden' });
    const sid = +p.match(/\d+/)[0];
    const { data: stu } = await sb.from('users').select('id, counsellor_id').eq('id', sid).eq('role', 'student').maybeSingle();
    if (!stu) return send(404, { error: 'Student not found' });
    if (user.role === 'counsellor' && stu.counsellor_id !== user.id) return send(403, { error: 'Not your student' });
    const { data: rows } = await sb.from('status_history')
      .select('from_status, to_status, created_at, changer:users!status_history_changed_by_fkey(name)')
      .eq('student_id', sid).order('created_at', { ascending: false }).limit(30);
    const items = (rows || []).map(r => ({ from: r.from_status, to: r.to_status,
      by: r.changer ? r.changer.name : null, at: new Date(r.created_at).getTime() }));
    return send(200, { items });
  }

  if (req.method === 'POST' && p === '/api/counsellors') {
    if (user.role !== 'admin') return send(403, { error: 'Only the superadmin can add counsellors' });
    const b = await body(req);
    const name = String(b.name || '').trim(), email = String(b.email || '').trim().toLowerCase();
    if (name.length < 3)               return send(400, { error: "Enter the counsellor's full name.", field: 'name' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return send(400, { error: 'Enter a valid email.', field: 'email' });
    const { data: dupe } = await sb.from('users').select('id').eq('email', email).maybeSingle();
    if (dupe) return send(400, { error: 'That email is already registered.', field: 'email' });
    if (String(b.password || '').length < 6) return send(400, { error: 'Password needs at least 6 characters.', field: 'password' });
    let c;
    try { c = await createUser({ role: 'counsellor', name, email, password: b.password }); }
    catch (e) {
      if (e.code === '23505') return send(400, { error: 'That email is already registered.', field: 'email' });
      throw e;
    }
    broadcast('staff', { reason: 'counsellor:new', name: c.name }, ['admin'], null, user.id);
    return send(200, { user: sanitize(c) });
  }

  if (req.method === 'POST' && p === '/api/sessions') {
    if (user.role !== 'student') return send(403, { error: 'Only students can book sessions' });
    const b = await body(req);
    if (!b.date) return send(400, { error: 'Pick a date.', field: 'date' });
    await sb.from('session_requests').insert({ student_id: user.id, requested_date: b.date, note: String(b.note || '').slice(0, 300) });
    broadcast('staff', { reason: 'session:new', name: user.name, date: b.date }, ['admin', 'counsellor'],
      user.counsellorId ? [user.counsellorId] : null);
    return send(200, { ok: true });
  }

  /* CSV export: admin → all students, counsellor → own students */
  if (req.method === 'GET' && p === '/api/export/students') {
    if (user.role === 'student') return send(403, { error: 'Forbidden' });
    let q = sb.from('users').select('*').eq('role', 'student').order('created_at', { ascending: false });
    if (user.role === 'counsellor') q = q.eq('counsellor_id', user.id);
    const [{ data: rows }, { data: conRows }] = await Promise.all([
      q, sb.from('users').select('id, name').eq('role', 'counsellor'),
    ]);
    const cName = {}; (conRows || []).forEach(c => cName[c.id] = c.name);
    const ST = { new: 'New', contacted: 'Contacted', counselling: 'In counselling', enrolled: 'Enrolled' };
    const head = ['Name','Email','Phone','DOB','Gender','Grade','Stream','School','City','Subjects','Goal','Counselling mode','Heard via','Status','Counsellor','Registered'];
    const q2 = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [head.join(',')].concat((rows || []).map(r => {
      const pr = r.profile || {};
      return [r.name, r.email, pr.phone, pr.dob, pr.gender, pr.grade, pr.stream, pr.school, pr.city,
        (pr.subjects || []).join('; '), pr.goal, pr.mode, pr.hear, ST[r.status],
        cName[r.counsellor_id] || 'Unassigned', new Date(r.created_at).toISOString().slice(0, 10)].map(q2).join(',');
    }));
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="campuspulse-students-' + new Date().toISOString().slice(0, 10) + '.csv"',
    });
    return res.end('\uFEFF' + lines.join('\r\n'));
  }

  return send(404, { error: 'Unknown endpoint' });
}

/* ── static + SPA fallback ────────────────────────────────── */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
function staticFile(res, p) {
  let full = path.join(PUBLIC, path.normalize(p === '/' ? 'index.html' : p).replace(/^(\.\.[\/\\])+/, ''));
  if (!full.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) full = path.join(PUBLIC, 'index.html');
  fs.readFile(full, (e, buf) => {
    if (e) { res.writeHead(500); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  try {
    if (p === '/auth/callback') return await authCallback(req, res, u);
    if (p.startsWith('/api/'))  return await api(req, res, p);
  } catch (e) {
    console.error('API error:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Server error' }));
  }
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
  staticFile(res, p);
});

server.on('upgrade', (req, socket) => {
  const p = new URL(req.url, 'http://x').pathname;
  if (p === '/ws') wsAccept(req, socket); else socket.destroy();
});

(async () => {
  await ensureSeed();
  server.listen(PORT, () => {
    console.log('\n  CampusPulse running →  ' + SITE_URL);
    console.log('  Database    : Supabase (Postgres)');
    console.log('  Live events : WebSocket at /ws');
    console.log('  Magic links : /api/magiclink → /auth/callback');
    console.log('  Superadmin  : admin@campuspulse.edu          / Admin@123');
    console.log('  Counsellor  : rahul@campuspulse.edu          / Counsel@123');
    console.log('  Student     : aarav@student.campuspulse.edu  / Student@123 or magic link\n');
  });
})();
