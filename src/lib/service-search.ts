const aliases:Record<string,string>={plumbing:'plumber',electrical:'electrician electricity power',hvac:'furnace boiler air conditioning ac heat heating cooling',roofing:'roofer',landscaping:'landscaper lawn garden',painting:'painter','house-cleaning':'cleaner housekeeping','pest-control':'exterminator bugs insects','junk-removal':'haul hauling rubbish trash','tree-services':'arborist','appliance-repair':'washer dryer refrigerator dishwasher stove oven'};
const modifiers=new Set(['a','an','the','my','i','need','help','with','broken','fix','repair','repairs']);
export function matchesServiceSearch(service:{id:string;name:string;jobs:string[];problems:{title:string}[]},query:string){
 const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9\s]/g,' ');
 const terms=normalize(query).split(/\s+/).filter(w=>w&&!modifiers.has(w));
 const text=normalize([service.id,service.name,aliases[service.id]??'',...service.jobs,...service.problems.map(p=>p.title)].join(' '));
 return terms.every(term=>text.includes(term));
}
