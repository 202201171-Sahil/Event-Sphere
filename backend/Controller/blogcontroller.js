const cloudinary = require('../config/cloudinary'); // Import Cloudinary config
const Blog = require('../Models/Blog'); // Import Blog model
const { uploadOnCloudinary } = require("../config/cloudinary");

const createBlog = async (req, res) => {
  try {
    // Check if the logged-in user is a college
    const { type } = req.user; // Assuming the user info is available in req.user (set during authentication)

    // Allow blog creation only for college users
    if (type !== 'college') {
      return res.status(403).json({ message: 'You do not have permission to create a blog' });
    }

    // Extract data from the request body
    const { title, content, date, college } = req.body;
    const images = req.files.posters; // The uploaded images will be in req.files

    console.log(`images : ${images}`);

    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const uploadResult = await uploadOnCloudinary(file.path, "/eventsphere/blog");
        return uploadResult ? uploadResult.url : null;
      })
    );

    // Create a new blog post and save it to the database
    const newBlog = new Blog({
      title,
      content,
      college,
      date,
      images: imageUrls, // Store the array of image URLs
    });

    // Save the blog post
    await newBlog.save();

    // Return the response
    res.status(201).json({
      message: 'Blog created successfully!',
      blog: newBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while creating the blog',
      error: error.message,
    });
  }
};

// Function to get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find(); // Retrieve all blog posts
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs' });
  }
};

// Function to get a single blog by its ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching the blog' });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
};
