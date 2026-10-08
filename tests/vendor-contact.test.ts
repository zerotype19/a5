import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasVendorEmail,vendorContactState} from '../src/lib/admin/vendor-contact.ts';
test('missing or unusable email keeps every requested vendor state inactive',()=>{
 for(const email of [null,undefined,'','  ','broken','person@'])for(const status of ['ACTIVE','DISCOVERED','APPROVED','INACTIVE','PAUSED'] as const){
  assert.equal(hasVendorEmail(email),false);
  assert.deepEqual(vendorContactState(email,status,true),{status:'INACTIVE',acceptingLeads:false});
 }
});
test('adding email permits an explicit active state without claiming onboarding confirmation',()=>{
 assert.deepEqual(vendorContactState(' office@business.com ','ACTIVE',true),{status:'ACTIVE',acceptingLeads:true});
 assert.deepEqual(vendorContactState('office@business.com','INACTIVE',true),{status:'INACTIVE',acceptingLeads:false});
 assert.deepEqual(vendorContactState('office@business.com','DISCOVERED',false),{status:'DISCOVERED',acceptingLeads:false});
});
