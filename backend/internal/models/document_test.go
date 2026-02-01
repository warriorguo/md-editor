package models

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestDocumentJSON(t *testing.T) {
	now := time.Now()
	doc := Document{
		ID:        uuid.New(),
		ProjectID: uuid.New(),
		ContentMD: "# Hello World",
		Version:   1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	data, err := json.Marshal(doc)
	if err != nil {
		t.Fatalf("Failed to marshal document: %v", err)
	}

	var decoded Document
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal document: %v", err)
	}

	if decoded.ID != doc.ID {
		t.Errorf("Expected ID %v, got %v", doc.ID, decoded.ID)
	}

	if decoded.ContentMD != doc.ContentMD {
		t.Errorf("Expected ContentMD %s, got %s", doc.ContentMD, decoded.ContentMD)
	}

	if decoded.Version != doc.Version {
		t.Errorf("Expected Version %d, got %d", doc.Version, decoded.Version)
	}
}

func TestDocumentResponse(t *testing.T) {
	now := time.Now()
	response := DocumentResponse{
		ID:        uuid.New(),
		ProjectID: uuid.New(),
		ContentMD: "# Test",
		Version:   2,
		UpdatedAt: now,
	}

	data, err := json.Marshal(response)
	if err != nil {
		t.Fatalf("Failed to marshal response: %v", err)
	}

	var decoded DocumentResponse
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if decoded.Version != 2 {
		t.Errorf("Expected Version 2, got %d", decoded.Version)
	}
}

func TestUpdateDocumentRequest(t *testing.T) {
	req := UpdateDocumentRequest{
		ContentMD: "# Updated Content\n\nThis is updated.",
	}

	data, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("Failed to marshal request: %v", err)
	}

	var decoded UpdateDocumentRequest
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal request: %v", err)
	}

	if decoded.ContentMD != req.ContentMD {
		t.Errorf("Expected ContentMD %s, got %s", req.ContentMD, decoded.ContentMD)
	}
}
