const { createClient } = require("redis");

class RedisService {
  client = null;

  connectRedis = async () => {
    this.client = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      }
    })
      .on('error', err => console.log('Redis Client Error', err))
    await this.client.connect();
    console.log('Redis connected');
  }

  getData = (key) => {
    return new Promise((resolve, reject) => {
      try {
        const data = this.client.get(key);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  setData = (key, value) => {
    return new Promise((resolve, reject) => {
      try {
        const data = this.client.set(key, value);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new RedisService();
