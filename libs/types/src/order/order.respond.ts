import { Respond, User } from '..';

export interface OrderDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderHistory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  action: string;
  description: string;
}

export interface OrderTrack {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  currentAddress: string;
  status: string;
}

export interface OrderPayment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  method: string;
  amount: number;
  status: string;
}

export interface Shipment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  shippingCarrier: string;
  trackingNumber: string;
  deliveredAt: Date;
  estimatedDeliveryDate: Date;
  status: string;
  order: Order;
}

export interface Order {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress: string;
  shipPhone: string;
  shippingFee: number;
  orderDate: Date;
  note: string;
  status: string;
  total_price: number;
  orderDetails: OrderDetail[];
  histories?: OrderHistory[];
  shipments?: Shipment[];
  orderTracks?: OrderTrack[];
  user: User;
  payment: OrderPayment;
}

// Order Response
export interface CreateOrderResponse extends Respond {
  data: Order;
}

export interface GetAllOrderResponse extends Respond {
  data: Order[];
  total: number;
}

export interface GetOrderByIdResponse extends Respond {
  data: Order;
}

export interface UpdateOrderResponse extends Respond {
  data: Order;
}

// Shipment Response
export interface UpdateOrderShipmentResponse extends Respond {
  data: Shipment;
}

// Tracking Response
export interface UpdateOrderTrackingResponse extends Respond {
  data: OrderTrack;
}

// Order Detail Response
export interface CreateOrderDetailResponse extends Respond {
  data: OrderDetail;
}

export interface GetAllOrderDetailResponse extends Respond {
  data: OrderDetail[];
}

export interface GetOrderDetailByIdResponse extends Respond {
  data: OrderDetail;
}

export interface UpdateOrderDetailResponse extends Respond {
  data: OrderDetail;
}

// Payment Response
export interface CreatePaymentResponse extends Respond {
  link: string;
}
