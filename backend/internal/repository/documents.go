package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/warriorguo/md-editor/backend/internal/database"
	"github.com/warriorguo/md-editor/backend/internal/models"
)

type DocumentRepository struct {
	db *database.Postgres
}

func NewDocumentRepository(db *database.Postgres) *DocumentRepository {
	return &DocumentRepository{db: db}
}

func (r *DocumentRepository) Create(ctx context.Context, projectID uuid.UUID) (*models.Document, error) {
	doc := &models.Document{
		ID:        uuid.New(),
		ProjectID: projectID,
		ContentMD: "",
		Version:   1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	query := `
		INSERT INTO documents (id, project_id, content_md, version, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, project_id, content_md, version, created_at, updated_at
	`

	err := r.db.Pool.QueryRow(ctx, query,
		doc.ID, doc.ProjectID, doc.ContentMD, doc.Version, doc.CreatedAt, doc.UpdatedAt,
	).Scan(&doc.ID, &doc.ProjectID, &doc.ContentMD, &doc.Version, &doc.CreatedAt, &doc.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return doc, nil
}

func (r *DocumentRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Document, error) {
	query := `
		SELECT id, project_id, content_md, version, created_at, updated_at
		FROM documents
		WHERE id = $1
	`

	doc := &models.Document{}
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&doc.ID, &doc.ProjectID, &doc.ContentMD, &doc.Version, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return doc, nil
}

func (r *DocumentRepository) GetByProjectID(ctx context.Context, projectID uuid.UUID) (*models.Document, error) {
	query := `
		SELECT d.id, d.project_id, d.content_md, d.version, d.created_at, d.updated_at
		FROM documents d
		INNER JOIN projects p ON d.project_id = p.id
		WHERE d.project_id = $1 AND p.deleted_at IS NULL
	`

	doc := &models.Document{}
	err := r.db.Pool.QueryRow(ctx, query, projectID).Scan(
		&doc.ID, &doc.ProjectID, &doc.ContentMD, &doc.Version, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return doc, nil
}

func (r *DocumentRepository) Update(ctx context.Context, id uuid.UUID, contentMD string, expectedVersion int) (*models.Document, error) {
	query := `
		UPDATE documents
		SET content_md = $1, version = version + 1, updated_at = $2
		WHERE id = $3 AND version = $4
		RETURNING id, project_id, content_md, version, created_at, updated_at
	`

	doc := &models.Document{}
	err := r.db.Pool.QueryRow(ctx, query, contentMD, time.Now(), id, expectedVersion).Scan(
		&doc.ID, &doc.ProjectID, &doc.ContentMD, &doc.Version, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return doc, nil
}
