package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/warriorguo/md-editor/backend/internal/config"
	"github.com/warriorguo/md-editor/backend/internal/database"
	"github.com/warriorguo/md-editor/backend/internal/handlers"
	"github.com/warriorguo/md-editor/backend/internal/repository"
	"github.com/warriorguo/md-editor/backend/internal/services"
)

func main() {
	migrateUp := flag.Bool("migrate-up", false, "Run database migrations up")
	migrateDown := flag.Bool("migrate-down", false, "Run database migrations down")
	flag.Parse()

	cfg := config.Load()

	db, err := database.NewPostgres(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if *migrateUp {
		if err := database.MigrateUp(cfg.DatabaseURL); err != nil {
			log.Fatalf("Failed to run migrations up: %v", err)
		}
		log.Println("Migrations completed successfully")
		return
	}

	if *migrateDown {
		if err := database.MigrateDown(cfg.DatabaseURL); err != nil {
			log.Fatalf("Failed to run migrations down: %v", err)
		}
		log.Println("Migrations rolled back successfully")
		return
	}

	// Auto-migrate on startup in development
	if cfg.Environment == "development" {
		if err := database.MigrateUp(cfg.DatabaseURL); err != nil {
			log.Printf("Warning: Failed to auto-migrate: %v", err)
		}
	}

	// Initialize repositories
	projectRepo := repository.NewProjectRepository(db)
	documentRepo := repository.NewDocumentRepository(db)

	// Initialize services
	projectService := services.NewProjectService(projectRepo, documentRepo)
	documentService := services.NewDocumentService(documentRepo)

	// Initialize handlers
	projectHandler := handlers.NewProjectHandler(projectService)
	documentHandler := handlers.NewDocumentHandler(documentService)

	// Setup router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "X-Document-Version"},
		ExposeHeaders:    []string{"Content-Length", "X-Document-Version"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API routes
	api := router.Group("/api")
	{
		projects := api.Group("/projects")
		{
			projects.POST("", projectHandler.Create)
			projects.GET("", projectHandler.List)
			projects.GET("/:id", projectHandler.Get)
			projects.PATCH("/:id", projectHandler.Update)
			projects.DELETE("/:id", projectHandler.Delete)
			projects.GET("/:id/document", projectHandler.GetDocument)
		}

		documents := api.Group("/documents")
		{
			documents.PUT("/:id", documentHandler.Update)
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Create server
	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Printf("Server started on port %s", cfg.ServerPort)

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
