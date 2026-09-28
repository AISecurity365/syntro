const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, env = {}, overrides = {}) {
  const exports = {};
  const source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.env', '__env');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, __env: env, require: name => overrides[name] || require(name), console: {log(){},error(){}}, setTimeout: fn => fn() });
  return exports;
}
const schedule = load('src/lib/meeting-schedule.ts');
function calendar(env = {}, events = {}) {
  const requests = [];
  const google = {
    auth: { OAuth2: class {setCredentials(c){this.credentials=c;}}, JWT: class {} },
    calendar: () => ({events: {
      insert: async request => {requests.push(request); return {data:{id:'event-1', organizer:{email:'owner@example.com'}, hangoutLink:'https://meet.google.com/test', ...events.created}};},
      get: async () => ({data:{id:'event-1',hangoutLink:'https://meet.google.com/ready',organizer:{email:'owner@example.com'}}}),
      list: async request => {requests.push(request);return {data:{items:events.items || []}};},
    }}),
  };
  const api = load('src/lib/google-calendar.ts', {GOOGLE_SERVICE_ACCOUNT_EMAIL:'service@example.com',GOOGLE_PRIVATE_KEY:'mock',GOOGLE_CALENDAR_ID:'legacy',...env}, {'googleapis':{google},'./meeting-schedule':schedule});
  return {api, requests};
}
const oauth = {GOOGLE_OAUTH_CLIENT_ID:'client', GOOGLE_OAUTH_CLIENT_SECRET:'secret', GOOGLE_OAUTH_REFRESH_TOKEN:'mock-token'};
const booking = {name:'Test',email:'client@example.com',date:new Date('2026-10-01'),timeSlot:'10:00'};
test('five years of stable schedules: weekends closed, four slots on most weekdays', () => {
 for(let year=2026;year<=2030;year++)for(let month=0;month<12;month++) {
  let closed=0, weekdays=0;
  for(let day=1;day<=new Date(Date.UTC(year,month+1,0)).getUTCDate();day++) {
   const date=new Date(Date.UTC(year,month,day)),key=date.toISOString().slice(0,10),slots=schedule.meetingSlots(key);
   assert.equal(JSON.stringify(slots),JSON.stringify(schedule.meetingSlots(key)));
   if([0,6].includes(date.getUTCDay())) assert.equal(slots.length,0);
   else {weekdays++;if(!slots.length)closed++;else{assert.equal(slots.length,4);assert.equal(slots.filter(t=>t<'14:00').length,2);}}
  }
  assert(closed>0 && closed<weekdays/2);
 }
 assert.equal(schedule.meetingSlots('2028-02-30').length,0);
});
test('OAuth creates one Meet invitation on primary calendar at Madrid wall time',async()=>{
 const {api,requests}=calendar(oauth,{created:{hangoutLink:undefined,conferenceData:{createRequest:{status:{statusCode:'pending'}}}}});
 const result=await api.createCalendarEvent(booking);
 assert.equal(requests.length,1);
 const r=requests[0];assert.equal(r.calendarId,'primary');assert.equal(r.sendUpdates,'all');assert.equal(r.conferenceDataVersion,1);
 assert.equal(r.requestBody.attendees[0].email,booking.email);
 assert.equal(r.requestBody.start.dateTime,'2026-10-01T10:00:00');assert.equal(r.requestBody.start.timeZone,'Europe/Madrid');
 assert.equal(r.requestBody.conferenceData.createRequest.conferenceSolutionKey.type,'hangoutsMeet');
 assert.equal(result.meetLink,'https://meet.google.com/ready');assert.equal(result.organizerEmail,'owner@example.com');
});
test('legacy service account does not attempt invitations or Meet',async()=>{
 const {api,requests}=calendar();await api.createCalendarEvent(booking);
 assert.equal(requests[0].calendarId,'legacy');assert.equal(requests[0].sendUpdates,undefined);assert.equal(requests[0].requestBody.conferenceData,undefined);
});
test('incomplete OAuth configuration fails instead of silently changing calendar',async()=>{
 const {api,requests}=calendar({GOOGLE_OAUTH_REFRESH_TOKEN:'mock'});
 await assert.rejects(api.createCalendarEvent(booking),/Missing Google OAuth/);assert.equal(requests.length,0);
});
test('busy slots use Madrid time in winter and summer; all-day events block the day',async()=>{
 for(const month of ['01','07']) {
  const key=Array.from({length:28},(_,i)=>'2027-'+month+'-'+String(i+1).padStart(2,'0')).find(k=>schedule.meetingSlots(k).length);
  const first=schedule.meetingSlots(key)[0],offset=month==='01'?1:2;
  const start=new Date(key+'T'+first+':00Z');start.setUTCHours(start.getUTCHours()-offset);
  const end=new Date(start.getTime()+2*3600000);
  const {api}=calendar(oauth,{items:[{start:{dateTime:start.toISOString()},end:{dateTime:end.toISOString()}}]});
  const available=await api.getAvailableSlots(new Date(key));assert(!available.includes(first));assert.equal(available.length,3);
  const next=new Date(key);next.setUTCDate(next.getUTCDate()+1);
  const allDay=calendar(oauth,{items:[{start:{date:key},end:{date:next.toISOString().slice(0,10)}}]});
  assert.equal((await allDay.api.getAvailableSlots(new Date(key))).length,0);
 }
 const {api,requests}=calendar(oauth);assert.equal((await api.getAvailableSlots(new Date('2026-10-03'))).length,0);assert.equal(requests.length,0);
});
