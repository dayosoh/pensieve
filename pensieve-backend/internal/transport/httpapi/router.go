package httpapi

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/pensieve/pensieve-backend/internal/events"
)

// NewRouter creates the HTTP router with all API routes.
func NewRouter(store *events.SQLiteStore) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/v1/events", handlePostEvent(store))
	mux.HandleFunc("GET /api/v1/events", handleListEvents(store))
	mux.HandleFunc("GET /api/v1/events/{id}", handleGetEvent(store))
	mux.HandleFunc("POST /api/v1/sync", handleSync(store))
	mux.HandleFunc("GET /api/v1/health", handleHealth())

	return corsMiddleware(mux)
}

func handlePostEvent(store *events.SQLiteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var event events.Event
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		if event.ID == "" || event.Type == "" || event.Timestamp == "" {
			writeError(w, http.StatusBadRequest, "id, type, and timestamp are required")
			return
		}

		if err := store.Append(event); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to store event")
			return
		}

		writeJSON(w, http.StatusCreated, event)
	}
}

func handleListEvents(store *events.SQLiteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
		eventType := r.URL.Query().Get("type")

		if limit <= 0 || limit > 100 {
			limit = 50
		}

		eventList, err := store.List(limit, offset, eventType)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to list events")
			return
		}

		if eventList == nil {
			eventList = []events.Event{}
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"events": eventList,
			"limit":  limit,
			"offset": offset,
		})
	}
}

func handleGetEvent(store *events.SQLiteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			writeError(w, http.StatusBadRequest, "event id required")
			return
		}

		event, err := store.GetByID(id)
		if err != nil {
			writeError(w, http.StatusNotFound, "event not found")
			return
		}

		writeJSON(w, http.StatusOK, event)
	}
}

func handleSync(store *events.SQLiteStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req events.SyncRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid sync request")
			return
		}

		// Append all events from the sync batch
		for _, event := range req.Events {
			if err := store.Append(event); err != nil {
				// Skip duplicates (idempotent)
				if strings.Contains(err.Error(), "UNIQUE constraint") {
					continue
				}
				writeError(w, http.StatusInternalServerError, "failed to sync event")
				return
			}
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"syncId":   req.SyncID,
			"accepted": len(req.Events),
			"status":   "ok",
		})
	}
}

func handleHealth() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
