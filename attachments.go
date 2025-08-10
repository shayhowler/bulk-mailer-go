package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// AttachmentInfo represents information about an attachment file
type AttachmentInfo struct {
	Path         string `json:"path"`
	Name         string `json:"name"`
	Size         int64  `json:"size"`
	Type         string `json:"type"`
	LastModified int64  `json:"lastModified"`
}

// SaveAttachmentFile is deprecated - we now use files directly from their original locations
// This function is kept for backward compatibility but should not be used
func (a *App) SaveAttachmentFile(filename, base64Data string) (string, error) {
	a.log("WARNING: SaveAttachmentFile is deprecated - using files directly from PC now")
	return "", fmt.Errorf("deprecated function - use files directly from PC")
}

// SyncAttachments updates the attachments list in the backend
func (a *App) SyncAttachments(paths []string) string {
	a.attachments = paths
	a.log(fmt.Sprintf("Attachments synced: %d files", len(paths)))
	if len(paths) > 0 {
		a.log(fmt.Sprintf("Attachment files: %v", paths))
	}
	return "Attachments synced"
}

// AddAttachment adds a file attachment by path (no copying)
func (a *App) AddAttachment() string {
	// Check if context is valid
	if a.ctx == nil {
		a.safeLog("ERROR: Context is nil, cannot open file dialog")
		return "{\"error\":\"Context error - please restart the application\"}"
	}

	a.log("Opening file dialog for attachment selection...")

	// In test mode, return a mock file path
	if os.Getenv("TESTING") == "true" {
		a.log("Test mode: returning mock attachment path")
		mockInfo := AttachmentInfo{
			Path: "test-attachment.pdf",
			Name: "test-attachment.pdf",
			Size: 1024,
			Type: "application/pdf",
			LastModified: 0,
		}
		jsonData, _ := json.Marshal(mockInfo)
		return string(jsonData)
	}
	
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File to Attach",
		Filters: []runtime.FileFilter{
			{DisplayName: "Documents", Pattern: "*.pdf;*.doc;*.docx;*.txt;*.rtf"},
			{DisplayName: "Images", Pattern: "*.jpg;*.jpeg;*.png;*.gif;*.bmp;*.svg"},
			{DisplayName: "Archives", Pattern: "*.zip;*.rar;*.7z;*.tar;*.gz"},
			{DisplayName: "Excel Files", Pattern: "*.xlsx;*.xls;*.csv"},
			{DisplayName: "Video Files", Pattern: "*.mp4;*.avi;*.mov;*.mkv;*.wmv"},
			{DisplayName: "Audio Files", Pattern: "*.mp3;*.wav;*.aac;*.flac"},
			{DisplayName: "All Files", Pattern: "*"},
		},
	})

	if err != nil {
		a.log(fmt.Sprintf("ERROR: File dialog failed: %v", err))
		return fmt.Sprintf("{\"error\":\"File selection error: %v\"}", err)
	}

	if file == "" {
		a.log("File selection cancelled by user")
		return "{\"cancelled\":true}"
	}

	// Get file info
	fileInfo, err := os.Stat(file)
	if err != nil {
		a.log(fmt.Sprintf("ERROR: Cannot get file info: %v", err))
		return fmt.Sprintf("{\"error\":\"Cannot get file info: %v\"}", err)
	}

	// Create attachment info
	attachmentInfo := AttachmentInfo{
		Path:         file,
		Name:         filepath.Base(file),
		Size:         fileInfo.Size(),
		Type:         getFileType(file),
		LastModified: fileInfo.ModTime().UnixMilli(),
	}

	// Add to attachments list
	a.attachments = append(a.attachments, file)
	
	// Emit event with attachment info
	attachmentInfoList := []AttachmentInfo{}
	for _, path := range a.attachments {
		if info, err := os.Stat(path); err == nil {
			attachmentInfoList = append(attachmentInfoList, AttachmentInfo{
				Path:         path,
				Name:         filepath.Base(path),
				Size:         info.Size(),
				Type:         getFileType(path),
				LastModified: info.ModTime().UnixMilli(),
			})
		}
	}
	safeEventsEmit(a.ctx, "attachmentsUpdated", attachmentInfoList)
	
	a.log(fmt.Sprintf("Attachment added from PC: %s (size: %d bytes)", file, fileInfo.Size()))
	
	// Return attachment info as JSON
	jsonData, err := json.Marshal(attachmentInfo)
	if err != nil {
		return fmt.Sprintf("{\"error\":\"JSON encoding error: %v\"}", err)
	}
	return string(jsonData)
}

// GetAttachments returns current attachments list with full info
func (a *App) GetAttachments() []AttachmentInfo {
	attachmentInfoList := []AttachmentInfo{}
	for _, path := range a.attachments {
		if info, err := os.Stat(path); err == nil {
			attachmentInfoList = append(attachmentInfoList, AttachmentInfo{
				Path:         path,
				Name:         filepath.Base(path),
				Size:         info.Size(),
				Type:         getFileType(path),
				LastModified: info.ModTime().UnixMilli(),
			})
		} else {
			a.log(fmt.Sprintf("WARNING: Cannot stat attachment file %s: %v", path, err))
		}
	}
	return attachmentInfoList
}

// getFileType returns MIME type based on file extension
func getFileType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	mimeTypes := map[string]string{
		".pdf":  "application/pdf",
		".doc":  "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".csv":  "text/csv",
		".txt":  "text/plain",
		".rtf":  "application/rtf",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".bmp":  "image/bmp",
		".svg":  "image/svg+xml",
		".zip":  "application/zip",
		".rar":  "application/x-rar-compressed",
		".7z":   "application/x-7z-compressed",
		".tar":  "application/x-tar",
		".gz":   "application/gzip",
		".mp4":  "video/mp4",
		".avi":  "video/x-msvideo",
		".mov":  "video/quicktime",
		".mkv":  "video/x-matroska",
		".wmv":  "video/x-ms-wmv",
		".mp3":  "audio/mpeg",
		".wav":  "audio/wav",
		".aac":  "audio/aac",
		".flac": "audio/flac",
	}
	if mimeType, ok := mimeTypes[ext]; ok {
		return mimeType
	}
	return "application/octet-stream"
}
