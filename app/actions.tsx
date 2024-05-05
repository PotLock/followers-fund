"use server";

import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";
import {Payout, PAYOUT_EXPIRY} from "./types";
import {redirect} from "next/navigation";

export async function savePayout(payout: Payout, formData: FormData) {
  let newPayout = {
    ...payout,
    created_at: Date.now(),
    title: formData.get("title") as string,
    user1: formData.get("user1") as string,
    user2: formData.get("user2") as string,
    user3: formData.get("user3") as string,
    user4: formData.get("user4") as string,
  }
  await kv.hset(`payout:${payout.id}`, payout);
  await kv.expire(`payout:${payout.id}`, PAYOUT_EXPIRY);
  await kv.zadd("payouts_by_date", {
    score: Number(payout.created_at),
    member: newPayout.id,
  });

  revalidatePath("/payouts");
  redirect(`/payouts/${payout.id}`);
}

export async function votePayout(payout: Payout, userIndex: number) {
  await kv.hincrby(`payout:${payout.id}`, `votes${userIndex}`, 1);

  revalidatePath(`/payouts/${payout.id}`);
  redirect(`/payouts/${payout.id}?results=true`);
}

export async function redirectToPayouts() {
  redirect("/payouts");
}