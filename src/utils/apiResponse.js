class ApiResponse{
    constructor(statusCode,data,message="SUCCESS"){
        this.status = statusCode;
        this.data = data;
        this.msg = message;
        this.success = statusCode < 400
    }
}

export {ApiResponse}