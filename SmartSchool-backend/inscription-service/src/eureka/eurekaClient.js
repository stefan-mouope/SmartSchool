import { Eureka } from "eureka-js-client";

const SERVICE_NAME = process.env.EUREKA_APP_NAME || "service-inscription";
const SERVICE_PORT = parseInt(process.env.PORT || "5000", 10);
const SERVICE_HOST = process.env.SERVICE_HOST || "localhost";
const SERVICE_IP = process.env.SERVICE_IP || "127.0.0.1";

const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = parseInt(process.env.EUREKA_PORT || "8761", 10);
const EUREKA_SERVICE_PATH = process.env.EUREKA_SERVICE_PATH || "/eureka/apps/";

const client = new Eureka({
  instance: {
    app: SERVICE_NAME,
    instanceId: process.env.EUREKA_INSTANCE_ID || `${SERVICE_NAME}-${SERVICE_HOST}:${SERVICE_PORT}`,
    hostName: SERVICE_HOST,
    ipAddr: SERVICE_IP,
    port: { $: SERVICE_PORT, "@enabled": true },
    vipAddress: SERVICE_NAME,
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,
    servicePath: EUREKA_SERVICE_PATH,
  },
});

export default client;
