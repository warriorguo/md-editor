package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/warriorguo/md-editor/backend/internal/database"
	"github.com/warriorguo/md-editor/backend/internal/models"
)

type ProjectRepository struct {
	db *database.Postgres
}

func NewProjectRepository(db *database.Postgres) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Create(ctx context.Context, name string) (*models.Project, error) {
	project := &models.Project{
		ID:        uuid.New(),
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	query := `
		INSERT INTO projects (id, name, created_at, updated_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, created_at, updated_at
	`

	err := r.db.Pool.QueryRow(ctx, query,
		project.ID, project.Name, project.CreatedAt, project.UpdatedAt,
	).Scan(&project.ID, &project.Name, &project.CreatedAt, &project.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return project, nil
}

func (r *ProjectRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Project, error) {
	query := `
		SELECT id, name, created_at, updated_at, deleted_at
		FROM projects
		WHERE id = $1 AND deleted_at IS NULL
	`

	project := &models.Project{}
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&project.ID, &project.Name, &project.CreatedAt, &project.UpdatedAt, &project.DeletedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return project, nil
}

func (r *ProjectRepository) List(ctx context.Context, page, pageSize int) ([]models.Project, int, error) {
	offset := (page - 1) * pageSize

	countQuery := `SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL`
	var totalCount int
	if err := r.db.Pool.QueryRow(ctx, countQuery).Scan(&totalCount); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, name, created_at, updated_at
		FROM projects
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Pool.Query(ctx, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.Name, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, 0, err
		}
		projects = append(projects, p)
	}

	if projects == nil {
		projects = []models.Project{}
	}

	return projects, totalCount, nil
}

func (r *ProjectRepository) Update(ctx context.Context, id uuid.UUID, name string) (*models.Project, error) {
	query := `
		UPDATE projects
		SET name = $1, updated_at = $2
		WHERE id = $3 AND deleted_at IS NULL
		RETURNING id, name, created_at, updated_at
	`

	project := &models.Project{}
	err := r.db.Pool.QueryRow(ctx, query, name, time.Now(), id).Scan(
		&project.ID, &project.Name, &project.CreatedAt, &project.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return project, nil
}

func (r *ProjectRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE projects
		SET deleted_at = $1, updated_at = $1
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := r.db.Pool.Exec(ctx, query, time.Now(), id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}

	return nil
}
