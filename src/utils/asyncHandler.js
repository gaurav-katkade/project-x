const asyncHandler =(fn)=> async (req,res,next)=>{
        try {
        const response = await fn(req,res,next);
        return response;
        next();
    } catch (error) {
        res.status(error.statusCode || 500).json(
            {
                statusCode:error.statusCode,
                success:false,
                message:error.message,
                error:error.error,
            }
        )
    }
}

// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }

export {asyncHandler};

