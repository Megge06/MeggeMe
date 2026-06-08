package main

import (
	"sync"
	"time"
)

// Ratelimiter to stop spam
// Mutex to only allow one entry into ratelimit at a time
var (
	ratelimiter = map[string]time.Time{}
	rateMu      sync.Mutex
)

// Returns true if the IP is within the 1-hour cooldown window.
func checkRateLimit(ip string) bool {
	rateMu.Lock()
	defer rateMu.Unlock()
	last, exists := ratelimiter[ip]
	return exists && time.Since(last) < time.Hour
}

// Records the IP as having just posted. Call only after a successful insert.
func recordRateLimit(ip string) {
	rateMu.Lock()
	defer rateMu.Unlock()
	ratelimiter[ip] = time.Now()
}

// Deletes old entries into ratelimiter
func rateLimitCleanup(interval time.Duration, maxAge time.Duration) {
	go func() {
		for {
			time.Sleep(interval)
			rateMu.Lock()
			for ip, lastSeen := range ratelimiter {
				if time.Since(lastSeen) > maxAge {
					delete(ratelimiter, ip)
				}
			}
			rateMu.Unlock()
		}
	}()
}
