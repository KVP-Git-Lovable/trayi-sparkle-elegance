import { POS_ANON_KEY } from "./pos-supabase";

export interface AppointmentRequest {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  interest: string;
}

const STOREHAVEN_URL = "https://pdtasnfsdnfttayxibqy.supabase.co";

export async function submitAppointmentRequest(request: AppointmentRequest): Promise<any> {
  try {
    const response = await fetch(`${STOREHAVEN_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: POS_ANON_KEY,
        Authorization: `Bearer ${POS_ANON_KEY}`,
      },
      body: JSON.stringify({
        name: request.fullName,
        email: request.email,
        phone: request.phone,
        address: `Preferred Date: ${request.preferredDate} | Interest: ${request.interest}`,
        city: "Mangalore",
        country: "India",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit appointment request";
    console.error("submitAppointmentRequest error:", message);
    throw error;
  }
}
