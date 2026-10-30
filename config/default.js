module.exports = {
  Security: {
    mode: "instance", //instance, cluster, sentinel
    ip: "13.59.52.179",
    port: 6379,
    password: "DuoS123",
    sentinels: {
      hosts: "SENTNELS_URL",
      port: 16389,
      name: "redis-cluster",
    },
  },
};
