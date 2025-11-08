# k6 Load Testing

This directory contains k6 load testing scripts for the Skyll Platform.

## Installation

### macOS (Homebrew)

```bash
brew install k6
```

### Linux (Debian/Ubuntu)

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows (Chocolatey)

```bash
choco install k6
```

### Docker

```bash
docker run --rm -i grafana/k6 run - <tests/performance/api-load-test.js
```

## Running Tests

### Basic run

```bash
k6 run tests/performance/api-load-test.js
```

### With custom configuration

```bash
k6 run --vus 10 --duration 30s tests/performance/api-load-test.js
```

### Against production (requires API_URL env var)

```bash
API_URL=https://api.skyll.com k6 run tests/performance/api-load-test.js
```

## Writing Tests

See [k6 Documentation](https://k6.io/docs/) for more information on writing performance tests.

## Thresholds

Our load tests are configured with the following thresholds:

- **Response Time**: 95% of requests should complete below 500ms
- **Error Rate**: Should be less than 1%

Adjust these in the test scripts based on your performance requirements.
