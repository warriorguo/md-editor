package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/warriorguo/md-editor/backend/internal/models"
	"github.com/warriorguo/md-editor/backend/internal/repository"
)

var (
	ErrProjectNotFound = errors.New("project not found")
)

type ProjectService struct {
	projectRepo  *repository.ProjectRepository
	documentRepo *repository.DocumentRepository
}

func NewProjectService(projectRepo *repository.ProjectRepository, documentRepo *repository.DocumentRepository) *ProjectService {
	return &ProjectService{
		projectRepo:  projectRepo,
		documentRepo: documentRepo,
	}
}

func (s *ProjectService) Create(ctx context.Context, name string) (*models.Project, error) {
	project, err := s.projectRepo.Create(ctx, name)
	if err != nil {
		return nil, err
	}

	// Create empty document for the project
	_, err = s.documentRepo.Create(ctx, project.ID)
	if err != nil {
		return nil, err
	}

	return project, nil
}

func (s *ProjectService) List(ctx context.Context, page, pageSize int) (*models.ProjectListResponse, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	projects, totalCount, err := s.projectRepo.List(ctx, page, pageSize)
	if err != nil {
		return nil, err
	}

	return &models.ProjectListResponse{
		Projects:   projects,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}, nil
}

func (s *ProjectService) GetByID(ctx context.Context, id uuid.UUID) (*models.Project, error) {
	project, err := s.projectRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if project == nil {
		return nil, ErrProjectNotFound
	}

	return project, nil
}

func (s *ProjectService) Update(ctx context.Context, id uuid.UUID, name string) (*models.Project, error) {
	project, err := s.projectRepo.Update(ctx, id, name)
	if err != nil {
		return nil, err
	}
	if project == nil {
		return nil, ErrProjectNotFound
	}

	return project, nil
}

func (s *ProjectService) Delete(ctx context.Context, id uuid.UUID) error {
	err := s.projectRepo.SoftDelete(ctx, id)
	if err != nil {
		return ErrProjectNotFound
	}

	return nil
}

func (s *ProjectService) GetDocument(ctx context.Context, projectID uuid.UUID) (*models.Document, error) {
	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	if project == nil {
		return nil, ErrProjectNotFound
	}

	doc, err := s.documentRepo.GetByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}

	return doc, nil
}
