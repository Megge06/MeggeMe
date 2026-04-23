FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY backend/ ./backend/

RUN go build -o guestbook ./backend/

FROM alpine

COPY --from=builder /app/guestbook /guestbook

CMD ["/guestbook"]