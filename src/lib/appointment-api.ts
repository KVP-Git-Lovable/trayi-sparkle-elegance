import { POS_ANON_KEY, POS_URL } from "./pos-supabase";

export interface AppointmentRequest {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  interest: string;
}

// The POS project exposes no `create_online_lead` edge function (verified: 404),
// which is what produced the "Failed to fetch" error. Leads are written straight
// into the `leads` table instead, which accepts anonymous inserts.
const LEADS_ENDPOINT = `${POS_URL}/rest/v1/leads`;

export async function submitAppointmentRequest(request: AppointmentRequest): Promise<unknown> {
  try {
    const response = await fetch(LEADS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: POS_ANON_KEY,
        Authorization: `Bearer ${POS_ANON_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: request.fullName,
        email: request.email || null,
        phone: request.phone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}) as { message?: string });
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit appointment request";
    console.error("submitAppointmentRequest error:", message);
    throw error;
  }
}
