'use client';
import { ArrowIcon } from "@/components/ArrowIcon";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {SITE} from '@config/site';
import {phoneTelHref} from '@/lib/phone';
import {requestHref} from '@/lib/intake/context';
import styles from './Marketing.module.css';
export function MobileActions(){const path=usePathname()??'/';if(/^\/(request-service|vendors|admin|check-in|opportunity)(\/|$)/.test(path))return null;const parts=path.split('/');const href=parts[1]==='services'?requestHref({service:parts[2],problem:parts[3]}):parts[1]==='home-services'?requestHref({location:parts[2]}):requestHref({location:parts[1],service:parts[2]});return <nav className={styles.mobile} aria-label="Quick contact"><a href={phoneTelHref(SITE.phone)}>Call A5</a><Link href={href} prefetch={false}>Request service <ArrowIcon /></Link></nav>;}
