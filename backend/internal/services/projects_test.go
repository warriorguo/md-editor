package services

import (
	"testing"
)

func TestErrProjectNotFound(t *testing.T) {
	if ErrProjectNotFound.Error() != "project not found" {
		t.Errorf("Expected error message 'project not found', got '%s'", ErrProjectNotFound.Error())
	}
}

func TestNewProjectService(t *testing.T) {
	service := NewProjectService(nil, nil)
	if service == nil {
		t.Error("Expected non-nil service")
	}
}
