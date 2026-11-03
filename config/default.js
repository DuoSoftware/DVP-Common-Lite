module.exports = {
  Security: {
    mode: "instance", //instance, cluster, sentinel
    ip: "",
    port: 6379,
    password: "",
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster",
    },
  },
};
