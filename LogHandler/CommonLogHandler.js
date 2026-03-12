var winston = require("winston");
var Transport = require("winston-transport");
var dgram = require("dgram");

// Custom LogstashUDP transport for Winston v3 (replaces winston-logstash-udp)
class LogstashUDP extends Transport {
  constructor(opts) {
    super(opts);
    this.host = opts.host;
    this.port = opts.port;
    this.appName = opts.appName || "app";
    this.client = dgram.createSocket("udp4");
  }

  log(info, callback) {
    setImmediate(() => this.emit("logged", info));
    var logEntry = JSON.stringify({
      "@timestamp": new Date().toISOString(),
      level: info.level,
      message: info.message,
      appName: this.appName,
    });
    var buf = Buffer.from(logEntry);
    this.client.send(buf, 0, buf.length, this.port, this.host, function (err) {
      if (err) {
        console.error("LogstashUDP send error:", err);
      }
    });
    callback();
  }
}

//test
var level = "debug";

if (process.env.LOG_LEVEL) {
  level = process.env.LOG_LEVEL;
}

const transports = [
  new winston.transports.Console({
    level: level,
  }),
];

if (process.env.DEPLOYMENT_ENV != "docker") {
  if (process.env.LOG_PATH) {
    transports.push(
      new winston.transports.File({
        filename: process.env.LOG_PATH + "/logger.log",
        level: level,
        maxsize: 5242880,
        maxFiles: 10,
      }),
    );
  } else {
    transports.push(
      new winston.transports.File({
        filename: "logger.log",
        level: level,
        maxsize: 5242880,
        maxFiles: 10,
      }),
    );
  }
}

if (process.env.SYS_LOG_HOST && process.env.SYS_LOG_PORT) {
  transports.push(
    new LogstashUDP({
      port: process.env.SYS_LOG_PORT,
      appName: process.env.HOST_NAME,
      host: process.env.SYS_LOG_HOST,
      level: level,
    }),
  );
}

var logger = winston.createLogger({
  level: level,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: transports,
});

module.exports.logger = logger;
