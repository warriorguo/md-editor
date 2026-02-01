package models

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestProjectJSON(t *testing.T) {
	now := time.Now()
	project := Project{
		ID:        uuid.New(),
		Name:      "Test Project",
		CreatedAt: now,
		UpdatedAt: now,
	}

	data, err := json.Marshal(project)
	if err != nil {
		t.Fatalf("Failed to marshal project: %v", err)
	}

	var decoded Project
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal project: %v", err)
	}

	if decoded.ID != project.ID {
		t.Errorf("Expected ID %v, got %v", project.ID, decoded.ID)
	}

	if decoded.Name != project.Name {
		t.Errorf("Expected Name %s, got %s", project.Name, decoded.Name)
	}
}

func TestProjectListResponse(t *testing.T) {
	response := ProjectListResponse{
		Projects:   []Project{{ID: uuid.New(), Name: "Test"}},
		TotalCount: 1,
		Page:       1,
		PageSize:   20,
	}

	data, err := json.Marshal(response)
	if err != nil {
		t.Fatalf("Failed to marshal response: %v", err)
	}

	var decoded ProjectListResponse
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if len(decoded.Projects) != 1 {
		t.Errorf("Expected 1 project, got %d", len(decoded.Projects))
	}

	if decoded.TotalCount != 1 {
		t.Errorf("Expected TotalCount 1, got %d", decoded.TotalCount)
	}
}
