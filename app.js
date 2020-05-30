const Secret = require(`./Authentication/Secret`).Secret;
const Authorization = require(`./Authentication/Authorization`);
let req = {};
Secret(
  req,
  {
    iss: "sukithaj@gmail.com",
    jti: "38d9bea6-e352-4147-9251-ccf215168ecb",
    sub: "Access client",
    exp: 1591447968,
    tenant: 1,
    company: 4,
    companyName: "duosoftware",
    iat: 1590843190,
  },
  function (msg, key) {
    console.log(msg, key);
    Authorization({ resource: "myUserProfile", action: "read" })(
      req,
      {},
      function (msgx) {
        console.log(msgx);
      }
    );
  }
);
