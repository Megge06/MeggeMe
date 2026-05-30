FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./

RUN go build -o guestbook .

FROM alpine

COPY --from=builder /app/guestbook /guestbook

CMD ["/guestbook"]