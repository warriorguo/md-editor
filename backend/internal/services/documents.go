package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/warriorguo/md-editor/backend/internal/models"
	"github.com/warriorguo/md-editor/backend/internal/repository"
)

var (
	ErrDocumentNotFound    = errors.New("document not found")
	ErrVersionConflict     = errors.New("version conflict")
)

type DocumentService struct {
	documentRepo *repository.DocumentRepository
}

func NewDocumentService(documentRepo *repository.DocumentRepository) *DocumentService {
	return &DocumentService{
		documentRepo: documentRepo,
	}
}

func (s *DocumentService) GetByID(ctx context.Context, id uuid.UUID) (*models.Document, error) {
	doc, err := s.documentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		return nil, ErrDocumentNotFound
	}

	return doc, nil
}

func (s *DocumentService) Update(ctx context.Context, id uuid.UUID, contentMD string, expectedVersion int) (*models.Document, error) {
	// First check if document exists
	existing, err := s.documentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, ErrDocumentNotFound
	}

	// Check version for conflict
	if existing.Version != expectedVersion {
		return nil, ErrVersionConflict
	}

	// Update document
	doc, err := s.documentRepo.Update(ctx, id, contentMD, expectedVersion)
	if err != nil {
		return nil, err
	}
	if doc == nil {
		// This can happen if version changed between check and update
		return nil, ErrVersionConflict
	}

	return doc, nil
}
