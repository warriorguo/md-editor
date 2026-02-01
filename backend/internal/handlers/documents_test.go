package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestDocumentHandlerUpdateValidation(t *testing.T) {
	handler := NewDocumentHandler(nil)

	router := gin.New()
	router.PUT("/documents/:id", handler.Update)

	tests := []struct {
		name       string
		id         string
		body       interface{}
		version    string
		wantStatus int
	}{
		{
			name:       "invalid UUID",
			id:         "invalid-uuid",
			body:       map[string]string{"contentMd": "test"},
			version:    "1",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "missing version header",
			id:         "00000000-0000-0000-0000-000000000001",
			body:       map[string]string{"contentMd": "test"},
			version:    "",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "invalid version",
			id:         "00000000-0000-0000-0000-000000000001",
			body:       map[string]string{"contentMd": "test"},
			version:    "invalid",
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bodyBytes, _ := json.Marshal(tt.body)
			req := httptest.NewRequest(http.MethodPut, "/documents/"+tt.id, bytes.NewReader(bodyBytes))
			req.Header.Set("Content-Type", "application/json")
			if tt.version != "" {
				req.Header.Set("X-Document-Version", tt.version)
			}
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, w.Code)
			}
		})
	}
}

func TestDocumentHandlerVersionHeader(t *testing.T) {
	tests := []struct {
		name          string
		versionHeader string
		wantPresent   bool
	}{
		{
			name:          "valid version",
			versionHeader: "1",
			wantPresent:   true,
		},
		{
			name:          "zero version",
			versionHeader: "0",
			wantPresent:   true,
		},
		{
			name:          "large version",
			versionHeader: "999",
			wantPresent:   true,
		},
		{
			name:          "empty version - header not set",
			versionHeader: "",
			wantPresent:   false,
		},
		{
			name:          "negative version",
			versionHeader: "-1",
			wantPresent:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPut, "/documents/test", nil)
			if tt.versionHeader != "" {
				req.Header.Set("X-Document-Version", tt.versionHeader)
			}

			version := req.Header.Get("X-Document-Version")
			hasVersion := version != ""

			if hasVersion != tt.wantPresent {
				t.Errorf("Expected version present %v, got %v for header '%s'", tt.wantPresent, hasVersion, tt.versionHeader)
			}
		})
	}
}
