const middlewareObj = {};

middlewareObj.getLogin = function(req, res){
    res.send("login")
}

module.exports = middlewareObj