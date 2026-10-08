/** Paginate privileged admin reads; fail rather than silently showing partial coverage. */
export async function readAllRows<T>(load:(from:number,to:number)=>PromiseLike<{data:T[]|null;error:{code?:string}|null}>,label:string,size=500):Promise<T[]>{
 const rows:T[]=[];
 for(let from=0;;from+=size){const {data,error}=await load(from,from+size-1);if(error)throw Error(`${label}:${error.code??'error'}`);const batch=data??[];rows.push(...batch);if(batch.length<size)return rows;}
}
