const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      index: true
    },
    password: { type: String, required: true }, // hash o legacy plano
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

// normaliza email y hashea si es plano (migración legacy incluida)
UserSchema.pre('save', async function (next) {
  if (this.isModified('email') && typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase();
  }
  if (this.isModified('password') && typeof this.password === 'string') {
    const looksHashed = this.password.startsWith('$2');
    if (!looksHashed) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  next();
});

UserSchema.methods.comparePassword = function (plain) {
  return require('bcryptjs').compare(plain, this.password);
};

module.exports = model('User', UserSchema);
