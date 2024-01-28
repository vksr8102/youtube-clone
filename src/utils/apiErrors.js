class ApiError extends Error{
    constructor(
        statusCode,
        message = 'An error occurred while processing your request',
        error=[],
        statck = ""
    ){
        super(message);
        this.statusCode=statusCode;
        this.error = error;
        this.data = null,
        this.message=message,
        this.success= false
        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}