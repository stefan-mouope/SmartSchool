import { Eureka } from 'eureka-js-client';
import os from 'os';

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return "127.0.0.1";
}

const ipAddr = getLocalIp();
const hostName = os.hostname();
const PORT = process.env.PORT || 5000;

const client = new Eureka({
  instance: {
    app: 'service-inscription',
    instanceId: `service-inscription:${hostName}:${PORT}`,
    hostName,
    ipAddr,
    port: { '$': PORT, '@enabled': true },
    vipAddress: 'service-inscription',

    homePageUrl: `http://${ipAddr}:${PORT}/`,
    statusPageUrl: `http://${ipAddr}:${PORT}/health`,
    healthCheckUrl: `http://${ipAddr}:${PORT}/health`,

    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn'
    }
  },
  eureka: {
    // remplcement du host par le nom du service dans docker-compose.yml
    host: 'registry-service',
    // host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/'
  }
});

export default client;
