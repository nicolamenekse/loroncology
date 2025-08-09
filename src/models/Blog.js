import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: 'LorOncology AI'
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Onkoloji', 'Tedavi Yöntemleri', 'Hasta Bakımı', 'Araştırmalar', 'Genel']
  },
  readingTime: {
    type: Number
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Slug oluşturma middleware
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '')
      .replace(/\s+/g, '-');
  }
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// Okuma süresini hesaplama (ortalama 200 kelime/dakika)
blogSchema.pre('save', function(next) {
  const wordCount = this.content.split(/\s+/).length;
  this.readingTime = Math.ceil(wordCount / 200);
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;