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
    const response = await fetch(`${STOREHAVEN_URL}/functions/v1/create_online_lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        preferredDate: request.preferredDate,
        interest: request.interest,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit appointment request";
    console.error("submitAppointmentRequest error:", message);
    throw error;
  }
}
