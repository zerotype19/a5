import test from 'node:test';import assert from 'node:assert/strict';
import{acquisitionChannel,buildAcquisitionReport,type AcquisitionLead}from'../src/lib/marketing/acquisition-report.ts';
import{nextAttribution,normalizeTouch}from'../src/lib/marketing/attribution.ts';
test('paid evidence overrides organic referral and missing evidence stays unknown',()=>{
 assert.equal(acquisitionChannel({referrerHost:'www.google.com',campaign:{gclid:'test'}}),'Paid / tagged advertising');
 assert.equal(acquisitionChannel({referrerHost:'www.google.com'}),'Organic search (inferred)');
 assert.equal(acquisitionChannel({referrerHost:'google.com.evil.com'}),'Referral');
 assert.equal(acquisitionChannel({referrerHost:'mail.google.com'}),'Referral');
 assert.equal(acquisitionChannel(null),'Direct / unknown');
 assert.equal(acquisitionChannel({campaign:{utm_medium:'email'},referrerHost:'www.google.com'}),'Other campaign');
});
test('organic landing evidence survives internal navigation with no query or contact data',()=>{
 const t=normalizeTouch({path:'/madison/masonry?email=private@example.com',referrerHost:'www.google.com',capturedAt:new Date().toISOString(),campaign:{},email:'private@example.com'})!;
 const a=nextAttribution(null,t);const result=nextAttribution(a,{...t,path:'/request-service',referrerHost:null});
 assert.equal(result.first.path,'/madison/masonry');assert.equal(result.last.path,'/madison/masonry');assert.ok(!JSON.stringify(result).includes('private@'));
});
test('persisted cohort includes unattributed and unreviewed requests without counting them qualified',()=>{
 const base={id:'1',status:'NEW',service_id:'masonry',location_id:'madison',lead_acquisition:null} as AcquisitionLead;
 const r=buildAcquisitionReport([base,{...base,id:'2',status:'QUALIFIED'},{...base,id:'3',status:'INVALID'},{...base,id:'4',status:'WON'}]);
 assert.equal(r.length,1);assert.deepEqual({...r[0],path:undefined,channel:undefined,service:undefined,town:undefined},{channel:undefined,path:undefined,service:undefined,town:undefined,requests:4,reviewed:2,excluded:1,won:1});
});
