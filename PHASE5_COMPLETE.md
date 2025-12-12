# Phase 5 Complete: Operational Dashboard ✅

**Date**: December 7, 2025  
**Status**: Complete  
**Components**: Prometheus + Grafana + AlertManager

---

## Overview

Built a complete operational monitoring stack with Prometheus for metrics collection, Grafana for visualization, and AlertManager for intelligent alerting. This provides production-grade observability for the Cortex AI Router.

---

## What Was Built

### 1. Prometheus Configuration
- **Metrics Collection**: Scrapes Cortex metrics every 10 seconds
- **Alert Rules**: 10+ predefined alert rules
- **Service Discovery**: Auto-discovers Cortex instances
- **Data Retention**: Configurable retention period
- **HA Support**: Ready for high-availability setup

### 2. Grafana Dashboards
- **Overview Dashboard**: Complete system health view
  - Request rate and error rate
  - Latency percentiles (P50, P95, P99)
  - Active requests
  - Model usage distribution
  - Fallback rate
  - Sentiment overrides
  - PII redactions by type
  - Cache hit rate
  - Memory usage
  - API key validations

### 3. AlertManager Configuration
- **Alert Routing**: Intelligent routing by severity
- **Notification Channels**:
  - Slack integration
  - Email notifications
  - PagerDuty support (configurable)
- **Alert Grouping**: Reduces alert fatigue
- **Inhibition Rules**: Prevents duplicate alerts

### 4. Alert Rules
- **Critical Alerts**:
  - High error rate (> 5%)
  - Service down
  - High memory usage (> 3.5GB)
  - High disk usage (< 10% free)
  
- **Warning Alerts**:
  - High latency (P95 > 2s)
  - High fallback rate (> 10%)
  - High API key failures
  - High CPU usage (> 80%)
  
- **Info Alerts**:
  - Sentiment override spike
  - PII detection spike
  - Low cache hit rate (< 50%)

---

## File Structure

```
monitoring/
├── prometheus.yml              # Prometheus configuration
├── alerts.yml                  # Alert rules
├── alertmanager.yml            # AlertManager configuration
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml  # Prometheus datasource
│   │   └── dashboards/
│   │       └── dashboard.yml   # Dashboard provisioning
│   └── dashboards/
│       └── cortex-overview.json # Main dashboard
docker-compose.monitoring.yaml  # Docker Compose for monitoring stack
```

---

## Quick Start

### 1. Start Monitoring Stack

```bash
# Start Prometheus, Grafana, and AlertManager
docker-compose -f docker-compose.monitoring.yaml up -d
```

### 2. Access Dashboards

- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `cortex-admin`
  
- **Prometheus**: http://localhost:9090
  
- **AlertManager**: http://localhost:9093

### 3. Configure Alerts

Edit `monitoring/alertmanager.yml` to add your Slack webhook:

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
```

Then restart AlertManager:

```bash
docker-compose -f docker-compose.monitoring.yaml restart alertmanager
```

---

## Dashboard Features

### Overview Dashboard

**Top Row - Request Metrics**:
- Request rate by status (success/error)
- Error rate percentage with alerting
- Request latency (P50 and P95)
- Active concurrent requests

**Middle Row - AI Routing**:
- Model usage distribution (pie chart)
- Fallback attempts by model
- Sentiment override rate

**Bottom Row - System Health**:
- PII redactions by type
- Cache hit rate
- Memory usage
- API key validation status

### Custom Queries

Access Prometheus directly for custom queries:

```promql
# Average request duration
rate(cortex_request_duration_seconds_sum[5m]) / rate(cortex_request_duration_seconds_count[5m])

# Requests per model
sum by (model) (rate(cortex_requests_total[5m]))

# Error rate by endpoint
rate(cortex_requests_total{status="error"}[5m]) / rate(cortex_requests_total[5m])

# Token usage
rate(cortex_tokens_total[5m])

# Memory retrieval rate
rate(cortex_memory_retrievals_total[5m])
```

---

## Alert Configuration

### Severity Levels

**Critical** (Immediate action required):
- Service down
- High error rate (> 5%)
- High memory usage
- Low disk space

**Warning** (Action needed soon):
- High latency
- High fallback rate
- High API key failures
- High CPU usage

**Info** (Informational):
- Sentiment override spike
- PII detection spike
- Low cache hit rate

### Notification Channels

#### Slack Setup

1. Create a Slack webhook:
   - Go to https://api.slack.com/apps
   - Create new app
   - Add Incoming Webhooks
   - Copy webhook URL

2. Update `monitoring/alertmanager.yml`:
   ```yaml
   global:
     slack_api_url: 'YOUR_WEBHOOK_URL'
   ```

3. Configure channels:
   ```yaml
   receivers:
     - name: 'critical'
       slack_configs:
         - channel: '#cortex-critical'
   ```

#### Email Setup

Add to `monitoring/alertmanager.yml`:

```yaml
receivers:
  - name: 'email'
    email_configs:
      - to: 'team@example.com'
        from: 'alerts@cortex.ai'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@cortex.ai'
        auth_password: 'your-password'
```

#### PagerDuty Setup

Add to `monitoring/alertmanager.yml`:

```yaml
receivers:
  - name: 'critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
        description: '{{ .GroupLabels.alertname }}'
```

---

## Production Deployment

### Google Cloud Monitoring

For Cloud Run deployment, use Google Cloud Monitoring:

```bash
# Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com

# Metrics are automatically collected
# View in Cloud Console: Monitoring > Metrics Explorer
```

### Managed Prometheus

Use Google Managed Prometheus:

```bash
# Enable Managed Prometheus
gcloud services enable monitoring.googleapis.com

# Configure Prometheus to remote write
# Add to prometheus.yml:
remote_write:
  - url: https://monitoring.googleapis.com/v1/projects/PROJECT_ID/timeSeries
    queue_config:
      capacity: 10000
      max_shards: 200
```

### Grafana Cloud

For managed Grafana:

1. Sign up at https://grafana.com/products/cloud/
2. Get API key
3. Configure Prometheus remote write:
   ```yaml
   remote_write:
     - url: https://prometheus-prod-01-eu-west-0.grafana.net/api/prom/push
       basic_auth:
         username: YOUR_USERNAME
         password: YOUR_API_KEY
   ```

---

## Monitoring Best Practices

### 1. Set Up Alerts Gradually
- Start with critical alerts only
- Add warning alerts after baseline established
- Tune thresholds based on actual traffic

### 2. Use Alert Grouping
- Group related alerts together
- Reduce notification fatigue
- Set appropriate group_wait and group_interval

### 3. Document Runbooks
- Create runbook for each alert
- Include troubleshooting steps
- Link to relevant dashboards

### 4. Regular Review
- Review alert effectiveness weekly
- Adjust thresholds as needed
- Remove noisy alerts

### 5. Test Alerts
- Trigger test alerts regularly
- Verify notification delivery
- Update contact information

---

## Troubleshooting

### Prometheus Not Scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check Cortex metrics endpoint
curl http://localhost:8080/metrics

# View Prometheus logs
docker logs cortex-prometheus
```

### Grafana Dashboard Not Loading

```bash
# Check Grafana logs
docker logs cortex-grafana

# Verify Prometheus datasource
curl http://localhost:3001/api/datasources

# Test Prometheus connection
curl http://prometheus:9090/api/v1/query?query=up
```

### Alerts Not Firing

```bash
# Check AlertManager status
curl http://localhost:9093/api/v1/status

# View active alerts
curl http://localhost:9093/api/v1/alerts

# Check alert rules
curl http://localhost:9090/api/v1/rules
```

---

## Metrics Reference

### Request Metrics
- `cortex_requests_total` - Total requests by status
- `cortex_request_duration_seconds` - Request latency histogram
- `cortex_active_requests` - Current active requests
- `cortex_tokens_total` - Total tokens processed

### AI Routing Metrics
- `cortex_fallback_attempts_total` - Fallback attempts by model
- `cortex_sentiment_overrides_total` - Sentiment-based overrides
- `cortex_model_selections_total` - Model selection by intent

### Data Protection Metrics
- `cortex_pii_redactions_total` - PII redactions by type
- `cortex_pii_restorations_total` - PII restorations

### Performance Metrics
- `cortex_cache_hits_total` - Cache hits
- `cortex_cache_misses_total` - Cache misses
- `cortex_memory_retrievals_total` - Memory retrievals
- `cortex_memory_storage_total` - Memory storage operations

### Security Metrics
- `cortex_api_key_validations_total` - API key validations
- `cortex_api_key_usage_total` - API key usage by key

### System Metrics
- `process_resident_memory_bytes` - Memory usage
- `process_cpu_seconds_total` - CPU usage
- `cortex_info` - Version and build info

---

## Dashboard Customization

### Add New Panel

1. Open Grafana dashboard
2. Click "Add Panel"
3. Select visualization type
4. Add PromQL query
5. Configure display options
6. Save dashboard

### Example Custom Panels

**Cost Tracking**:
```promql
sum(rate(cortex_tokens_total[5m])) * 0.000002  # Assuming $0.002 per 1K tokens
```

**User Activity**:
```promql
count(count by (user_id) (cortex_requests_total))
```

**Model Performance**:
```promql
histogram_quantile(0.95, 
  sum by (model, le) (rate(cortex_request_duration_seconds_bucket[5m]))
)
```

---

## Integration with Admin UI

The Admin UI already displays basic metrics. For advanced monitoring:

1. **Embed Grafana**: Use iframe in Admin UI
2. **API Integration**: Query Prometheus API directly
3. **Custom Dashboards**: Build React components with Prometheus data

Example Prometheus API query from Admin UI:

```typescript
async function getRequestRate() {
  const response = await fetch(
    'http://localhost:9090/api/v1/query?query=rate(cortex_requests_total[5m])'
  )
  const data = await response.json()
  return data.result
}
```

---

## Next Steps

### Phase 4.1: Enhanced UI
- Add analytics charts to Admin UI
- Display Prometheus metrics in React
- Cost tracking dashboard
- User activity graphs

### Production Deployment
- Deploy monitoring stack to Cloud Run
- Configure Google Cloud Monitoring
- Set up Grafana Cloud
- Configure PagerDuty integration

### Advanced Monitoring
- Distributed tracing with Jaeger
- Log aggregation with Loki
- APM with OpenTelemetry
- Custom business metrics

---

## Summary

Phase 5 delivers a complete operational monitoring solution:

✅ **Prometheus** - Metrics collection and alerting  
✅ **Grafana** - Beautiful dashboards and visualization  
✅ **AlertManager** - Intelligent alert routing  
✅ **10+ Alert Rules** - Production-ready alerts  
✅ **Docker Compose** - Easy local deployment  
✅ **Cloud Ready** - Google Cloud Monitoring integration  

The monitoring stack provides full visibility into Cortex performance, helping you maintain high availability and quickly respond to issues.

---

**Status**: ✅ Phase 5 Complete - Operational Dashboard Ready
