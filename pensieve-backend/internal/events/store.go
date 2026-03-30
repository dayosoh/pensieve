package events

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// Event represents a domain event in the event store.
type Event struct {
	ID             string          `json:"id"`
	Type           string          `json:"type"`
	Timestamp      string          `json:"timestamp"`
	DeviceID       string          `json:"deviceId"`
	UserID         string          `json:"userId"`
	SequenceNumber int64           `json:"sequenceNumber"`
	Data           json.RawMessage `json:"data"`
	Location       *GeoPoint       `json:"location,omitempty"`
}

// GeoPoint represents a geographic coordinate (Phase 2+).
type GeoPoint struct {
	Latitude  float64  `json:"latitude"`
	Longitude float64  `json:"longitude"`
	Altitude  *float64 `json:"altitude,omitempty"`
	Accuracy  *float64 `json:"accuracy,omitempty"`
}

// SyncRequest represents a batch of events from a device.
type SyncRequest struct {
	SyncID         string            `json:"syncId"`
	SourceDeviceID string            `json:"sourceDeviceId"`
	Events         []Event           `json:"events"`
	VectorClock    map[string]int64  `json:"vectorClock"`
	Timestamp      string            `json:"timestamp"`
}

// SQLiteStore is an event store backed by SQLite for local-first operation.
type SQLiteStore struct {
	db *sql.DB
}

// NewSQLiteStore creates a new SQLite-backed event store.
func NewSQLiteStore(dbPath string) (*SQLiteStore, error) {
	db, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	if err := migrate(db); err != nil {
		db.Close()
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return &SQLiteStore{db: db}, nil
}

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS events (
			id              TEXT PRIMARY KEY,
			type            TEXT NOT NULL,
			timestamp       TEXT NOT NULL,
			device_id       TEXT NOT NULL,
			user_id         TEXT NOT NULL DEFAULT '',
			sequence_number INTEGER NOT NULL,
			data            TEXT NOT NULL,
			location_lat    REAL,
			location_lng    REAL,
			location_alt    REAL,
			location_acc    REAL,
			created_at      TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
		CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
		CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
		CREATE INDEX IF NOT EXISTS idx_events_device_seq ON events(device_id, sequence_number);
	`)
	return err
}

// Append persists a new event to the store.
func (s *SQLiteStore) Append(event Event) error {
	data, err := json.Marshal(event.Data)
	if err != nil {
		return fmt.Errorf("marshal data: %w", err)
	}

	var lat, lng, alt, acc *float64
	if event.Location != nil {
		lat = &event.Location.Latitude
		lng = &event.Location.Longitude
		alt = event.Location.Altitude
		acc = event.Location.Accuracy
	}

	_, err = s.db.Exec(`
		INSERT INTO events (id, type, timestamp, device_id, user_id, sequence_number, data, location_lat, location_lng, location_alt, location_acc)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, event.ID, event.Type, event.Timestamp, event.DeviceID, event.UserID, event.SequenceNumber, string(data), lat, lng, alt, acc)

	return err
}

// GetByID retrieves a single event by ID.
func (s *SQLiteStore) GetByID(id string) (*Event, error) {
	row := s.db.QueryRow(`
		SELECT id, type, timestamp, device_id, user_id, sequence_number, data, location_lat, location_lng, location_alt, location_acc
		FROM events WHERE id = ?
	`, id)

	return scanEvent(row)
}

// List retrieves events with optional filters.
func (s *SQLiteStore) List(limit, offset int, eventType string) ([]Event, error) {
	query := "SELECT id, type, timestamp, device_id, user_id, sequence_number, data, location_lat, location_lng, location_alt, location_acc FROM events"
	args := []interface{}{}

	if eventType != "" {
		query += " WHERE type = ?"
		args = append(args, eventType)
	}

	query += " ORDER BY timestamp DESC"

	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}
	if offset > 0 {
		query += " OFFSET ?"
		args = append(args, offset)
	}

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		e, err := scanEventRow(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, *e)
	}
	return events, rows.Err()
}

// GetEventsSince returns events after a given timestamp for sync.
func (s *SQLiteStore) GetEventsSince(since time.Time, deviceID string) ([]Event, error) {
	rows, err := s.db.Query(`
		SELECT id, type, timestamp, device_id, user_id, sequence_number, data, location_lat, location_lng, location_alt, location_acc
		FROM events
		WHERE timestamp > ? AND device_id != ?
		ORDER BY timestamp ASC
	`, since.UTC().Format(time.RFC3339Nano), deviceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		e, err := scanEventRow(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, *e)
	}
	return events, rows.Err()
}

// Close closes the database connection.
func (s *SQLiteStore) Close() error {
	return s.db.Close()
}

// scanEvent scans a single row into an Event.
func scanEvent(row *sql.Row) (*Event, error) {
	var e Event
	var data string
	var lat, lng, alt, acc *float64

	err := row.Scan(&e.ID, &e.Type, &e.Timestamp, &e.DeviceID, &e.UserID, &e.SequenceNumber, &data, &lat, &lng, &alt, &acc)
	if err != nil {
		return nil, err
	}

	e.Data = json.RawMessage(data)
	if lat != nil && lng != nil {
		e.Location = &GeoPoint{Latitude: *lat, Longitude: *lng, Altitude: alt, Accuracy: acc}
	}
	return &e, nil
}

type rowScanner interface {
	Scan(dest ...interface{}) error
}

func scanEventRow(rows *sql.Rows) (*Event, error) {
	var e Event
	var data string
	var lat, lng, alt, acc *float64

	err := rows.Scan(&e.ID, &e.Type, &e.Timestamp, &e.DeviceID, &e.UserID, &e.SequenceNumber, &data, &lat, &lng, &alt, &acc)
	if err != nil {
		return nil, err
	}

	e.Data = json.RawMessage(data)
	if lat != nil && lng != nil {
		e.Location = &GeoPoint{Latitude: *lat, Longitude: *lng, Altitude: alt, Accuracy: acc}
	}
	return &e, nil
}
