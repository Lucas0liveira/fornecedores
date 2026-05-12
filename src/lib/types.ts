export interface Supplier {
  id: string;
  name: string;
  tagline: string;
  category: string;
  whatsapp: string;
  address: string;
  cnpj: string;
  hero: string;
  created_at?: string;
}

export interface Product {
  id: number;
  supplier_id: string;
  name: string;
  brand: string;
  unit: string;
  price: number;
  min_order: number;
  description: string;
  in_stock: boolean;
  image: string;
  keyword: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CartState {
  supplierId: string | null;
  items: Record<number, CartItem>;
}

export interface Profile {
  id: string;
  name: string;
  role: "teacher" | "student";
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
}
