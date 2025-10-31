# File Upload Feature Documentation

## Overview
This file upload feature allows users to upload and manage files (images and documents) associated with their projects. The implementation uses Multer for handling multipart/form-data file uploads.

## Supported File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Documents
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Microsoft Excel (.xls, .xlsx)
- Microsoft PowerPoint (.ppt, .pptx)
- Text files (.txt)
- CSV files (.csv)

## File Upload Limits
- **Maximum file size**: 10MB per file
- **Maximum files per upload**: 5 files
- **Storage location**: `uploads/projects/` directory

## API Endpoints

### 1. Upload Files to Project
**POST** `/api/projects/:projectId/files`

Upload one or multiple files to a specific project.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `files` (can upload multiple files)

**Example using cURL:**
```bash
curl -X POST \
  http://localhost:3000/api/projects/507f1f77bcf86cd799439011/files \
  -F "files=@document.pdf" \
  -F "files=@image.jpg"
```

**Response:**
```json
{
  "message": "2 archivo(s) subido(s) exitosamente",
  "files": [
    {
      "filename": "files-1698765432000-123456789.pdf",
      "originalName": "document.pdf",
      "mimetype": "application/pdf",
      "size": 1048576,
      "formattedSize": "1 MB",
      "category": "pdf",
      "uploadedAt": "2025-10-31T01:30:32.000Z",
      "url": "/api/files/files-1698765432000-123456789.pdf"
    }
  ],
  "projectId": "507f1f77bcf86cd799439011"
}
```

### 2. Get Project Files
**GET** `/api/projects/:projectId/files`

Retrieve all files associated with a project.

**Response:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "projectTitle": "My Project",
  "filesCount": 2,
  "files": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "filename": "files-1698765432000-123456789.pdf",
      "originalName": "document.pdf",
      "mimetype": "application/pdf",
      "size": 1048576,
      "formattedSize": "1 MB",
      "category": "pdf",
      "uploadedAt": "2025-10-31T01:30:32.000Z",
      "url": "/api/files/files-1698765432000-123456789.pdf"
    }
  ]
}
```

### 3. Get File Statistics
**GET** `/api/projects/:projectId/files/stats`

Get detailed statistics about files in a project.

**Response:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "projectTitle": "My Project",
  "stats": {
    "totalFiles": 5,
    "totalSize": 5242880,
    "formattedTotalSize": "5 MB",
    "categories": {
      "pdf": {
        "count": 2,
        "totalSize": 2097152,
        "formattedSize": "2 MB"
      },
      "image": {
        "count": 3,
        "totalSize": 3145728,
        "formattedSize": "3 MB"
      }
    },
    "recentFiles": [
      {
        "filename": "files-1698765432000-123456789.jpg",
        "originalName": "photo.jpg",
        "category": "image",
        "uploadedAt": "2025-10-31T01:35:00.000Z",
        "formattedSize": "1.2 MB"
      }
    ]
  }
}
```

### 4. Delete File
**DELETE** `/api/projects/:projectId/files/:fileId`

Delete a specific file from a project.

**Response:**
```json
{
  "message": "Archivo eliminado exitosamente",
  "deletedFile": {
    "filename": "files-1698765432000-123456789.pdf",
    "originalName": "document.pdf"
  }
}
```

### 5. Serve/Download File
**GET** `/api/files/:filename`

Serve or download a file by its filename.

**Response:**
- File content with appropriate headers
- Content-Type set based on file mimetype
- Content-Disposition set for inline viewing or download

## File Categories

Files are automatically categorized based on their MIME type:

- **image**: JPEG, PNG, GIF, WebP files
- **pdf**: PDF documents
- **document**: Word documents, text files
- **spreadsheet**: Excel files, CSV files
- **presentation**: PowerPoint files
- **other**: Any other supported file type

## Security Features

1. **File Type Validation**: Only allowed file types can be uploaded
2. **File Size Limits**: Maximum 10MB per file
3. **Upload Quantity Limits**: Maximum 5 files per upload
4. **Secure File Names**: Generated unique filenames prevent conflicts
5. **Path Validation**: Files are stored in designated upload directory only

## Error Handling

The API handles various error scenarios:

- **File too large**: Returns 400 with appropriate message
- **Too many files**: Returns 400 when exceeding file count limit
- **Invalid file type**: Returns 400 for unsupported file types
- **Project not found**: Returns 404 when project doesn't exist
- **File not found**: Returns 404 when file doesn't exist
- **Server errors**: Returns 500 with error details

## Database Schema

Files are stored as subdocuments in the Project model:

```javascript
files: [
  {
    filename: String,        // Generated unique filename
    originalName: String,    // Original uploaded filename
    mimetype: String,        // File MIME type
    size: Number,           // File size in bytes
    category: String,       // File category (image, pdf, etc.)
    path: String,          // File system path
    uploadedAt: Date       // Upload timestamp
  }
]
```

## Frontend Integration Example

### HTML Form
```html
<form id="uploadForm" enctype="multipart/form-data">
  <input type="file" name="files" multiple accept=".jpg,.png,.pdf,.doc,.docx">
  <button type="submit">Upload Files</button>
</form>
```

### JavaScript (Fetch API)
```javascript
const form = document.getElementById('uploadForm');
const projectId = 'your-project-id';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  
  try {
    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Files uploaded:', result.files);
    } else {
      console.error('Upload failed:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
});
```

## Testing

The file upload feature includes comprehensive tests:

- **Unit Tests**: Test utility functions and middleware
- **Integration Tests**: Test complete API endpoints with file operations
- **Error Handling Tests**: Test various error scenarios
- **File System Tests**: Test actual file upload and deletion

Run tests with:
```bash
npm test
npm run test:integration  # Integration tests only
```

## File Storage Considerations

1. **Backup**: Consider implementing file backup strategies
2. **Cleanup**: Implement periodic cleanup of orphaned files
3. **CDN**: For production, consider using cloud storage (AWS S3, etc.)
4. **Monitoring**: Monitor disk usage and implement alerts
5. **Virus Scanning**: Consider adding virus scanning for uploaded files

## Performance Considerations

1. **Streaming**: Large files are handled with streaming
2. **Concurrent Uploads**: Multiple files processed efficiently
3. **Database Indexing**: File queries optimized with proper indexing
4. **Caching**: Static file serving can be cached
5. **Compression**: Consider implementing file compression for storage

This implementation provides a robust, secure, and scalable file upload solution for the project management system.