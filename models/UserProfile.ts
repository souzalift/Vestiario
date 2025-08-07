import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  clerkId: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
    favoriteTeams: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true, // Remove o index: true, use apenas unique
  },
  address: {
    street: { type: String },
    number: { type: String },
    complement: { type: String },
    neighborhood: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
  },
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    favoriteTeams: [{ type: String }],
  },
}, {
  timestamps: true,
});

// Não adicionar schema.index({ clerkId: 1 }) pois já tem unique: true
// Se precisar de índices compostos, adicione apenas estes:
// UserProfileSchema.index({ clerkId: 1, createdAt: -1 });

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);