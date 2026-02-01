package config

import (
	"os"
	"testing"
)

func TestLoadDefaultConfig(t *testing.T) {
	// Clear any existing env vars
	os.Unsetenv("SERVER_PORT")
	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("ENVIRONMENT")

	cfg := Load()

	if cfg.ServerPort != "8080" {
		t.Errorf("Expected ServerPort '8080', got '%s'", cfg.ServerPort)
	}

	expectedDBURL := "postgres://mdeditor:mdeditor@localhost:5432/mdeditor?sslmode=disable"
	if cfg.DatabaseURL != expectedDBURL {
		t.Errorf("Expected DatabaseURL '%s', got '%s'", expectedDBURL, cfg.DatabaseURL)
	}

	if cfg.Environment != "development" {
		t.Errorf("Expected Environment 'development', got '%s'", cfg.Environment)
	}
}

func TestLoadCustomConfig(t *testing.T) {
	os.Setenv("SERVER_PORT", "3000")
	os.Setenv("DATABASE_URL", "postgres://custom:custom@db:5432/custom")
	os.Setenv("ENVIRONMENT", "production")
	defer func() {
		os.Unsetenv("SERVER_PORT")
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("ENVIRONMENT")
	}()

	cfg := Load()

	if cfg.ServerPort != "3000" {
		t.Errorf("Expected ServerPort '3000', got '%s'", cfg.ServerPort)
	}

	if cfg.DatabaseURL != "postgres://custom:custom@db:5432/custom" {
		t.Errorf("Expected custom DatabaseURL, got '%s'", cfg.DatabaseURL)
	}

	if cfg.Environment != "production" {
		t.Errorf("Expected Environment 'production', got '%s'", cfg.Environment)
	}
}

func TestGetEnv(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue string
		envValue     string
		expected     string
	}{
		{
			name:         "returns default when env not set",
			key:          "TEST_KEY_NOT_SET",
			defaultValue: "default",
			envValue:     "",
			expected:     "default",
		},
		{
			name:         "returns env value when set",
			key:          "TEST_KEY_SET",
			defaultValue: "default",
			envValue:     "custom",
			expected:     "custom",
		},
		{
			name:         "returns empty string when env set to empty",
			key:          "TEST_KEY_EMPTY",
			defaultValue: "default",
			envValue:     "",
			expected:     "default",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			os.Unsetenv(tt.key)
			if tt.envValue != "" {
				os.Setenv(tt.key, tt.envValue)
				defer os.Unsetenv(tt.key)
			}

			result := getEnv(tt.key, tt.defaultValue)
			if result != tt.expected {
				t.Errorf("Expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}
