import assert from 'node:assert/strict';
import {test} from 'node:test';
import {observeRequestStart,ANALYTICS_READY_EVENT} from '../src/lib/marketing/analytics.ts';
test('intake start waits for analytics readiness and emits once across later page/consent notifications',()=>{
 const target=new EventTarget();let ready=false,count=0;
 const stop=observeRequestStart(target,()=>{if(!ready)return false;count++;return true;});
 assert.equal(count,0);ready=true;target.dispatchEvent(new Event(ANALYTICS_READY_EVENT));target.dispatchEvent(new Event(ANALYTICS_READY_EVENT));assert.equal(count,1);stop();
});
test('intake start emits immediately when ready and stops listening on unmount',()=>{
 const target=new EventTarget();let count=0;const stop=observeRequestStart(target,()=>{count++;return true;});assert.equal(count,1);stop();target.dispatchEvent(new Event(ANALYTICS_READY_EVENT));assert.equal(count,1);
 let afterUnmount=0;const stopWaiting=observeRequestStart(target,()=>{afterUnmount++;return false;});stopWaiting();target.dispatchEvent(new Event(ANALYTICS_READY_EVENT));assert.equal(afterUnmount,1);
});

test('tracking requires consent, excludes private routes and never includes query or form fields', async()=>{
 const {trackEvent}=await import('../src/lib/marketing/analytics.ts');
 const keys=['window','location','localStorage'] as const;
 const originals=keys.map(key=>Object.getOwnPropertyDescriptor(globalThis,key));
 const events:unknown[][]=[];let consent='declined';
 const location={origin:'https://www.a5homeservices.com',pathname:'/request-service',search:'?email=private@example.com'};
 Object.defineProperty(globalThis,'window',{configurable:true,value:{gtag:(...args:unknown[])=>events.push(args)}});
 Object.defineProperty(globalThis,'location',{configurable:true,value:location});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>consent}});
 try{
  assert.equal(trackEvent('request_started'),false);assert.equal(events.length,0);
  consent='accepted';assert.equal(trackEvent('request_started'),true);
  assert.deepEqual(events[0],['event','request_started',{transport_type:'beacon',page_location:'https://www.a5homeservices.com/request-service',page_referrer:''}]);
  for(const path of ['/admin/leads/1','/opportunity/private-token','/check-in/private-token']){location.pathname=path;assert.equal(trackEvent('request_submitted'),false);}
  assert.equal(events.length,1);
 }finally{keys.forEach((key,index)=>{const descriptor=originals[index];if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);});}
});
