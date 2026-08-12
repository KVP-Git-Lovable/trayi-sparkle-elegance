export interface OnlineOrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  purity?: string;
  metal?: string;
  size?: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateOnlineOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentMethod: "delivery" | "pickup";
  shippingAddress?: ShippingAddress;
  preferredPickupDate?: string; // ISO date string (YYYY-MM-DD)
  items: OnlineOrderItem[];
  subtotal: number;
  totalAmount: number;
}

export interface OnlineOrderResponse {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
  };
}

const STOREHAVEN_API_URL = import.meta.env.VITE_STOREHAVEN_API_URL || "https://storehaven-essentials.lovable.app";

export async function createOnlineOrder(payload: CreateOnlineOrderPayload): Promise<OnlineOrderResponse> {
  try {
    const response = await fetch(`${STOREHAVEN_API_URL}/functions/v1/create_online_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data: OnlineOrderResponse = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create online order";
    console.error("createOnlineOrder error:", message);
    throw error;
  }
}
