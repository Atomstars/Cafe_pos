"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  totalOrders: number;
  totalRevenue: number;
  paymentSplit: Record<string, number>;
  topItems: { name: string; quantity: number; revenue: number }[];
  peakHour: string;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/today")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="text-sm text-gray-600">Today overview</p>
        </div>

        <div className="flex gap-2">
          <a href="/pos" className="px-4 py-2 rounded bg-black text-white text-sm">
            POS
          </a>
          <a href="/orders" className="px-4 py-2 rounded border text-sm">
            Orders
          </a>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold">{data.totalOrders}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold">
            ₹{(data.totalRevenue / 100).toFixed(2)}
          </div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Peak Hour</div>
          <div className="text-xl font-semibold">{data.peakHour}</div>
        </div>
      </div>

      {/* Payment split */}
      <div className="border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Payment Split</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="border rounded-lg p-3">
            <div className="text-gray-600">CASH</div>
            <div className="font-semibold">
              ₹{((data.paymentSplit["CASH"] || 0) / 100).toFixed(2)}
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="text-gray-600">UPI</div>
            <div className="font-semibold">
              ₹{((data.paymentSplit["UPI"] || 0) / 100).toFixed(2)}
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="text-gray-600">CARD</div>
            <div className="font-semibold">
              ₹{((data.paymentSplit["CARD"] || 0) / 100).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Top items */}
      <div className="border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Top Selling Items (Today)</h2>

        {data.topItems.length === 0 ? (
          <p className="text-sm text-gray-600">No sales yet today.</p>
        ) : (
          <div className="space-y-2">
            {data.topItems.map((it) => (
              <div
                key={it.name}
                className="flex items-center justify-between border rounded-lg p-3 text-sm"
              >
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-gray-600">Qty: {it.quantity}</div>
                </div>

                <div className="font-semibold">
                  ₹{(it.revenue / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
