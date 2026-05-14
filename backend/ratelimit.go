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
