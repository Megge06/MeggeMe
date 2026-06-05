package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "modernc.org/sqlite"
)

func main() {

	//Initialise SQL DB
	db, err := sql.Open("sqlite", "/data/guestbook.db")
	if err != nil {
		log.Fatal(err)
	}

	//Initialize Guestbook Table if non existent
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS entries (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	message TEXT NOT NULL,
	date DATETIME NOT NULL,
	avatar TEXT NOT NULL DEFAULT 'phantom.png'
	)`)

	if err != nil {
		log.Fatal(err)
	}
	if err != nil {
		log.Fatal(err)
	}

	database := Database{db: db}

	//Rate limit cleanup routine
	rateLimitCleanup(2*time.Hour, 1*time.Hour)

	//Initialise handlers
	http.HandleFunc("/api/guestbook", database.guestbookHandler)

	//Listen and serve through http.Server in background
	server := &http.Server{
		Addr:    ":8080",
		Handler: corsMiddleware(http.DefaultServeMux),
	}
	go server.ListenAndServe()

	// Listen for shutdown and wait
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	//After shutdown signal is received, wait 10 seconds and shut down
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	server.Shutdown(ctx)
}
