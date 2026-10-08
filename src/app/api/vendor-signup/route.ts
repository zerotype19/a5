import {handleVendorSignupRequest} from '@/lib/vendor-signup/http';
export const runtime='nodejs';
export async function POST(request:Request){return handleVendorSignupRequest(request);}
