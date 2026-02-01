package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/warriorguo/md-editor/backend/internal/models"
	"github.com/warriorguo/md-editor/backend/internal/services"
)

type DocumentHandler struct {
	service *services.DocumentService
}

func NewDocumentHandler(service *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{service: service}
}

func (h *DocumentHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	// Get version from header
	versionStr := c.GetHeader("X-Document-Version")
	if versionStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "X-Document-Version header is required"})
		return
	}

	version, err := strconv.Atoi(versionStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid version number"})
		return
	}

	var req models.UpdateDocumentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	doc, err := h.service.Update(c.Request.Context(), id, req.ContentMD, version)
	if err != nil {
		if errors.Is(err, services.ErrDocumentNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
			return
		}
		if errors.Is(err, services.ErrVersionConflict) {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Version conflict",
				"message": "The document has been modified by another session",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update document"})
		return
	}

	c.Header("X-Document-Version", strconv.Itoa(doc.Version))
	c.JSON(http.StatusOK, models.DocumentResponse{
		ID:        doc.ID,
		ProjectID: doc.ProjectID,
		ContentMD: doc.ContentMD,
		Version:   doc.Version,
		UpdatedAt: doc.UpdatedAt,
	})
}
