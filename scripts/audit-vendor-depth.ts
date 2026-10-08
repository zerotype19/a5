/** Read-only counts: distinct businesses per service/town, excluding fixtures and inactive vendors. */
import {writeFileSync} from 'node:fs';
import {loadVendors} from '../src/lib/admin/vendors.ts';
import {hasVendorEmail} from '../src/lib/admin/vendor-contact.ts';
import {MUNICIPALITIES} from '../config/locations.ts';
import {SERVICES} from '../config/services.ts';
const vendors=(await loadVendors()).filter(v=>v.businessName!=='A5 Owner Email Test');
const eligible=vendors.filter(v=>['ACTIVE','DISCOVERED'].includes(v.status)&&hasVendorEmail(v.email));
const rows=MUNICIPALITIES.flatMap(t=>SERVICES.map(s=>({town:t.id,county:t.countyId,service:s.id,count:eligible.filter(v=>v.locationIds.includes(t.id)&&v.serviceIds.includes(s.id)).length})));
const summary={checkedAt:new Date().toISOString(),realVendors:vendors.length,emailAssignable:eligible.length,pairs:rows.length,belowEight:rows.filter(r=>r.count<8).length,eightToNine:rows.filter(r=>r.count>=8&&r.count<10).length,tenOrMore:rows.filter(r=>r.count>=10).length,services:SERVICES.map(s=>{const r=rows.filter(r=>r.service===s.id);return {service:s.id,minimum:Math.min(...r.map(r=>r.count)),belowEight:r.filter(r=>r.count<8).length};})};
writeFileSync('docs/vendor-depth/COVERAGE.csv','county,town,service,email_assignable,minimum_gap,target_gap\n'+rows.map(r=>`${r.county},${r.town},${r.service},${r.count},${Math.max(0,8-r.count)},${Math.max(0,10-r.count)}`).join('\n')+'\n');
writeFileSync('docs/vendor-depth/STATUS.json',JSON.stringify(summary,null,2)+'\n');console.log(summary);
