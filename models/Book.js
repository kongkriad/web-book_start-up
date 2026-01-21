const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: String,

    bookCode: {
      type: String,
      unique: true,
    },

    coverImage: {
      url: String,
      public_id: String,
    },
    pdfFile: {
      url: String,
      public_id: String,
    },
     addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
