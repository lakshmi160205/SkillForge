import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
      },

      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;