package models

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID        uuid.UUID  `json:"id"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"-"`
}

type CreateProjectRequest struct {
	Name string `json:"name" binding:"required,min=1,max=255"`
}

type UpdateProjectRequest struct {
	Name string `json:"name" binding:"required,min=1,max=255"`
}

type ProjectListResponse struct {
	Projects   []Project `json:"projects"`
	TotalCount int       `json:"totalCount"`
	Page       int       `json:"page"`
	PageSize   int       `json:"pageSize"`
}
