package models

import (
	"time"

	"github.com/google/uuid"
)

type Document struct {
	ID        uuid.UUID `json:"id"`
	ProjectID uuid.UUID `json:"projectId"`
	ContentMD string    `json:"contentMd"`
	Version   int       `json:"version"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UpdateDocumentRequest struct {
	ContentMD string `json:"contentMd"`
}

type DocumentResponse struct {
	ID        uuid.UUID `json:"id"`
	ProjectID uuid.UUID `json:"projectId"`
	ContentMD string    `json:"contentMd"`
	Version   int       `json:"version"`
	UpdatedAt time.Time `json:"updatedAt"`
}
