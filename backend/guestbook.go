package main

import (
	"database/sql"
	"encoding/json"
	"net"
	"net/http"
	"strconv"
	"time"
)

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

// Handle the DB with a Struct to access it
type Database struct {
	db *sql.DB
}

// Handles requests to the guestbook
func (d *Database) guestbookHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method == "GET" {
		// Get requested entries from URl
		pageStr := r.URL.Query().Get("page")
		limitStr := r.URL.Query().Get("limit")

		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 || limit > 200 {
			limit = 50
		}

		offset := (page - 1) * limit

		// Get all entries
		rows, err := d.db.Query("SELECT name, message, date FROM entries ORDER BY date DESC LIMIT ? OFFSET ?", limit, offset)
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
