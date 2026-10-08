'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {trackEvent,ANALYTICS_READY_EVENT} from '@/lib/marketing/analytics';
import styles from './Marketing.module.css';
export function Analytics(){
 const pathname=usePathname();const [consent,setConsent]=useState<string|null>(null);
 const id=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID??'';
 const enabled=/^G-[A-Z0-9]+$/.test(id)&&!/^\/(admin|check-in|opportunity)(\/|$)/.test(pathname??'');
 useEffect(()=>{try{const value=localStorage.getItem('a5.analytics');queueMicrotask(()=>setConsent(value));}catch{}},[]);
 useEffect(()=>{
  (window as unknown as Record<string,unknown>)[`ga-disable-${id}`]=!enabled||consent!=='accepted';
  if(!enabled||consent!=='accepted')return;
  window.dataLayer=window.dataLayer??[];
  // GA4 expects an Arguments object in the dataLayer.
  // eslint-disable-next-line prefer-rest-params
  window.gtag=window.gtag??function(){window.dataLayer!.push(arguments);};
  window.gtag('set', {page_location:location.origin+(pathname??'/'),page_referrer:''});
  if(!document.getElementById('a5-ga')){window.gtag('js',new Date());window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});const s=document.createElement('script');s.id='a5-ga';s.async=true;s.src=`https://www.googletagmanager.com/gtag/js?id=${id}`;document.head.appendChild(s);}
  window.gtag('event','page_view',{page_location:location.origin+(pathname??'/'),page_referrer:'',page_title:document.title});
  window.dispatchEvent(new Event(ANALYTICS_READY_EVENT));
  const click=(e:MouseEvent)=>{if(e.target instanceof Element&&e.target.closest('a[href^="tel:"]'))trackEvent('call_clicked');};document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
 },[enabled,consent,id,pathname]);
 function choose(value:string){try{localStorage.setItem('a5.analytics',value);}catch{}setConsent(value);if(value==='declined'&&window.gtag){window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied'});location.reload();}}
 if(!enabled)return null;
 return <details className={styles.preferences}>
  <summary>Analytics preferences</summary>
  <div className={styles.consent}>
   <p>Optional analytics helps us understand page visits and request steps. Your project details are not sent to analytics. <Link href="/privacy">Privacy policy</Link></p>
   <p role="status">Analytics is {consent==='accepted'?'on':'off'}.</p>
   <div className={styles.choices}>
    <button onClick={()=>choose('accepted')} disabled={consent==='accepted'}>Allow analytics</button>
    <button onClick={()=>choose('declined')} disabled={consent==='declined'}>Keep analytics off</button>
   </div>
  </div>
 </details>;
}
