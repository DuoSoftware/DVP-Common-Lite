# Environment variables

DVP-Common-Lite is a shared library. It reads its settings from the config of the service that uses it, by config key (for example `config.Security.ip`), not by environment variable name.

- Each service that uses the library maps these config keys to the variables below in its own `config/custom-environment-variables.js`, and lists them in its own `ENVIRONMENT_VARIABLES.md`.
- `config/custom-environment-variables.js` is used only for local tests and holds only the keys the library reads.
- **Default** is what the library uses when the service does not set the key. Real hosts, URLs and secrets are never written here.
- Whenever the library starts or stops reading a config key or a variable, or a value's meaning changes, update this file in the same change. See `.claude/rules/environment-variables.md`.

## Config keys read from the service

| Config key | Variable | Description | Type | Possible values | Default | Required | Secret |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Security.ip` | `SYS_REDIS_HOST` | Main Redis host. Also used for token checks (Security block). | host | host name or IP; comma-separated list in cluster mode | — | yes | no |
| `Security.mode` | `SYS_REDIS_MODE` | How to connect to the main Redis. | enum | instance \| cluster \| sentinel | — | yes | no |
| `Security.password` | `SYS_REDIS_PASSWORD` | Main Redis password. | string | password | — | yes | yes |
| `Security.port` | `SYS_REDIS_PORT` | Main Redis port. | port | 1–65535 | — | yes | no |
| `Security.sentinels.hosts` | `SYS_REDIS_SENTINEL_HOSTS` | Sentinel hosts, when SYS_REDIS_MODE is sentinel. | list | comma-separated host names | — | no | no |
| `Security.sentinels.name` | `SYS_REDIS_SENTINEL_NAME` | Sentinel master name, when SYS_REDIS_MODE is sentinel. | string | sentinel master name | — | no | no |
| `Security.sentinels.port` | `SYS_REDIS_SENTINEL_PORT` | Sentinel port, when SYS_REDIS_MODE is sentinel. | port | 1–65535 | — | no | no |

## Variables read directly

Read straight from the environment by the library code. These names are reserved and never change.

| Variable | Description | Type | Possible values | Default | Required | Secret |
| --- | --- | --- | --- | --- | --- | --- |
| `DEPLOYMENT_ENV` | docker turns off the log file, so the logger writes to the console only. | string | docker, or unset | unset: console and file | no | no |
| `HOST_NAME` | Host name of the running instance. Also written into every log line by dvp-common. | string | host name | — | yes | no |
| `LOG_LEVEL` | Lowest level the logger writes. | enum | error \| warn \| info \| verbose \| debug \| silly | debug | no | no |
| `LOG_PATH` | Folder for logger.log. Not used when DEPLOYMENT_ENV is docker. | path | folder path, e.g. /var/log/facetone | unset: logger.log in the working folder | no | no |
| `SYS_LOG_HOST` | Logstash host that receives the logs over UDP. Logs are sent only when SYS_LOG_HOST and SYS_LOG_PORT are both set. | host | host name or IP, e.g. logstash.internal | unset: not sent | no | no |
| `SYS_LOG_PORT` | Logstash UDP port. Used with SYS_LOG_HOST. | port | 1–65535 | unset: not sent | no | no |
