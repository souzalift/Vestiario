import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator';
  isActive: boolean;
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator'],
    default: 'operator',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  permissions: [{
    type: String,
    enum: [
      'view_orders',
      'edit_orders',
      'delete_orders',
      'view_products',
      'edit_products',
      'delete_products',
      'view_users',
      'edit_users',
      'delete_users',
      'view_analytics',
      'manage_settings',
    ],
  }],
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index para busca rápida
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ isActive: 1 });

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);