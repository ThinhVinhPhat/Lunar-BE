export enum Role {
  ADMIN = 'Admin',
  CUSTOMER = 'Customer',
  ENGINEER = 'Engineer',
}

export enum OrderStatus {
  ALL_ORDER = 'ALL_ORDER',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  REJECTED = 'Rejected',
}

export enum CommentSort {
  NEWEST = 'NEWEST',
  LOW_RATE = 'LOW_RATE',
  HIGH_RATE = 'HIGH_RATE',
}
export enum DiscountType {
  PERCENTAGE = 'Percentage',
  FIXED = 'Fixed',
}

export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  FAILED = 'Failed',
}

export enum OrderHistoryAction {
  CREATE_ORDER = 'CREATE_ORDER',
  UPDATE_STATUS = 'UPDATE_STATUS',
  ADD_PRODUCT = 'ADD_PRODUCT',
  REMOVE_PRODUCT = 'REMOVE_PRODUCT',
  UPDATE_NOTE = 'UPDATE_NOTE',
  CHANGE_DELIVERY_ADDRESS = 'CHANGE_DELIVERY_ADDRESS',
  SHIPMENT = 'CHANGE_SHIPMENT'
}

export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  PAYPAL = 'PayPal',
  BANK_TRANSFER = 'Bank Transfer',
  CASH_ON_DELIVERY = 'Cash on Delivery',
}

export enum ShipmentStatus {
  PENDING = 'Pending',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
}
