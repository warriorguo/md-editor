package services

import (
	"errors"
	"testing"
)

func TestErrDocumentNotFound(t *testing.T) {
	if ErrDocumentNotFound.Error() != "document not found" {
		t.Errorf("Expected error message 'document not found', got '%s'", ErrDocumentNotFound.Error())
	}
}

func TestErrVersionConflict(t *testing.T) {
	if ErrVersionConflict.Error() != "version conflict" {
		t.Errorf("Expected error message 'version conflict', got '%s'", ErrVersionConflict.Error())
	}
}

func TestErrorComparison(t *testing.T) {
	err := ErrDocumentNotFound

	if !errors.Is(err, ErrDocumentNotFound) {
		t.Error("Expected errors.Is to return true for ErrDocumentNotFound")
	}

	if errors.Is(err, ErrVersionConflict) {
		t.Error("Expected errors.Is to return false for ErrVersionConflict")
	}
}

func TestNewDocumentService(t *testing.T) {
	service := NewDocumentService(nil)
	if service == nil {
		t.Error("Expected non-nil service")
	}
}
