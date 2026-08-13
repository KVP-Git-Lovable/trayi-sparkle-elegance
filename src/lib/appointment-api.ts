export interface AppointmentRequest {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  interest: string;
}

const STOREHAVEN_URL = "https://pdtasnfsdnfttayxibqy.supabase.co";
const STOREHAVEN_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdGFzbmZzZG5mdHRheXhpYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM4MTk0NzIsImV4cCI6MjAzOTM5NTQ3Mn0.DdQ9H7llQVTgOXl3nAH9fI90h7Uu9jZZfDZQG7Sn3gA";

export async function submitAppointmentRequest(request: AppointmentRequest): Promise<any> {
  try {
    const response = await fetch(`${STOREHAVEN_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: STOREHAVEN_ANON_KEY,
        Authorization: `Bearer ${STOREHAVEN_ANON_KEY}`,
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
