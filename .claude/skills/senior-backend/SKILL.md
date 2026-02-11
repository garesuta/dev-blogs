---
name: senior-backend
description: REST API design, db optimization, auth, microservices, backend code review. Node.js/Express/Fastify, PostgreSQL, API security, backend architecture.
---

# Senior Backend Engineer

Backend dev patterns, API design, db optimization, security.

## Quick Start

```bash
python scripts/api_scaffolder.py openapi.yaml --framework express --output src/routes/
python scripts/database_migration_tool.py --connection postgres://localhost/mydb --analyze
python scripts/api_load_tester.py https://api.example.com/users --concurrency 50 --duration 30
```

## Tools

### 1. API Scaffolder

Generates route handlers, middleware, OpenAPI specs from schema definitions.

**Input:** OpenAPI spec (YAML/JSON) | db schema
**Output:** Route handlers, validation middleware, TS types

```bash
# Express routes from OpenAPI
python scripts/api_scaffolder.py openapi.yaml --framework express --output src/routes/

# From db schema
python scripts/api_scaffolder.py --from-db postgres://localhost/mydb --output src/routes/

# Generate spec from existing routes
python scripts/api_scaffolder.py src/routes/ --generate-spec --output openapi.yaml
```

Frameworks: Express (`--framework express`), Fastify (`--framework fastify`), Koa (`--framework koa`)

### 2. DB Migration Tool

Analyzes schemas, detects changes, generates migrations w/ rollback.

```bash
# Analyze & suggest optimizations
python scripts/database_migration_tool.py --connection postgres://localhost/mydb --analyze

# Generate migration from diff
python scripts/database_migration_tool.py --connection postgres://localhost/mydb \
  --compare schema/v2.sql --output migrations/

# Dry-run migration
python scripts/database_migration_tool.py --connection postgres://localhost/mydb \
  --migrate migrations/20240115_add_user_indexes.sql --dry-run
```

### 3. API Load Tester

HTTP load testing w/ configurable concurrency, latency percentiles, throughput metrics.

```bash
# Basic load test
python scripts/api_load_tester.py https://api.example.com/users --concurrency 50 --duration 30

# POST w/ custom headers
python scripts/api_load_tester.py https://api.example.com/orders \
  --method POST \
  --header "Authorization: Bearer token123" \
  --body '{"product_id": 1, "quantity": 2}' \
  --concurrency 100 --duration 60

# Compare endpoints
python scripts/api_load_tester.py https://api.example.com/v1/users https://api.example.com/v2/users \
  --compare --concurrency 50 --duration 30
```

## Workflows

### API Design

1. Define resources & operations (OpenAPI spec)
2. Generate scaffolding: `python scripts/api_scaffolder.py openapi.yaml --framework express --output src/routes/`
3. Implement business logic in generated handlers
4. Validation auto-generated from OpenAPI schema
5. Regenerate spec: `python scripts/api_scaffolder.py src/routes/ --generate-spec --output openapi.yaml`

### DB Optimization

1. Analyze: `python scripts/database_migration_tool.py --connection $DATABASE_URL --analyze`
2. Check slow queries: `EXPLAIN ANALYZE` (look for Seq Scan -> Index Scan)
3. Generate index migrations: `--suggest-indexes --output migrations/`
4. Dry-run: `--migrate migrations/add_indexes.sql --dry-run`
5. Apply & verify improvement

### Security Hardening

1. JWT config: env-sourced secret, short-lived (1h), RS256 preferred
2. Rate limiting: `express-rate-limit` (100 req/15min)
3. Input validation: Zod schemas for all request bodies
4. Load test attack patterns: `--expect-rate-limit`, `--expect-status 400`
5. Security headers: `helmet()` w/ HSTS, CSP, CORP

## Reference Docs

| File | Contains | Use When |
|---|---|---|
| `references/api_design_patterns.md` | REST vs GraphQL, versioning, errors, pagination | Designing APIs |
| `references/database_optimization_guide.md` | Indexing, query optimization, N+1 | Slow queries |
| `references/backend_security_practices.md` | OWASP Top 10, auth, validation | Security hardening |

## Quick Reference

### Response Formats
```json
{"data": {"id": 1, "name": "John"}, "meta": {"requestId": "abc-123"}}
```
```json
{"error": {"code": "VALIDATION_ERROR", "message": "Invalid email", "details": [{"field": "email", "message": "must be valid"}]}, "meta": {"requestId": "abc-123"}}
```

### HTTP Status Codes
| Code | Use |
|---|---|
| 200 | Success (GET/PUT/PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Validation error |
| 401 | Auth required |
| 403 | Permission denied |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

### Index Strategy
```sql
CREATE INDEX idx_users_email ON users(email);                              -- equality
CREATE INDEX idx_orders_user_status ON orders(user_id, status);           -- composite
CREATE INDEX idx_orders_active ON orders(created_at) WHERE status = 'active'; -- partial
CREATE INDEX idx_users_email_name ON users(email) INCLUDE (name);         -- covering
```
