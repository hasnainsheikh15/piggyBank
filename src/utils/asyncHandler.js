const asyncHandler = (requestHandler) => {
  // this higher order function always needs to return the input function varna error aayenga..
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
