"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  notes?: string | null;
  product: { name: string };
};

type Order = {
  id: string;
  paymentType: string;
  orderType: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders/today")
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Today Orders</h1>
          <p className="text-sm text-gray-600">
            Orders: {orders.length} | Revenue: ₹{(totalRevenue / 100).toFixed(2)}
          </p>
        </div>

        <a
          href="/pos"
          className="px-4 py-2 rounded bg-black text-white text-sm"
        >
          Go to POS
        </a>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium text-black">Order</span> #{o.id.slice(-6)}
              </div>
              <div>{new Date(o.createdAt).toLocaleString()}</div>
            </div>

            <div className="mt-2 text-sm">
              <span className="inline-block mr-3">
                <b>Type:</b> {o.orderType}
              </span>
              <span className="inline-block mr-3">
                <b>Payment:</b> {o.paymentType}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {o.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <div>
                    {it.product.name} × {it.quantity}
                    {it.notes ? (
                      <span className="text-gray-500"> ({it.notes})</span>
                    ) : null}
                  </div>
                  <div>₹{((it.price * it.quantity) / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(o.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{(o.taxAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{(o.totalAmount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-sm text-gray-600">
            No orders yet today.
          </div>
        )}
      </div>
    </div>
  );
}
