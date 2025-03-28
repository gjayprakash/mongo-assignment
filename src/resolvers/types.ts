import mongoose from "mongoose";

// Common types
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductDetails {
  productId: string;
  name: string;
  totalSold: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface GetCustomerSpendingArgs {
  customerId: string;
}

export interface GetTopSellingProductsArgs {
  limit: number;
}

export interface GetSalesAnalyticsArgs {
  startDate: string;
  endDate: string;
}

export interface GetCustomersArgs {
  filter?: CustomerFilter;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CustomerFilter {
  name?: string;
  email?: string;
  minAge?: number;
  maxAge?: number;
  location?: string;
  gender?: string;
}

// Output types
export interface Customer {
  name: string;
  email: string;
  age: number;
  location: string;
  gender: string;
  totalSpending: number;
  totalOrders: number;
}

export interface GetCustomerSpendingOutput {
  customerName: string;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

export interface GetSalesAnalyticsOutput {
  totalRevenue: number;
  completedOrders: number;
  categoryBreakdown: CategoryRevenue[];
}

export interface GetCustomersOutput {
  customers: Customer[];
  pagination: Pagination;
}

export interface GetTopSellingProductOutput {
  products: ProductDetails[];
}

export interface ProductOrderInput {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface PlaceOrderInput {
  customerId: mongoose.Types.ObjectId;
  products: ProductOrderInput[];
}

export interface ProductDetails {
  productId: string;
  name: string;
  category: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface OrderDetails {
  orderId: string;
  totalAmount: number;
  orderDate: Date;
  status: string;
  products: ProductDetails[];
}

export interface GetCustomerOrdersOutput {
  orders: OrderDetails[];
  pagination: Pagination;
}

export interface GetCustomerOrdersArgs {
  customerId: string;
  page?: number;
  limit?: number;
}
