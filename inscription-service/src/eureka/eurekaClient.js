import { Eureka } from 'eureka-js-client';

const client = new Eureka({
  instance: {
    app: 'service-inscription',
    instanceId: 'service-inscription-1',
    hostName: 'localhost',
    ipAddr: '127.0.0.1',
    port: { '$': 5000, '@enabled': true },
    vipAddress: 'service-inscription',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn'
    }
  },
  eureka: {
    host: 'localhost', // ton Eureka Server
    port: 8761,
    servicePath: '/eureka/apps/'
  }
});

export default client;
