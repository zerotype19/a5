import type { LeadStatus } from "../db/schema.ts";

export const OUTCOME_TRANSITIONS: Partial<Record<LeadStatus, readonly LeadStatus[]>> = {
  QUALIFIED: ["LOST"],
  ACCEPTED: ["CONTACTED", "LOST"],
  CONTACTED: ["ESTIMATE", "LOST"],
  ESTIMATE: ["WON", "LOST"],
  WON: [],
  LOST: [],
};
export function outcomeTargets(status: LeadStatus): readonly LeadStatus[] {
  return OUTCOME_TRANSITIONS[status] ?? [];
}
export function canRecordOutcome(from: LeadStatus, to: LeadStatus): boolean {
  return from in OUTCOME_TRANSITIONS && (from === to || outcomeTargets(from).includes(to));
}
function money(raw: string): number | null | false {
  if (!raw.trim()) return null;
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(raw.trim())) return false;
  const value = Number(raw);
  return Number.isFinite(value) && value <= 9999999999.99 ? value : false;
}
export function validateOutcome(input: {from: LeadStatus; to: LeadStatus; estimated: string; actual: string; reason: string; followUp: string}) {
  if (!canRecordOutcome(input.from, input.to)) return {ok: false as const, error: "That outcome transition is not allowed."};
  const estimated = money(input.estimated), actual = money(input.actual);
  if (estimated === false || actual === false) return {ok: false as const, error: "Enter non-negative amounts with no more than two decimal places, or leave unknown values blank."};
  const reason = input.reason.trim();
  if (reason.length > 2000 || (input.to === "LOST" && !reason)) return {ok: false as const, error: "A loss reason between 1 and 2,000 characters is required."};
  let followUp: string | null = null;
  if (input.followUp) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.followUp)) return {ok:false as const,error:"Enter a valid follow-up date and time in UTC."};
    const date = new Date(`${input.followUp}:00.000Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,16) !== input.followUp) return {ok:false as const,error:"Enter a valid follow-up date and time in UTC."};
    followUp = date.toISOString();
  }
  if (["WON", "LOST"].includes(input.to)) followUp = null;
  return {ok:true as const,estimated,actual,reason:input.to === "LOST" ? reason : null,followUp};
}
