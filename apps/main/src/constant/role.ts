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
