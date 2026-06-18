package main

import (
	"sync"
	"time"

	"golang.org/x/time/rate"
)

const (
	rateLimitEvery = time.Hour
	rateLimitBurst = 1
)

type limiterEntry struct {
	lim  *rate.Limiter
	seen time.Time
}

var (
	limiters = map[string]*limiterEntry{}
	rateMu   sync.Mutex
)

// allowRateLimit returns true when the request should be accepted.
func allowRateLimit(key string) bool {
	rateMu.Lock()
	defer rateMu.Unlock()
	e, ok := limiters[key]
	if !ok {
		e = &limiterEntry{lim: rate.NewLimiter(rate.Every(rateLimitEvery), rateLimitBurst)}
		limiters[key] = e
	}
	e.seen = time.Now()
	return e.lim.Allow()
}

// Deletes idle entries so the map cannot grow without bound.
func rateLimitCleanup(interval time.Duration, maxAge time.Duration) {
	go func() {
		for {
			time.Sleep(interval)
			rateMu.Lock()
			for key, e := range limiters {
				if time.Since(e.seen) > maxAge {
					delete(limiters, key)
				}
			}
			rateMu.Unlock()
		}
	}()
}
