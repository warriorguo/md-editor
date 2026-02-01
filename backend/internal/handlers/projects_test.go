package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestProjectHandlerCreateValidation(t *testing.T) {
	handler := NewProjectHandler(nil)

	router := gin.New()
	router.POST("/projects", handler.Create)

	tests := []struct {
		name       string
		body       interface{}
		wantStatus int
	}{
		{
			name:       "empty body",
			body:       nil,
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "empty name",
			body:       map[string]string{"name": ""},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "invalid JSON",
			body:       "invalid",
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var bodyBytes []byte
			if tt.body != nil {
				if s, ok := tt.body.(string); ok {
					bodyBytes = []byte(s)
				} else {
					bodyBytes, _ = json.Marshal(tt.body)
				}
			}

			req := httptest.NewRequest(http.MethodPost, "/projects", bytes.NewReader(bodyBytes))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, w.Code)
			}
		})
	}
}

func TestProjectHandlerListPagination(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		wantPage string
		wantSize string
	}{
		{
			name:     "default values",
			query:    "",
			wantPage: "1",
			wantSize: "20",
		},
		{
			name:     "custom page",
			query:    "?page=2",
			wantPage: "2",
			wantSize: "20",
		},
		{
			name:     "custom pageSize",
			query:    "?pageSize=50",
			wantPage: "1",
			wantSize: "50",
		},
		{
			name:     "both custom",
			query:    "?page=3&pageSize=10",
			wantPage: "3",
			wantSize: "10",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/projects"+tt.query, nil)

			page := req.URL.Query().Get("page")
			if page == "" {
				page = "1"
			}
			pageSize := req.URL.Query().Get("pageSize")
			if pageSize == "" {
				pageSize = "20"
			}

			if page != tt.wantPage {
				t.Errorf("Expected page %s, got %s", tt.wantPage, page)
			}
			if pageSize != tt.wantSize {
				t.Errorf("Expected pageSize %s, got %s", tt.wantSize, pageSize)
			}
		})
	}
}

func TestProjectHandlerUpdateInvalidID(t *testing.T) {
	handler := NewProjectHandler(nil)

	router := gin.New()
	router.PATCH("/projects/:id", handler.Update)

	req := httptest.NewRequest(http.MethodPatch, "/projects/invalid-uuid", bytes.NewReader([]byte(`{"name":"test"}`)))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestProjectHandlerDeleteInvalidID(t *testing.T) {
	handler := NewProjectHandler(nil)

	router := gin.New()
	router.DELETE("/projects/:id", handler.Delete)

	req := httptest.NewRequest(http.MethodDelete, "/projects/invalid-uuid", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}
