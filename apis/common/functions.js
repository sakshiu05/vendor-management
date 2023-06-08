const createStatusCodeError = function(statusCode, message, body) {
    //console.log(statusCode);
    return Object.assign(new Error(), {
        statusCode,
        message,
        body: body
    });
};

const badRequestError = function(msg) {
    return createStatusCodeError(422, msg);
  };
  
  const unverifiedError = function(message, body) {
    return createStatusCodeError(412, message, body);
  };
  
  const forbiddenError = function(msg) {
    return createStatusCodeError(403, msg);
  };
  
  const unauthorizedError = function(msg) {
    return createStatusCodeError(401, msg);
  };
  
  const notFoundError = function(msg) {
    return createStatusCodeError(404, msg);
  };
  
  const gonePage = function(msg){
    return createStatusCodeError(400, msg)
  }
  const errorResponse = function(res, message, statusCode) {
    res.statusCode = statusCode;
    return res.json({
      success: false,
      statusCode,
      message
    });
  };
  
  // const errorResponse = function(res, data, message, code) {
  //   res.statusCode = code;
  //   return res.json({
  //     success: false,
  //     code,
  //     data,
  //     message
  //   });
  // };
  
  // Response handlers
  const successResponse = function(res, code, data, message) {
    return res.status(code || 200).json({
      success: true,
      statusCode: code,
      data,
      message
    });
  };
  
  const okResponse = function(res, data, message) {
    res.statusCode = 200;
    if (!message) {
      message = "";
    }
    return successResponse(res, 200, data, message);
  };
  
  const createdResponse = function(res, data, message) {
    return successResponse(res, 201, data, message);
  };
  
  const noContentResponse = function(res, message) {
    return successResponse(res, 204, {}, message);
  };
  
  const generateToken = function(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  
  
  module.exports = {
    badRequestError,
    okResponse,
    errorResponse,
    unverifiedError,
    forbiddenError,
    noContentResponse,
    createdResponse,
    notFoundError,
    unauthorizedError,
    generateToken,
    gonePage
  };
  