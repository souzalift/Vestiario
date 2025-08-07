import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  customization?: {
    name?: string;
    number?: string;
  };
}

export interface IOrder extends Document {
  orderNumber: string;
  customerInfo: {
    clerkId: string;
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true, // Use apenas unique: true, não index: true
  },
  customerInfo: {
    clerkId: { type: String, required: true }, // Remover index: true daqui
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    document: { type: String, required: true },
  },
  shippingAddress: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  items: [{
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true },
    customization: {
      name: { type: String },
      number: { type: String },
    },
  }],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  trackingCode: { type: String },
  notes: { type: String },
}, {
  timestamps: true,
});

// Adicionar apenas os índices necessários (sem duplicatas)
OrderSchema.index({ 'customerInfo.clerkId': 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.clerkId': 1, orderStatus: 1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);