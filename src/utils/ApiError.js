class ApiError extends Error{
    constructor(
        statusCode,
        error = [],
        message = "something went wrong !!!",
        stack=""
    ){
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.data = null;
        this.success = false;
        if(stack){
            this.stack = stack;
        }else{
            this.stack = Error.captureStackTrace(this,this.constructor);
        }
    }
}
export default ApiError;