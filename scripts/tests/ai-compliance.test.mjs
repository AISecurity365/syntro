import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess,controlsFor,providers,conclusion,simpleChecks,progressSummary} from '../../src/lib/ai-compliance.mjs';
const base={provider:'chatgpt',plan:'3',use:'internal',data:'personal',controls:[]};
test('business plan never grants legal compliance',()=>{
 const a={...base,controls:controlsFor(base).map(c=>c.id)};
 assert.match(assess(a).aiStatus,/falta validación/);
 assert.match(assess(a).gdprStatus,/falta validación/);
});
test('consumer plan with personal data still needs review despite controls',()=>{
 const a={...base,plan:'1',controls:controlsFor(base).map(c=>c.id)};
 assert.match(assess(a).gdprStatus,/pendiente/);
 assert.ok(assess(a).priority.some(p=>p.includes('individual')));
});
test('sensitive use cannot be cleared by checking every box',()=>{
 for(const use of ['consequential','emotions']){
 const a={...base,use,data:'none'};a.controls=controlsFor(a).map(c=>c.id);
 assert.equal(assess(a).aiStatus,'Revisión especializada');
 assert.match(assess(a).gdprStatus,/pendiente/);
 }
});
test('unknown is not treated as anonymous',()=>assert.match(assess({...base,data:'unknown'}).gdprStatus,/pendiente/));
test('questions vary with use and data',()=>{
 assert.ok(controlsFor({...base,use:'chatbot'}).some(c=>c.id==='notice'));
 assert.ok(!controlsFor({...base,data:'none'}).some(c=>c.id==='contract'));
 assert.ok(controlsFor({...base,data:'sensitive'}).some(c=>c.id==='special'));
});
test('all provider plans produce reviewable results',()=>{
 for(const [provider,p] of Object.entries(providers)) for(let plan=0;plan<p.plans.length;plan++)assert.ok(assess({...base,provider,plan}).provider.name);
 assert.throws(()=>assess({...base,provider:'invalid'}));
});

test('plain conclusion keeps uncertainty and sensitive cases visible',()=>{
 assert.equal(conclusion(base).title,'Todavía tienes puntos por resolver');
 assert.ok(conclusion(base).actions.some(a=>a.startsWith('Forma y orienta')));
 const complete={...base,controls:controlsFor(base).map(c=>c.id)};
 assert.equal(conclusion(complete).title,'Has marcado todas las medidas del test');
 assert.match(conclusion(complete).explanation,/no certifica/);
 assert.equal(conclusion({...complete,data:'sensitive'}).title,'Este uso necesita una revisión especializada');
});

test('simplified blocks cover every applicable control without losing obligations',()=>{
 for(const use of ['internal','chatbot','content','consequential','emotions','other'])for(const data of ['none','personal','sensitive','unknown']){
 const controls=controlsFor({...base,use,data}), groups=simpleChecks(controls);
 assert.ok(groups.length>=3 && groups.length<=4);
 assert.deepEqual(groups.flatMap(g=>g.controls.map(c=>c.id)).sort(),controls.map(c=>c.id).sort());
 }
});
test('percentage counts complete blocks and never clears specialist review',()=>{
 assert.equal(progressSummary(base).percent,0);
 assert.equal(progressSummary({...base,controls:['training','security']}).percent,50);
 const a={...base,use:'consequential'};a.controls=controlsFor(a).map(c=>c.id);
 assert.equal(progressSummary(a).percent,100);
 assert.equal(progressSummary(a).tone,'review');
});
