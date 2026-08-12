export interface OnlineOrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  purity?: string;
  metal?: string;
  size?: string;
  productCode?: string;
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

import { POS_ANON_KEY } from "./pos-supabase";

const ORDER_ENDPOINT = "https://pdtasnfsdnfttayxibqy.functions.supabase.co/create_online_order";

export async function createOnlineOrder(payload: CreateOnlineOrderPayload): Promise<OnlineOrderResponse> {
  try {
    const response = await fetch(ORDER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: POS_ANON_KEY,
        Authorization: `Bearer ${POS_ANON_KEY}`,
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
