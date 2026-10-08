'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {VendorCoverage} from '@/lib/admin/vendors';
import styles from './admin.module.css';
/** Keep source restrictions next to the assignment decision, not hidden in another screen. */
export function AssignmentVendorSelect({vendors}:{vendors:(Pick<VendorCoverage,'id'|'businessName'|'status'|'discoveryNotes'|'credentialsNotes'>&{serviceMatch:boolean|null;locationMatch:boolean|null})[]}){
 const [selected,setSelected]=useState('');
 const vendor=vendors.find(v=>v.id===selected);
 return <>
  <label className={styles.fieldLabel}>Assign vendor
   <select name="vendorId" required value={selected} onChange={e=>setSelected(e.target.value)} aria-describedby={vendor?'vendor-fit-notes':undefined}>
    <option value="" disabled>Choose a vendor with email</option>
    {vendors.map(v=><option key={v.id} value={v.id}>{v.businessName} — {v.status}</option>)}
   </select>
  </label>
  {vendor&&<div id="vendor-fit-notes" className={styles.panel}>
   <h3>Check provider fit</h3>
   <p>Requested service: <strong>{vendor.serviceMatch===null?'not specified':vendor.serviceMatch?'in recorded coverage':'not in recorded coverage'}</strong>. Request location: <strong>{vendor.locationMatch===null?'not specified':vendor.locationMatch?'in recorded coverage':'not in recorded coverage'}</strong>.</p>
   <p className={styles.mutedCopy}>Review the recorded service and territory limits against this request. Category coverage does not confirm every specialty, brand or job size.</p>
   <p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{vendor.discoveryNotes||'No discovery notes recorded. Review the vendor profile before assigning.'}</p>
   {vendor.credentialsNotes&&<p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{vendor.credentialsNotes}</p>}
   <Link href={`/admin/vendors/${vendor.id}`}>Open vendor profile</Link>
  </div>}
 </>;
}
