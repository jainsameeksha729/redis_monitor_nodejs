const { MSG } = require("../utils/messages");
const handleResponse = require("../utils/handleResponse");
const APIError = require("../utils/APIError");
const { md5 } = require("../utils/utils");

const { models, model } = require("../sequalize");
const Redis = require("redis");
const RedisStatus = require("redis-status");

exports.list = async (req, res, next) => {
  try {
    let data = await models.redisInfos.findAll();
    handleResponse.success(res, data, 200);
  } catch (error) {
    console.log(error);
    handleResponse.error(
      res,
      new APIError({
        message: MSG.REDIS_NOT_FOUND,
        errors: error,
        status: 400,
      })
    );
  }
};

exports.info = async (req, res, next) => {
  try {
    // let md = md5(host+port)
    let md = req.query.md5;
    // console.log(md)
    let data = await models.redisInfos.findAll({
      where: { md5: md },
    });
    handleResponse.success(res, data, 200);
  } catch (error) {
    console.log(error);
    handleResponse.error(
      res,
      new APIError({
        message: MSG.REDIS_NOT_FOUND,
        errors: error,
        status: 400,
      })
    );
  }
};

exports.monitor = async (req, res, next) => {
  try {
    let md = req.query.md5;

    let redis_info = await models.redisInfos.findAll({
      where: { md5: md },
    });

    if (redis_info.length) {
      console.log("rrrrrrrr", redis_info[0].dataValues)
      let start = new Date().getTime();
      let redis_res = await createRedisClient(redis_info[0].dataValues.host, redis_info[0].dataValues.port, redis_info[0].dataValues.password);
      console.log("redis_res", redis_res);

      if (redis_res.success === "") {
        handleResponse.error(
          res,
          new APIError({
            message: "get redis realtime information error!",
            errors: MSG.REDIS_NOT_RUNNING,
            status: 400,
          })
        );
      } else {
        redis_res.getTime = new Date().getTime() - start;
        handleResponse.success(res, redis_res, 200);
      }
    } else {
      handleResponse.error(
        res,
        new APIError({
          message: "not exist redis informations!",
          errors: MSG.REDIS_NOT_RUNNING,
          status: 400,
        })
      );
    }
  } catch (error) {
    console.log("error", error);
    handleResponse.error(
      res,
      new APIError({
        message: MSG.REDIS_NOT_FOUND,
        errors: error,
        status: 400,
      })
    );
  }
};

exports.ping = async (req, res, next) => {
  try {
    let { host, port, password } = req.query;

    let redis_res = await createRedisClient(host, port, password);
    console.log("redis_res", redis_res);

    if (redis_res.success === "") {
      return handleResponse.error(
        res,
        new APIError({
          message: redis_res.data,
          errors: MSG.REDIS_NOT_RUNNING,
          status: 400,
        })
      );
    } else {
      handleResponse.success(res, redis_res, 200);
    }
  } catch (error) {
    handleResponse.error(
      res,
      new APIError({
        message: MSG.REDIS_NOT_FOUND,
        errors: error,
        status: 400,
      })
    );
  }
};

function createRedisClient(host, port, password) {
  return new Promise((resolve, reject) => {
    try {
      let client = Redis.createClient(port, host);
      let r = {
        info: client.info(),
      };
      client.on("ready", () => {
        r.success = 1;
        r.data = "Ping Success";
        resolve(r);
      });

      client.on("error", () => {
        r.success = 0;
        r.data = "Ping Error";

        resolve(r);
      });
      // return true
    } catch (error) {
      resolve({ success: "", data: "Ping Error!" });
    }
  });
}

exports.add = async (req, res, next) => {
  try {
    let { host, port, password } = req.body;

    let redis_res = await createRedisClient(host, port, password);
    console.log("redis_res", redis_res);

    if (redis_res.success === "") {
      return handleResponse.error(
        res,
        new APIError({
          message: MSG.REDIS_NOT_RUNNING,
          errors: MSG.REDIS_NOT_RUNNING,
          status: 400,
        })
      );
    } else {

      // let md = md5(host+port)
      let md = host+port ;
      // let md = "23";
      // console.log(md)
      let data;
      let redis_info = await models.redisInfos.findAll({
        where: { md5: md },
      });
      if (redis_info.length) {
        redis_info.password = password;

        await models.redisInfos.update(redis_info, {
          where: {
            md5: md,
          },
        });
        data = redis_info[0].dataValues;
        data.success = redis_res.success
        data.password = password;
      } else {
        data = await models.redisInfos.create({
          md5: md,
          host: host,
          port: parseInt(port),
          password: password,
        });

        data = data.dataValues
      }
      data.success = redis_res.success
      console.log("add data ", data)
      handleResponse.success(res, data, 200);
    }
  } catch (error) {
    console.log("error  ", error);
    handleResponse.error(
      res,
      new APIError({
        message: MSG.REDIS_NOT_FOUND,
        errors: error,
        status: 400,
      })
    );
  }
};

exports.del = async (req, res, next) => {
  try {
    let md = req.body.md5;
    console.log(md);
    let data;
    let redis_info = await models.redisInfos.findAll({ where: { md5: md } });
    console.log(redis_info);
    if (redis_info.length) {
      await models.redisInfos.destroy({
        where: {
          md5: md,
        },
      });
      data = {
        status: "Success",
        message: "Successfully deleted",
      };
    } else {
      data = {
        status: "Failed",
        message: "Data not found",
      };
    }
    handleResponse.success(res, data, 200);
  } catch (error) {
    console.log(error);
    handleResponse.error(
      res,
      new APIError({
        message: MSG.REDIS_NOT_FOUND,
        errors: error,
        status: 400,
      })
    );
  }
};

const flushDB = async (port, host, db) => {
  return new Promise((resolve, reject) => {
    try {
      let client = Redis.createClient(port, host, { db });
      client.flushdb();
      let r = {};
      client.on("ready", () => {
        r.success = 1;
        r.data = "Flush Success";
        resolve(r);
      });

      client.on("error", () => {
        r.success = 0;
        r.data = "Flush Error";

        resolve(r);
      });
      // return true
    } catch (error) {
      resolve({ success: "", data: "Flush Error!" });
    }
  });
};
exports.flushAll = async (req, res, next) => {
  try {
    let md = req.body.md5;
    let db = req.body.db;
    let redis_info = await models.redisInfos.findAll({ where: { md5: md } });
    if(redis_info.length) {
      let r = await flushDB(redis_info[0].port,redis_info[0].host, db)

      if(r.success){
        let data = {
          status: "Success",
          message: "Successfully deleted",
        };
    
        handleResponse.success(res, data, 200);
      }else{
        handleResponse.error(
          res,
          new APIError({
            message: r.data,
            errors: error,
            status: 400,
          })
        );
      }
      
    }else{
      handleResponse.error(
        res,
        new APIError({
          message: MSG.REDIS_NOT_FOUND,
          errors: error,
          status: 400,
        })
      );
    }
    
  } catch (error) {
    console.log(error);
    handleResponse.error(
      res,
      new APIError({
        message: MSG.REDIS_NOT_FOUND,
        errors: error,
        status: 400,
      })
    );
  }
};

// exports.jobByTypes = async (req, res, next) => {
//   try {
//     let { jobType } = req.query;
//     let data;

//     if (jobType === "all") {
//       data = await Jobs.find();
//     } else {
//       data = await Jobs.find({ type: jobType });
//     }

//     handleResponse.success(res, data, 200);
//   } catch (error) {
//     handleResponse.error(
//       res,
//       new APIError({
//         message: MSG.JOB_NOT_FOUND,
//         errors: error,
//         status: 400,
//       })
//     );
//   }
// };

// exports.jobByLocation = async (req, res, next) => {
//   try {
//     let { location } = req.query;
//     let data;
//     if (location === "all") {
//       data = await Jobs.find();
//     } else {
//       data = await Jobs.find({ location: location });
//     }

//     handleResponse.success(res, data, 200);
//   } catch (error) {
//     handleResponse.error(
//       res,
//       new APIError({
//         message: MSG.JOB_NOT_FOUND,
//         errors: error,
//         status: 400,
//       })
//     );
//   }
// };

// exports.jobByExperience = async (req, res, next) => {
//   try {
//     let { min, max } = req.query;
//     console.log("min max", min, max)
//     let data = await Jobs.find({
//       experienceMin: { $gte: parseInt(min) },
//       experienceMax: { $lte: parseInt(max) }
//     });

//     handleResponse.success(res, data, 200);
//   } catch (error) {
//     console.log("errorrr", error)
//     handleResponse.error(
//       res,
//       new APIError({
//         message: MSG.JOB_NOT_FOUND,
//         errors: error,
//         status: 400,
//       })
//     );
//   }
// };

// exports.jobByKeyword = async (req, res, next) => {
//   try {
//     let { searchText } = req.query;
//     let data = await Jobs.find({
//       $or: [
//         { companyName: { $regex: searchText, $options: 'i' } },
//         { location: { $regex: searchText, $options: 'i' } },
//         { skills: { $regex: searchText, $options: 'i' }},
//         { type: { $regex: searchText, $options: 'i' } },
//         { title: { $regex: searchText, $options: 'i' } }

//       ],
//     });

//     console.log("dtaaaaa", data)
//     handleResponse.success(res, data, 200);
//   } catch (error) {
//     console.log("ERRROR", error)
//     handleResponse.error(
//       res,
//       new APIError({
//         message: MSG.JOB_NOT_FOUND,
//         errors: error,
//         status: 400,
//       })
//     );
//   }
// };
