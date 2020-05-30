var redis = require("ioredis");
var config = require("config");
var util = require("util");
//var resource = config.Host.resource;
//change and modify the secret

var redisip = config.Security.ip;
var redisport = config.Security.port;
var redispass = config.Security.password;
var redismode = config.Security.mode;
var redisdb = config.Security.db;

var redisSetting = {
  port: redisport,
  host: redisip,
  family: 4,
  db: redisdb,
  password: redispass,
  retryStrategy: function (times) {
    var delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: function (err) {
    return true;
  },
};

if (redismode == "sentinel") {
  if (
    (config.Security.sentinels &&
      config.Security.sentinels.hosts &&
      config.Security.sentinels.port,
    config.Security.sentinels.name)
  ) {
    var sentinelHosts = config.Security.sentinels.hosts.split(",");
    if (Array.isArray(sentinelHosts) && sentinelHosts.length > 2) {
      var sentinelConnections = [];

      sentinelHosts.forEach(function (item) {
        sentinelConnections.push({
          host: item,
          port: config.Security.sentinels.port,
        });
      });

      redisSetting = {
        sentinels: sentinelConnections,
        name: config.Security.sentinels.name,
        password: redispass,
      };
    } else {
      console.log("No enough sentinel servers found .........");
    }
  }
}

var redisClient = undefined;

if (redismode != "cluster") {
  redisClient = new redis(redisSetting);
} else {
  var redisHosts = redisip.split(",");
  if (Array.isArray(redisHosts)) {
    redisSetting = [];
    redisHosts.forEach(function (item) {
      redisSetting.push({
        host: item,
        port: redisport,
        family: 4,
        password: redispass,
      });
    });

    var redisClient = new redis.Cluster([redisSetting]);
  } else {
    redisClient = new redis(redisSetting);
  }
}

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

var Secret = function (req, payload, done) {
  if (payload && payload.iss && payload.jti) {
    var issuer = payload.iss;
    var jti = payload.jti;
    ////////////////this is just for testing///////////////////
    //req.user = payload;

    redisClient
      .multi()
      .get(`token:iss:${issuer}:${jti}`)
      .get(`claims:iss:${issuer}:${jti}`)
      .exec(function (err, results) {
        if (err) {
          return done(err);
        }
        if (results && Array.isArray(results) && results.length > 1) {
          if (results[1][0] == null) {
            try {
              req.scope = JSON.parse(results[1][1]);
            } catch (ex) {
              return done(new Error("scope_error"));
            }
          }
          if (results[0][0] == null) {
            return done(null, results[0][1]);
          } else {
            return done(new Error("missing_secret"));
          }
        }
        return done(new Error("missing_secret"));
      });
  } else {
    done(new Error("wrong token format"));
  }
};

var CompanyChatSecret = function (req, payload, done) {
  if (
    payload &&
    payload.iss &&
    payload.jti &&
    payload.company &&
    payload.tenant
  ) {
    var issuer = payload.iss;
    var jti = payload.jti;

    var chatKey = util.format(
      "%d:%d:keys:chat:public",
      payload.tenant,
      payload.company
    );

    redisClient.get(chatKey, function (err, key) {
      if (err) {
        return done(err);
      }
      if (!key) {
        return done(new Error("missing_secret"));
      }
      return done(null, key);
    });
  } else {
    done(new Error("wrong token format"));
  }
};

module.exports.Secret = Secret;

module.exports.CompanyChatSecret = CompanyChatSecret;
