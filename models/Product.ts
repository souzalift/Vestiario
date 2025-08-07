import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  team: string;
  league: string;
  season: string;
  sizes: Array<{
    size: string;
    stock: number;
  }>;
  colors: string[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: [{ type: String, required: true }],
    category: { type: String, required: true },
    subcategory: { type: String },
    team: { type: String, required: true },
    league: { type: String, required: true },
    season: { type: String, required: true },
    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
      },
    ],
    colors: [{ type: String }],
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    weight: { type: Number, default: 0 },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Índices sem duplicatas
ProductSchema.index({ isActive: 1, isFeatured: -1 });
ProductSchema.index({ category: 1, team: 1 });
ProductSchema.index({ team: 1, league: 1 });
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
