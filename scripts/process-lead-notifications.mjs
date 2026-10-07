/** Manual alternative to the scheduled Worker. No sends without --send and the feature flag. */
import {processOperationsAlerts} from '../src/lib/marketing/operations-alerts.ts';
if (!process.argv.includes('--send')) {
 console.log('Delivery disabled. Use --send only for the approved operations recipient.');
} else {
 const result=await processOperationsAlerts(process.env);
 console.log(JSON.stringify(result));
 if(result.failed)process.exitCode=1;
}
