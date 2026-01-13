import Image from "../models/mongo/imageModel.js";

/**
 * Upload a file
 * Handles image and file uploads for course content
 * Stores images in MongoDB instead of filesystem
 */
export const uploadFile = async (req, res) => {
  try {
    // Handle different field names - check req.file which is set by multer.any()
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file provided" 
      });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}-${file.originalname}`;

    // Create image document in MongoDB
    const image = new Image({
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype || "image/png",
      data: file.buffer, // Store binary data
      size: file.size,
      uploadedBy: req.user?._id || null, // If authenticated
    });

    // Save to database
    await image.save();

    // Return the image retrieval URL (matching the route at /api/upload/:imageId)
    const url = `http://${req.get('host')}/api/upload/${image._id}`;

    console.log("✓ Image uploaded successfully:", {
      imageId: image._id,
      filename,
      size: file.size,
      mimetype: file.mimetype,
      url
    });

    return res.status(200).json({
      success: true,
      url,
      imageId: image._id,
      filename,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
    });
  }
};

/**
 * Get image by ID
 * Retrieves image from database and serves it
 */
export const getImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    console.log("📥 Image request received for ID:", imageId);

    // Validate MongoDB ObjectId format
    if (!imageId.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn("⚠️ Invalid image ID format:", imageId);
      return res.status(400).json({
        success: false,
        message: "Invalid image ID format",
      });
    }

    // Find image in database
    const image = await Image.findById(imageId);

    if (!image) {
      console.warn("⚠️ Image not found:", imageId);
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    console.log("✓ Image found:", {
      id: image._id,
      filename: image.filename,
      size: image.data.length,
      mimetype: image.mimetype,
    });

    // Ensure data is a Buffer
    const imageData = image.data instanceof Buffer ? image.data : Buffer.from(image.data);

    // Set response headers
    res.contentType(image.mimetype || 'image/png');
    res.set('Content-Length', imageData.length);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.set('ETag', `"${image._id}"`);
    res.set('Access-Control-Allow-Origin', '*');

    // Send image data as binary
    return res.send(imageData);
  } catch (error) {
    console.error("❌ Get image error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve image",
    });
  }
};
