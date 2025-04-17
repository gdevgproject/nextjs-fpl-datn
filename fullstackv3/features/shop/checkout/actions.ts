"use server";

import { securedPlaceOrder } from "./secure-place-order";
import type { PlaceOrderParams, PlaceOrderResponse } from "./types";

/**
 * Server action to place an order safely via secure handling.
 * Wraps the lower-level securedPlaceOrder function.
 * @param params Parameters for placing an order
 * @returns PlaceOrderResponse with success flag and identifiers
 */
export async function placeOrderAction(
  params: PlaceOrderParams
): Promise<PlaceOrderResponse> {
  return securedPlaceOrder(params);
}
