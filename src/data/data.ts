export type OrderStatus = "PROCESSING" | "PACKED" | "SHIPPED" | "DELIVERED" | "HOLD";
export type Priority = "HIGH" | "STD" | "LOW";

export interface Order {
  id: string;
  customer: string;
  items: number;
  value: number;
  priority: Priority;
  status: OrderStatus;
  eta: string;
  region: string;
  carrier: string;
  created: string;
  sku: string[];
}

export const orders: Order[] = [
  { id: "ORD-48291", customer: "Meridian Industrial Co.", items: 34, value: 84200, priority: "HIGH", status: "PROCESSING", eta: "Sep 11", region: "Northeast", carrier: "FedEx Freight", created: "Sep 10 08:14", sku: ["SK-9921","SK-4401","SK-2210"] },
  { id: "ORD-48290", customer: "Apex Wholesale Ltd.", items: 12, value: 21500, priority: "STD", status: "PACKED", eta: "Sep 12", region: "Midwest", carrier: "UPS Ground", created: "Sep 10 07:52", sku: ["SK-1102","SK-8831"] },
  { id: "ORD-48289", customer: "Global Preorders Inc.", items: 78, value: 156800, priority: "HIGH", status: "SHIPPED", eta: "Sep 11", region: "West", carrier: "DHL Express", created: "Sep 09 16:30", sku: ["SK-3341","SK-7720","SK-5501","SK-9921"] },
  { id: "ORD-48288", customer: "CoreTech Supply", items: 7, value: 9340, priority: "LOW", status: "DELIVERED", eta: "Sep 10", region: "South", carrier: "USPS Priority", created: "Sep 08 14:00", sku: ["SK-2210"] },
  { id: "ORD-48287", customer: "Pacific Rim Exports", items: 41, value: 67900, priority: "STD", status: "PROCESSING", eta: "Sep 13", region: "West", carrier: "FedEx Freight", created: "Sep 10 09:05", sku: ["SK-4401","SK-1102"] },
  { id: "ORD-48286", customer: "Northern Logistics AG", items: 22, value: 38450, priority: "HIGH", status: "HOLD", eta: "Sep 14", region: "Northeast", carrier: "Maersk Line", created: "Sep 09 11:20", sku: ["SK-6610","SK-9921"] },
  { id: "ORD-48285", customer: "Summit Trade Partners", items: 15, value: 29100, priority: "STD", status: "SHIPPED", eta: "Sep 12", region: "Midwest", carrier: "UPS Ground", created: "Sep 09 09:00", sku: ["SK-8831","SK-3341"] },
  { id: "ORD-48284", customer: "Delta Retail Group", items: 63, value: 112600, priority: "HIGH", status: "PACKED", eta: "Sep 11", region: "South", carrier: "DHL Express", created: "Sep 10 06:45", sku: ["SK-7720","SK-5501","SK-1102"] },
  { id: "ORD-48283", customer: "Silverline Wholesale", items: 9, value: 14800, priority: "LOW", status: "DELIVERED", eta: "Sep 09", region: "Northeast", carrier: "USPS Priority", created: "Sep 07 13:30", sku: ["SK-2210","SK-4401"] },
  { id: "ORD-48282", customer: "Eastern Manufacturing", items: 51, value: 93200, priority: "HIGH", status: "SHIPPED", eta: "Sep 11", region: "Midwest", carrier: "FedEx Freight", created: "Sep 09 08:15", sku: ["SK-6610","SK-9921","SK-7720"] },
  { id: "ORD-48281", customer: "Vantage Supplies Corp.", items: 18, value: 31500, priority: "STD", status: "PROCESSING", eta: "Sep 14", region: "West", carrier: "UPS Ground", created: "Sep 10 10:00", sku: ["SK-3341","SK-8831"] },
  { id: "ORD-48280", customer: "Redwood Industrial", items: 29, value: 47600, priority: "STD", status: "PACKED", eta: "Sep 13", region: "West", carrier: "DHL Express", created: "Sep 10 07:00", sku: ["SK-5501","SK-1102","SK-4401"] },
];

export interface SkuItem {
  sku: string;
  name: string;
  category: string;
  stock: number;
  reorder: number;
  cap: number;
  unit: string;
  value: number;
  location: string;
  supplier: string;
}

export const inventory: SkuItem[] = [
  { sku: "SK-9921", name: "AC Servo Motor 750W", category: "Electronics", stock: 187, reorder: 300, cap: 1200, unit: "pcs", value: 420, location: "WH-01 · Zone A4", supplier: "Siemens AG" },
  { sku: "SK-4401", name: "Industrial Relay Module", category: "Electronics", stock: 892, reorder: 200, cap: 2000, unit: "pcs", value: 85, location: "WH-01 · Zone A2", supplier: "Schneider Electric" },
  { sku: "SK-2210", name: "Stainless Hex Bolt M16", category: "Hardware", stock: 14200, reorder: 5000, cap: 40000, unit: "pcs", value: 1.20, location: "WH-04 · Zone C1", supplier: "Würth Group" },
  { sku: "SK-1102", name: "HDPE Drum 200L", category: "Chemicals", stock: 340, reorder: 100, cap: 800, unit: "pcs", value: 62, location: "WH-02 · Zone D3", supplier: "INEOS Group" },
  { sku: "SK-8831", name: "Polyester Fibre Rolls", category: "Apparel", stock: 78, reorder: 150, cap: 500, unit: "rolls", value: 210, location: "WH-03 · Zone B2", supplier: "Toray Industries" },
  { sku: "SK-3341", name: "FMCG Pack — Hygiene Bundle", category: "FMCG", stock: 6420, reorder: 2000, cap: 15000, unit: "pcs", value: 18, location: "WH-04 · Zone B1", supplier: "Unilever B2B" },
  { sku: "SK-7720", name: "Cold-Chain Insulated Box L", category: "FMCG", stock: 1840, reorder: 600, cap: 4000, unit: "pcs", value: 34, location: "WH-02 · Zone A1", supplier: "Softbox Systems" },
  { sku: "SK-5501", name: "Forklift Tyre 8.25-15", category: "Industrial", stock: 128, reorder: 80, cap: 400, unit: "pcs", value: 310, location: "WH-01 · Zone C2", supplier: "Continental AG" },
  { sku: "SK-6610", name: "Hydraulic Hose 1/2 in 10m", category: "Industrial", stock: 610, reorder: 200, cap: 1500, unit: "pcs", value: 48, location: "WH-01 · Zone C4", supplier: "Parker Hannifin" },
  { sku: "SK-0012", name: "Laptop Sleeve 15 Pro", category: "Electronics", stock: 2340, reorder: 500, cap: 6000, unit: "pcs", value: 22, location: "WH-03 · Zone A3", supplier: "Incase Co." },
];

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  state: string;
  capacity: number;
  active: boolean;
  temp: string;
  staff: number;
  alerts: number;
  sqft: number;
  zones: number;
  docks: number;
}

export const warehouses: Warehouse[] = [
  { id: "WH-01", name: "Newark Hub", location: "Newark, NJ", state: "NJ", capacity: 94, active: true,  temp: "Ambient",   staff: 42, alerts: 1, sqft: 180000, zones: 8, docks: 24 },
  { id: "WH-02", name: "Chicago Central", location: "Chicago, IL", state: "IL", capacity: 71, active: true,  temp: "Cold Chain", staff: 31, alerts: 0, sqft: 120000, zones: 6, docks: 18 },
  { id: "WH-03", name: "Los Angeles Port", location: "Long Beach, CA", state: "CA", capacity: 88, active: true,  temp: "Ambient",   staff: 58, alerts: 3, sqft: 240000, zones: 12, docks: 36 },
  { id: "WH-04", name: "Dallas Fulfillment", location: "Dallas, TX", state: "TX", capacity: 52, active: true,  temp: "Ambient",   staff: 24, alerts: 0, sqft: 95000,  zones: 5, docks: 14 },
  { id: "WH-05", name: "Atlanta Regional", location: "Atlanta, GA", state: "GA", capacity: 63, active: false, temp: "Mixed",     staff: 19, alerts: 2, sqft: 88000,  zones: 4, docks: 12 },
];

export interface Shipment {
  id: string;
  orderId: string;
  customer: string;
  carrier: string;
  tracking: string;
  origin: string;
  destination: string;
  status: "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "EXCEPTION" | "PENDING";
  eta: string;
  dispatched: string;
  weight: string;
  pallets: number;
}

export const shipments: Shipment[] = [
  { id: "SHP-8821", orderId: "ORD-48289", customer: "Global Preorders Inc.", carrier: "DHL Express", tracking: "1234567890123", origin: "WH-01 Newark", destination: "Los Angeles, CA", status: "IN_TRANSIT", eta: "Sep 11", dispatched: "Sep 09 17:00", weight: "1,240 kg", pallets: 3 },
  { id: "SHP-8820", orderId: "ORD-48285", customer: "Summit Trade Partners", carrier: "UPS Ground", tracking: "1Z999AA10123456784", origin: "WH-04 Dallas", destination: "Chicago, IL", status: "IN_TRANSIT", eta: "Sep 12", dispatched: "Sep 09 12:00", weight: "480 kg", pallets: 1 },
  { id: "SHP-8819", orderId: "ORD-48282", customer: "Eastern Manufacturing", carrier: "FedEx Freight", tracking: "789274476699", origin: "WH-01 Newark", destination: "Detroit, MI", status: "OUT_FOR_DELIVERY", eta: "Sep 11", dispatched: "Sep 08 08:00", weight: "2,100 kg", pallets: 6 },
  { id: "SHP-8818", orderId: "ORD-48288", customer: "CoreTech Supply", carrier: "USPS Priority", tracking: "9400111899223822901956", origin: "WH-04 Dallas", destination: "Houston, TX", status: "DELIVERED", eta: "Sep 10", dispatched: "Sep 08 09:30", weight: "95 kg", pallets: 1 },
  { id: "SHP-8817", orderId: "ORD-48283", customer: "Silverline Wholesale", carrier: "USPS Priority", tracking: "9400111899223822901923", origin: "WH-01 Newark", destination: "Boston, MA", status: "DELIVERED", eta: "Sep 09", dispatched: "Sep 07 14:00", weight: "180 kg", pallets: 1 },
  { id: "SHP-8816", orderId: "ORD-48286", customer: "Northern Logistics AG", carrier: "Maersk Line", tracking: "MSKU-0034221", origin: "WH-03 LA Port", destination: "Hamburg, DE", status: "EXCEPTION", eta: "Sep 14", dispatched: "Sep 09 11:00", weight: "3,800 kg", pallets: 10 },
  { id: "SHP-8815", orderId: "ORD-48290", customer: "Apex Wholesale Ltd.", carrier: "UPS Ground", tracking: "1Z999AA10123456700", origin: "WH-04 Dallas", destination: "St. Louis, MO", status: "PENDING", eta: "Sep 12", dispatched: "—", weight: "320 kg", pallets: 1 },
];

export interface AlertItem {
  id: number;
  type: "critical" | "warning" | "info";
  category: "inventory" | "shipment" | "warehouse" | "system" | "order";
  msg: string;
  detail?: string;
  time: string;
  read: boolean;
}

export const alertsData: AlertItem[] = [
  { id: 1, type: "critical", category: "warehouse", msg: "WH-03 — Cold storage unit B2 temp deviation: +4.2°C above threshold", detail: "Sensor ID: TEMP-B2-003. Threshold: 4°C. Current: 8.2°C. Notify facility manager.", time: "2m ago", read: false },
  { id: 2, type: "warning",  category: "order",     msg: "ORD-48286 on HOLD — customs documentation incomplete for Pacific route", detail: "Missing: Commercial Invoice, Packing List. Carrier: Maersk Line.", time: "14m ago", read: false },
  { id: 3, type: "warning",  category: "inventory", msg: "SK-9921 (AC Servo Motor 750W) below reorder point — 187 units remaining", detail: "Reorder point: 300 units. Supplier: Siemens AG. Lead time: 14 days.", time: "28m ago", read: false },
  { id: 4, type: "warning",  category: "inventory", msg: "SK-8831 (Polyester Fibre Rolls) critically low — 78 rolls, reorder at 150", detail: "Reorder point: 150 units. Supplier: Toray Industries. Lead time: 21 days.", time: "45m ago", read: false },
  { id: 5, type: "info",     category: "warehouse", msg: "WH-05 offline for scheduled maintenance — ETA back online Sep 12 08:00", detail: "Maintenance window: Sep 10 20:00 – Sep 12 08:00 UTC. Contact: ops@distroos.com.", time: "1h ago", read: true },
  { id: 6, type: "critical", category: "system",    msg: "Carrier API timeout — 14 shipment status updates delayed (FedEx freight)", detail: "API endpoint: api.fedex.com/track/v1. Error 504. Retrying every 5 min.", time: "1h ago", read: false },
  { id: 7, type: "info",     category: "shipment",  msg: "SHP-8819 out for delivery — Eastern Manufacturing Detroit MI", detail: "Driver: John M. Vehicle: TRK-8812. ETA 11:00 AM local.", time: "2h ago", read: true },
  { id: 8, type: "info",     category: "shipment",  msg: "Batch ORD-48289 dispatch confirmed — 78 line items, 3 pallets en route", detail: "DHL Express PRO: 1234567890123.", time: "2h ago", read: true },
  { id: 9, type: "warning",  category: "warehouse", msg: "WH-01 dock utilisation at 92% — consider overflow to WH-04", time: "3h ago", read: true },
  { id: 10, type: "info",    category: "order",     msg: "ORD-48284 packed and staged — Delta Retail Group 63 items ready", time: "3h ago", read: true },
];

export const revenueData = [
  { d: "Sep 1",  v: 284000, orders: 118 },
  { d: "Sep 2",  v: 312000, orders: 134 },
  { d: "Sep 3",  v: 298000, orders: 121 },
  { d: "Sep 4",  v: 334000, orders: 148 },
  { d: "Sep 5",  v: 289000, orders: 112 },
  { d: "Sep 6",  v: 178000, orders: 72 },
  { d: "Sep 7",  v: 193000, orders: 81 },
  { d: "Sep 8",  v: 356000, orders: 159 },
  { d: "Sep 9",  v: 391000, orders: 172 },
  { d: "Sep 10", v: 418000, orders: 189 },
];

export const topCustomers = [
  { name: "Global Preorders Inc.", orders: 48, revenue: 842000, region: "West" },
  { name: "Meridian Industrial Co.", orders: 31, revenue: 621000, region: "Northeast" },
  { name: "Delta Retail Group", orders: 27, revenue: 489000, region: "South" },
  { name: "Eastern Manufacturing", orders: 22, revenue: 376000, region: "Midwest" },
  { name: "Pacific Rim Exports", orders: 19, revenue: 312000, region: "West" },
];

export const tenants = [
  { id: "ORG-00412", name: "Meridian Group", plan: "Enterprise", mrr: 2490, users: 42, orders: 1284, status: "active",   joined: "Jan 2025", storage: 78 },
  { id: "ORG-00389", name: "Apex Wholesale", plan: "Pro",        mrr: 890,  users: 18, orders: 432,  status: "active",   joined: "Mar 2025", storage: 41 },
  { id: "ORG-00371", name: "Summit Partners", plan: "Pro",       mrr: 890,  users: 12, orders: 318,  status: "active",   joined: "Apr 2025", storage: 29 },
  { id: "ORG-00358", name: "CoreTech Supply", plan: "Starter",   mrr: 249,  users: 5,  orders: 89,   status: "active",   joined: "Jun 2025", storage: 12 },
  { id: "ORG-00341", name: "Pacific Rim Exports", plan: "Enterprise", mrr: 2490, users: 34, orders: 891, status: "active", joined: "Feb 2025", storage: 65 },
  { id: "ORG-00320", name: "Northern Logistics AG", plan: "Pro", mrr: 890,  users: 22, orders: 504,  status: "active",   joined: "May 2025", storage: 55 },
  { id: "ORG-00298", name: "Redwood Industrial", plan: "Starter",mrr: 249,  users: 4,  orders: 41,   status: "trial",    joined: "Sep 2026", storage: 8 },
  { id: "ORG-00281", name: "Vantage Supplies",    plan: "Pro",   mrr: 890,  users: 15, orders: 216,  status: "active",   joined: "Jul 2025", storage: 33 },
  { id: "ORG-00254", name: "Delta Retail Group",  plan: "Enterprise", mrr: 2490, users: 61, orders: 1102, status: "active", joined: "Nov 2024", storage: 88 },
  { id: "ORG-00201", name: "Silverline Wholesale", plan: "Starter", mrr: 0, users: 3,  orders: 12,   status: "churned",  joined: "Aug 2025", storage: 5 },
];
