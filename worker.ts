import app from "vinext/server/fetch-handler";
import { processOperationsAlerts, type AlertEnvironment } from "./src/lib/marketing/operations-alerts";

const worker = {
  ...app,
  async scheduled(controller: unknown, env: AlertEnvironment) {
    void controller;
    const result = await processOperationsAlerts({...env, NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL});
    // Aggregate delivery state only: never log recipient, lead data or credentials.
    console.log("operations-alerts", result);
    if(result.failed) throw new Error("Operations alert delivery requires review");
  },
};

export default worker;
