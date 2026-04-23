package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

func main() {

	//Initialise SQL DB
	db, err := sql.Open("sqlite", "guestbook.db")
	if err != nil {
		log.Fatal(err)
	}

	//Initialize Guestbook Table if non existent
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS entries (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	message TEXT NOT NULL,
	date DATETIME NOT NULL
	)`)
	if err != nil {
		log.Fatal(err)
	}

	database := Database{db: db}

	//Initialise handlers and permanently listen
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/guestbook", database.guestbookHandler)
	http.ListenAndServe(":8080", corsMiddleware(http.DefaultServeMux))
}

// Struct for Guestbook entries in db
type Entry struct {
	Name    string    `json:"name"`
	Message string    `json:"message"`
	Date    time.Time `json:"date"`
}

// Struct for entries from user
type UserEntry struct {
	Name    string `json:"name"`
	Message string `json:"message"`
}

// Ratelimiter to stop spam
// Mutex to only allow one entry into ratelimit at a time
var (
	ratelimiter = map[string]time.Time{}
	rateMu      sync.Mutex
)

// Handle the DB with a Struct to access it
type Database struct {
	db *sql.DB
}

// Just a test to learn go http
func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "System Healthy")
}

// Handles requests to the guestbook
func (d *Database) guestbookHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method == "GET" {
		// Get all entries
		rows, err := d.db.Query("SELECT name, message, date FROM entries")
		if err != nil {
			http.Error(w, "database error", http.StatusInternalServerError)
			return
		}
		defer rows.Close() // close when finished
		entries := []Entry{}
		// Put all entries into an array
		for rows.Next() {
			var e Entry
			err := rows.Scan(&e.Name, &e.Message, &e.Date)
			if err != nil {
				http.Error(w, "scan error", http.StatusInternalServerError)
				return
			}
			entries = append(entries, e)
		}
		// Put entries into json
		json.NewEncoder(w).Encode(entries)
	} else if r.Method == "POST" {
		// Inserting new Entries
		userEntry := UserEntry{}
		err := json.NewDecoder(r.Body).Decode(&userEntry)
		if err != nil {
			http.Error(w, "decoding error", http.StatusBadRequest)
			return
		}
		//Check Message length
		if userEntry.Name == "" || userEntry.Message == "" {
			http.Error(w, "input error", http.StatusBadRequest)
			return
		}
		if len(userEntry.Name) > 50 || len(userEntry.Message) > 1000 {
			http.Error(w, "input too long", http.StatusBadRequest)
			return
		}

		// Check rate limit
		ip, _, _ := net.SplitHostPort(r.RemoteAddr)
		if rateLimit(ip) {
			http.Error(w, "rate limited", http.StatusTooManyRequests)
			return
		}

		// The actual insertion
		_, err = d.db.Exec("INSERT INTO entries (name, message, date) VALUES (?, ?, ?)",
			userEntry.Name, userEntry.Message, time.Now())

		if err != nil {
			http.Error(w, "insertion error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	} else {
		// Error handling
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// cors to handle Access Control
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "https://megge.me")
		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Lock ip for 1 hour
func rateLimit(ip string) bool {
	rateMu.Lock()
	defer rateMu.Unlock()
	last, exists := ratelimiter[ip]
	if exists && time.Since(last) < time.Hour {
		return true
	}
	ratelimiter[ip] = time.Now()
	return false
}
