
import formidable from 'formidable';


export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Failed to process upload' });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Here you would typically:
      // 1. Upload the file to your storage service (S3, Cloud Storage, etc.)
      // 2. Get back a URL for the uploaded file
      // For this example, we'll assume you have a function uploadToStorage()
      try {
        const uploadedUrl = await uploadToStorage(file);
        return res.status(200).json({ 
          success: true, 
          url: uploadedUrl 
        });
      } catch (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to store file' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}