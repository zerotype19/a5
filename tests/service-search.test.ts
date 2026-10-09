import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {matchesServiceSearch} from '../src/lib/service-search.ts';
const electrical={id:'electrical',name:'Electrical',jobs:['Lights and fixtures','Outlets and switches'],problems:[{title:'Outlet stopped working'}]};
const plumbing={id:'plumbing',name:'Plumbing',jobs:['Toilets and fixtures','Leaks and supply lines'],problems:[]};
describe('homeowner service search',()=>{
 it('matches everyday wording, case and punctuation',()=>{assert.ok(matchesServiceSearch(electrical,'my broken outlet'));assert.ok(matchesServiceSearch(electrical,'Electrician!'));assert.ok(matchesServiceSearch(plumbing,'leak'));assert.ok(matchesServiceSearch(plumbing,'PLUMBER'));});
 it('does not match an unrelated trade or unknown request',()=>{assert.equal(matchesServiceSearch(plumbing,'broken outlet'),false);assert.equal(matchesServiceSearch(electrical,'zzzz'),false);});
 it('shows choices for an empty or generic repair query',()=>{assert.ok(matchesServiceSearch(electrical,''));assert.ok(matchesServiceSearch(plumbing,'need help with repairs'));});
});
