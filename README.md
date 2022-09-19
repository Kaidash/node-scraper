# Scraper

Scraper google shpreadsheet link:
https://docs.google.com/spreadsheets/d/1-77UteBmd69smSq9ZNqlNQnSgWQh0tOHwDfzQE0R9og/edit?usp=sharing


Running dev
---

### 1. Clone the repo

### 2. Add npm dependencies

``` yarn install ```

### 3. Run local mongo using docker

``` docker-compoese up mongodb ```

### 4. Start node with nodemon

``` yarn run dev ```

### 5. Run scraper

```Open http://localhost:8080/api/v1/scraper```

Running prod
---

### 1. Clone the repo

### 2. Run docker compose

``` docker-compose up ```

### 5. Run scraper

```Open http://localhost:8080/api/v1/scraper```