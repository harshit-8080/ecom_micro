
const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
    try {
        const token = req.header("Authorization");
        if (!token) return res.status(403).send("Access denied.");
        //console.log("token = ", token);
        const decoded = jwt.verify(token,"SECRET");
        req.user = decoded;
        // let buf = jwt_decode(token);
        // console.log("buf = ", buf);
        next();
    } catch (error) {
        console.log("check auth error = ", error);
        res.status(400).send(error);
    }
}

module.exports = checkAuth;