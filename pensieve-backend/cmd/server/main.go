package main

import (
	"log"
	"net/http"
	"os"

	"github.com/pensieve/pensieve-backend/internal/events"
	httpTransport "github.com/pensieve/pensieve-backend/internal/transport/httpapi"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./pensieve.db"
	}

	store, err := events.NewSQLiteStore(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize event store: %v", err)
	}
	defer store.Close()

	router := httpTransport.NewRouter(store)

	log.Printf("Pensieve backend starting on :%s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
